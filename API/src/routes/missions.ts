import { randomUUID } from "crypto";
import { Router, Request, Response, NextFunction } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success, created } from "../utils/response.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

router.use(requireAuth);

// ── POST /api/missions (Criar nova missão - Professor) ──
router.post("/", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, monster_hp, xp_reward, gold_reward, type, difficulty, deadline, questions } = req.body;
    const teacherId = req.user?.id; 

    if (!title || !monster_hp || !type || !difficulty) {
      throw new BadRequestError("Título, HP, Tipo e Dificuldade são obrigatórios.");
    }

    const dbDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const rows = await q(
      `INSERT INTO missions (title, description, monster_hp, xp_reward, gold_reward, type, difficulty, deadline, teacher_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, Number(monster_hp), Number(xp_reward) || 0, Number(gold_reward) || 0, type, dbDifficulty, finalDeadline, teacherId]
    );

    const newMission = rows[0];

    if (newMission && questions && Array.isArray(questions)) {
      for (const question of questions) {
        await q(
          `INSERT INTO questions (id, mission_id, statement, options, correct_index, damage) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            randomUUID(), 
            newMission.id, 
            question.statement || question.text, 
            question.options, 
            question.correct_index ?? question.correctIndex, 
            Number(question.damage) || 25
          ]
        );
      }
    }

    created(res, newMission);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/answer (ESTUDANTE: Responder com transação e trava de segurança) ──
router.post("/answer", async (req: CustomRequest, res: Response, next: NextFunction) => {
  let inTransaction = false;
  let missionCompleted = false; // Flag para avisar o frontend se o monstro morreu

  try {
    const { question_id, student_answer_index } = req.body;
    const studentId = req.user?.id;

    if (!question_id || student_answer_index === undefined) {
      throw new BadRequestError("ID da pergunta e índice da resposta são obrigatórios.");
    }

    await q("BEGIN");
    inTransaction = true;

    const alreadyAnswered = await qOne(
      "SELECT id FROM student_battle_logs WHERE student_id = $1 AND question_id = $2 AND is_correct = true",
      [studentId, question_id]
    );

    if (alreadyAnswered) {
      throw new BadRequestError("Você já respondeu corretamente esta pergunta!");
    }

    const question = await qOne("SELECT * FROM questions WHERE id = $1", [question_id]);
    if (!question) {
      throw new NotFoundError("Pergunta não encontrada.");
    }
    
    // ─── BLINDAGEM DE TIPOS E BASES APLICADA AQUI ───
    const rawStudentAnswer = Number(student_answer_index);
    const rawCorrectIndex = Number(question.correct_index);

    const isCorrect = 
      // Caso A: Ambos usam a mesma base (ex: 0 e 0, ou 1 e 1)
      rawStudentAnswer === rawCorrectIndex ||
      // Caso B: Front envia base 0 (0,1,2) e Banco salvou base 1 (1,2,3)
      (rawStudentAnswer + 1) === rawCorrectIndex ||
      // Caso C: Front envia base 1 (1,2,3) e Banco salvou base 0 (0,1,2)
      rawStudentAnswer === (rawCorrectIndex + 1);
    // ────────────────────────────────────────────────

    await q(
      "INSERT INTO student_battle_logs (student_id, question_id, is_correct) VALUES ($1, $2, $3)",
      [studentId, question_id, isCorrect]
    );

    if (isCorrect) {
      // 1. Atualiza o progresso do dano na tabela do aluno
      await q(
        `UPDATE student_missions 
         SET progress = progress + $1, updated_at = NOW() 
         WHERE student_id = $2 AND mission_id = $3`,
        [question.damage, studentId, question.mission_id]
      );

      // 2. Busca o estado atualizado e as recompensas configuradas na missão
      const missionState = await qOne(
        `SELECT sm.progress, sm.status, m.monster_hp, m.xp_reward, m.gold_reward 
         FROM student_missions sm
         JOIN missions m ON sm.mission_id = m.id
         WHERE sm.student_id = $1 AND sm.mission_id = $2`,
        [studentId, question.mission_id]
      );

      // 3. Checa se o monstro morreu (progress >= monster_hp) E se a missão ainda estava 'IN_PROGRESS'
      if (missionState && missionState.progress >= missionState.monster_hp && missionState.status === 'IN_PROGRESS') {
        
        // Altera o status para impedir re-recompensas futuras
        await q(
          `UPDATE student_missions 
           SET status = 'COMPLETED', updated_at = NOW() 
           WHERE student_id = $1 AND mission_id = $2`,
          [studentId, question.mission_id]
        );

        // ADICIONA XP, OURO E CONTADOR DE MISSÕES NA TABELA STUDENTS
        await q(
          `UPDATE students 
           SET xp = xp + $1, 
               gold = gold + $2, 
               missions_completed = missions_completed + 1 
           WHERE id = $3`,
          [Number(missionState.xp_reward), Number(missionState.gold_reward), studentId]
        );

        missionCompleted = true;
      }
    }

    await q("COMMIT");
    inTransaction = false;

    // Retorna a resposta contendo se a missão foi finalizada
    success(res, {
      correct: isCorrect,
      damage_dealt: isCorrect ? question.damage : 0,
      mission_completed: missionCompleted,
      message: missionCompleted 
        ? "Vitória! Você derrotou o monstro e suas recompensas de XP e Ouro foram creditadas!" 
        : (isCorrect ? "Acertou! O HP do monstro diminuiu." : "Resposta incorreta!")
    });
  } catch (err) {
    if (inTransaction) {
      await q("ROLLBACK").catch(() => {}); 
    }
    next(err);
  }
});

