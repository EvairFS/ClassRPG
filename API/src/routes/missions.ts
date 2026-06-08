import { Router, Request, Response, NextFunction } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success, created } from "../utils/response.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

// 🛡️ Interface para o TypeScript reconhecer o usuário injetado pelo JWT
interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

router.use(requireAuth);

// ── POST /api/missions (Atualizada para pegar o ID do professor logado) ──
router.post("/", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, monster_hp, xp_reward, gold_reward, type, difficulty, deadline } = req.body;
    const teacherId = req.user?.id; 

    if (!title || !monster_hp || !type || !difficulty) {
      throw new BadRequestError("Título, HP, Tipo e Dificuldade são obrigatórios.");
    }

    const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const rows = await q(
      `INSERT INTO missions (title, description, monster_hp, xp_reward, gold_reward, type, difficulty, deadline, teacher_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, Number(monster_hp), Number(xp_reward) || 0, Number(gold_reward) || 0, type, difficulty, finalDeadline, teacherId]
    );

    created(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions/:id (Detalhes de uma missão específica) ──
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mission = await qOne("SELECT * FROM missions WHERE id = $1", [req.params.id]);
    if (!mission) throw new NotFoundError("Missão");
    
    success(res, mission);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/:id/join (Estudante aceitar/entrar em uma missão) ──
router.post("/:id/join", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    
    // Captura o ID do estudante de forma segura
    const studentId = req.headers["x-user-id"] || req.user?.id || "s3";

    // 1. Verifica se a missão existe
    const mission = await qOne("SELECT id FROM missions WHERE id = $1", [missionId]);
    if (!mission) throw new NotFoundError("Missão");

    // 2. Verifica se o estudante já aceitou essa missão antes para evitar duplicidade
    const alreadyJoined = await qOne(
      "SELECT id FROM student_missions WHERE student_id = $1 AND mission_id = $2",
      [studentId, missionId]
    );
    if (alreadyJoined) {
      throw new BadRequestError("Você já está participando desta missão.");
    }

    // 3. Vincula o estudante à missão no banco de dados (tabela intermediária)
    const joinId = `sm${Date.now()}`;
    const rows = await q(
      `INSERT INTO student_missions (id, student_id, mission_id, status, progress) 
       VALUES ($1, $2, $3, 'active', 0) RETURNING *`,
      [joinId, studentId, missionId]
    );

    created(res, rows[0]);
  } catch (err) {
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
      "SELECT * FROM missions WHERE teacher_id = $1 ORDER BY created_at DESC",
      [teacherId]
    );

    success(res, missions);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/missions/:id (PROFESSOR: Deletar uma missão específica) ──
router.delete("/:id", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    const teacherId = req.user?.id;

    // Tenta deletar apenas se a missão pertencer ao professor logado
    const result = await q(
      "DELETE FROM missions WHERE id = $1 AND teacher_id = $2 RETURNING *",
      [missionId, teacherId]
    );

    // Se 'result.length' for 0, significa que não deletou nada (missão não existe ou não é dele)
    if (result.length === 0) {
      throw new NotFoundError("Missão não encontrada ou você não tem permissão para deletá-la.");
    }

    success(res, { message: "Missão removida com sucesso!" });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/answer (ESTUDANTE: Responder com transação e trava de segurança) ──
router.post("/answer", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { question_id, student_answer_index } = req.body;
    const studentId = req.user?.id;

    if (!question_id || student_answer_index === undefined) {
      throw new BadRequestError("ID da pergunta e índice da resposta são obrigatórios.");
    }

    // 1. Inicia uma transação no banco
    await q("BEGIN");

    // 2. Valida se já respondeu corretamente antes
    const alreadyAnswered = await qOne(
      "SELECT id FROM student_battle_logs WHERE student_id = $1 AND question_id = $2 AND is_correct = true",
      [studentId, question_id]
    );

    if (alreadyAnswered) {
      await q("ROLLBACK");
      throw new BadRequestError("Você já respondeu corretamente esta pergunta!");
    }

    // 3. Busca a pergunta
    const question = await qOne("SELECT * FROM questions WHERE id = $1", [question_id]);
    if (!question) {
      await q("ROLLBACK");
      throw new NotFoundError("Pergunta não encontrada.");
    }
    
    // 4. Lógica de acerto/erro
    const isCorrect = student_answer_index === question.correct_index;

    // 5. Registra o log
    await q(
      "INSERT INTO student_battle_logs (student_id, question_id, is_correct) VALUES ($1, $2, $3)",
      [studentId, question_id, isCorrect]
    );

    // 6. SE ACERTOU: Atualiza o progresso do aluno na missão
    if (isCorrect) {
      await q(
        `UPDATE student_missions 
         SET progress = progress + $1 
         WHERE student_id = $2 AND mission_id = $3`,
        [question.damage, studentId, question.mission_id]
      );
    }

    // 7. Finaliza a transação
    await q("COMMIT");

    success(res, {
      correct: isCorrect,
      damage_dealt: isCorrect ? question.damage : 0,
      message: isCorrect ? "Acertou! O HP do monstro diminuiu." : "Resposta incorreta!"
    });
  } catch (err) {
    // Se algo falhar, desfaz as alterações (ROLLBACK)
    await q("ROLLBACK");
    next(err);
  }
});

// ── GET /api/missions/:id/status (ESTUDANTE: Verificar status da batalha) ──
router.get("/:id/status", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id;
    const missionId = req.params.id;

    // Busca o HP do monstro e o progresso do aluno na missão
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

export default router;