// ── GET /api/missions/my-missions (PROFESSOR: Ver missões criadas por ele) ──
router.get("/my-missions", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      throw new BadRequestError("Professor não identificado.");
    }

    const missions = await q(
      "SELECT * FROM missions WHERE teacher_id = $1",
      [teacherId]
    );

    success(res, missions);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions (Buscar TODAS as missões com o progresso do aluno logado) ──
router.get("/", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id; 

    const queryText = `
      SELECT 
        m.*, 
        sm.status, 
        COALESCE(sm.progress, 0) as progress, 
        COALESCE(sm.total, m.monster_hp) as total
      FROM missions m
      LEFT JOIN student_missions sm 
        ON sm.mission_id = m.id AND sm.student_id = $1
    `;

    const missions = await q(queryText, [studentId]);
    
    success(res, missions);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions/:id (Detalhes da missão + Pergaminho de Questões) ──
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mission = await qOne("SELECT * FROM missions WHERE id = $1", [req.params.id]);
    if (!mission) throw new NotFoundError("Missão");
    
    const questions = await q("SELECT * FROM questions WHERE mission_id = $1", [req.params.id]);
    
    success(res, { 
      ...mission, 
      questions: questions || [] 
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions/:id/status (ESTUDANTE: Verificar status da batalha) ──
router.get("/:id/status", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;
    const missionId = req.params.id;

    const result = await qOne(
      `SELECT m.monster_hp, sm.progress 
       FROM student_missions sm
       JOIN missions m ON sm.mission_id = m.id
       WHERE sm.student_id = $1 AND sm.mission_id = $2`,
      [studentId, missionId]
    );

    if (!result) throw new NotFoundError("Missão não encontrada ou não iniciada.");

    const defeated = result.progress >= result.monster_hp;

    success(res, {
      monster_hp: result.monster_hp,
      current_progress: result.progress,
      is_defeated: defeated,
      message: defeated ? "Parabéns! Monstro derrotado!" : "O monstro ainda está vivo."
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/:id/join (Estudante aceitar/entrar em uma missão) ──
router.post("/:id/join", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    const studentId = req.user?.id; 

    if (!studentId) {
      throw new BadRequestError("Estudante não identificado na sessão.");
    }

    const mission = await qOne("SELECT id, monster_hp FROM missions WHERE id = $1", [missionId]);
    if (!mission) throw new NotFoundError("Missão");

    const alreadyJoined = await qOne(
      "SELECT id FROM student_missions WHERE student_id = $1 AND mission_id = $2",
      [studentId, missionId]
    );
    if (alreadyJoined) {
      throw new BadRequestError("Você já está participando desta missão.");
    }

    const studentMissionId = randomUUID();

    const rows = await q(
      `INSERT INTO student_missions (
        id,
        student_id, 
        mission_id, 
        status, 
        progress, 
        total, 
        current_monster_hp, 
        current_student_hp,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, 'IN_PROGRESS', 0, $4, $4, 100, NOW(), NOW()) RETURNING *`,
      [studentMissionId, studentId, missionId, Number(mission.monster_hp)]
    );

    created(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/missions/:id (PROFESSOR: Deletar uma missão específica) ──
router.delete("/:id", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    const teacherId = req.user?.id;

    const result = await q(
      "DELETE FROM missions WHERE id = $1 AND teacher_id = $2 RETURNING *",
      [missionId, teacherId]
    );

    if (result.length === 0) {
      throw new NotFoundError("Missão não encontrada ou você não tem permissão para deletá-la.");
    }

    success(res, { message: "Missão removida com sucesso!" });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/student/profile (Buscar dados reais do estudante logado) ──
router.get("/profile", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      throw new BadRequestError("Estudante não identificado.");
    }

    const student = await qOne(
      "SELECT id, classroom, xp, level, patent, streak, gold FROM students WHERE id = $1",
      [studentId]
    );

    if (!student) {
      throw new NotFoundError("Estudante não encontrado no banco.");
    }

    success(res, student);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/:id/finish (ESTUDANTE: Concluir missão vinda do front-end) ──
router.post("/:id/finish", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    const studentId = req.user?.id; 

    if (!studentId) {
      throw new BadRequestError("Estudante não autenticado.");
    }

    const mission = await qOne(
      "SELECT xp_reward, gold_reward, monster_hp FROM missions WHERE id = $1", 
      [missionId]
    );
    if (!mission) {
      throw new NotFoundError("Missão não encontrada.");
    }

    const studentMission = await qOne(
      "SELECT status FROM student_missions WHERE student_id = $1 AND mission_id = $2",
      [studentId, missionId]
    );

    if (studentMission && studentMission.status === "COMPLETED") {
      throw new BadRequestError("Você já concluiu esta missão!");
    }

    await q(
      `UPDATE student_missions 
       SET status = 'COMPLETED', progress = $1, updated_at = NOW() 
       WHERE student_id = $2 AND mission_id = $3`,
      [Number(mission.monster_hp), studentId, missionId]
    );

    await q(
      `UPDATE students 
       SET xp = xp + $1, 
           gold = gold + $2, 
           missions_completed = missions_completed + 1 
       WHERE id = $3`,
      [Number(mission.xp_reward), Number(mission.gold_reward), studentId]
    );

    success(res, { 
      message: "Vitória registrada com sucesso! Recompensas creditadas no banco de dados." 
    });

  } catch (err) {
    next(err);
  }
});

export default router;