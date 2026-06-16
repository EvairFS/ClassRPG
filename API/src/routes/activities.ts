import { Router, Request, Response, NextFunction } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, createActivitySchema, submitActivitySchema } from "../middleware/validate.js";
import { success, created } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

// 🛡️ Interface estendida para ler as propriedades injetadas pelo middleware de autenticação
interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

router.use(requireAuth);

// ── GET /api/activities ──
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await q("SELECT * FROM activities ORDER BY deadline ASC");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── 👑 PROFESSOR: GET /api/activities/submissions/pending ──
// Rota para o painel do professor listar todas as respostas que aguardam correção
router.get("/submissions/pending", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== "teacher") {
      return res.status(403).json({ error: "Acesso restrito a professores." });
    }

    const rows = await q(
      `SELECT 
        sa.id AS submission_id,
        sa.submission,
        sa.status,
        sa.created_at,
        a.title AS activity_title,
        a.id AS activity_id,
        u.name AS student_name,
        s.classroom
       FROM student_activities sa
       JOIN activities a ON sa.activity_id = a.id
       JOIN students s ON sa.student_id = s.id
       JOIN users u ON s.id = u.id
       WHERE sa.status = 'pending'
       ORDER BY sa.created_at ASC`
    );
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── 👑 PROFESSOR: POST /api/activities/submissions/:id/grade ──
// Rota onde o professor decide se o envio está 'correct' ou 'wrong'
router.post("/submissions/:id/grade", async (req: CustomRequest, res: Response, next: NextFunction) => {
  let inTransaction = false;
  try {
    const submissionId = req.params.id;
    const { evaluation, feedback } = req.body; // Espera 'correct' ou 'wrong'

    if (req.user?.role !== "teacher") {
      return res.status(403).json({ error: "Acesso restrito a professores." });
    }

    if (evaluation !== "correct" && evaluation !== "wrong") {
      return res.status(400).json({ error: "Avaliação inválida. Use 'correct' ou 'wrong'." });
    }

    // Busca os dados da entrega e o XP da atividade respectiva
    const record = await qOne(
      `SELECT sa.*, a.xp_reward 
       FROM student_activities sa
       JOIN activities a ON sa.activity_id = a.id
       WHERE sa.id = $1`,
      [submissionId]
    );

    if (!record) throw new NotFoundError("Submissão");
    if (record.status !== "pending") {
      return res.status(400).json({ error: "Esta atividade já foi avaliada pelo professor." });
    }

    await q("BEGIN");
    inTransaction = true;

    // 1. Atualiza a entrega com o veredito do professor
    await q(
      "UPDATE student_activities SET status = $1, feedback = $2, updated_at = now() WHERE id = $3",
      [evaluation, feedback || null, submissionId]
    );

    let student = null;

    // 2. SE ESTIVER CORRETO: Distribui as recompensas mantendo sua regra de negócio
    if (evaluation === "correct") {
      // Atualiza XP do Aluno e calcula novo Level
      student = await qOne(
        "UPDATE students SET xp = xp + $1, level = floor((xp + $1) / 250) + 1, activities_completed = activities_completed + 1 WHERE id = $2 RETURNING *",
        [record.xp_reward, record.student_id]
      );

      // Atualiza o XP da guilda/equipe do aluno
      await q(
        "UPDATE teams SET xp = xp + $1, weekly_xp = weekly_xp + $1 WHERE id = (SELECT team_id FROM students WHERE id = $2)",
        [record.xp_reward, record.student_id]
      );
    } else {
      // Se estiver errado, apenas puxa o estado atual do aluno para não quebrar o retorno da API
      student = await qOne("SELECT * FROM students WHERE id = $1", [record.student_id]);
    }

    await q("COMMIT");
    inTransaction = false;

    success(res, { 
      message: evaluation === "correct" ? "Atividade aprovada! Recompensas creditadas." : "Atividade recusada. O aluno terá que refazer.",
      student 
    });
  } catch (err) {
    if (inTransaction) await q("ROLLBACK").catch(() => {});
    next(err);
  }
});

// ── GET /api/activities/:id ──
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!activity) throw new NotFoundError("Atividade");
    success(res, activity);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/activities ──
router.post("/", validate(createActivitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, subject, difficulty, xpReward, deadline, instructions, teacher } = req.body;
    
    const rows = await q(
      `INSERT INTO activities (title, description, subject, difficulty, xp_reward, deadline, status, instructions, teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8) RETURNING *`,
      [title, description, subject, difficulty, xpReward, deadline, instructions, teacher]
    );
    
    created(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── 🎒 ESTUDANTE: POST /api/activities/:id/submit ──
router.post("/:id/submit", validate(submitActivitySchema), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const activity = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!activity) throw new NotFoundError("Atividade");

    const { submission, studentId: bodyStudentId } = req.body;
    const studentId = bodyStudentId || req.headers["x-user-id"] || req.user?.id || "s3";

    const studentExists = await qOne("SELECT id FROM students WHERE id = $1", [studentId]);
    if (!studentExists) throw new NotFoundError("Estudante");

    // Verificar histórico de envios anteriores
    const existingRecord = await qOne(
      "SELECT id, status FROM student_activities WHERE student_id = $1 AND activity_id = $2",
      [studentId, req.params.id]
    );

    if (existingRecord) {
      // Se o professor já aceitou, o aluno não pode sobrescrever e tentar ganhar XP de novo
      if (existingRecord.status === "correct") {
        return res.status(400).json({ error: "Você já concluiu esta atividade com sucesso!" });
      }
      
      // Se estava 'wrong' (recusado), altera para 'pending' novamente para reavaliação
      await q(
        "UPDATE student_activities SET submission = $1, status = 'pending', updated_at = now() WHERE id = $2",
        [submission || null, existingRecord.id]
      );
    } else {
      // Primeiro envio: entra direto como 'pending'
      await q(
        "INSERT INTO student_activities (student_id, activity_id, submission, status) VALUES ($1, $2, $3, 'pending')",
        [studentId, req.params.id, submission || null]
      );
    }

    // Buscamos a atividade combinada com a tabela de junção para mapear o status atualizado no Front
    const updatedAct = await qOne(
      `SELECT 
        a.*, 
        sa.submission, 
        sa.status AS student_status, 
        sa.grade, 
        sa.feedback
       FROM activities a
       LEFT JOIN student_activities sa 
         ON a.id = sa.activity_id AND sa.student_id = $2
       WHERE a.id = $1`,
      [req.params.id, studentId]
    );

    // Retorna o XP ganho zerado por enquanto (só ganhará quando o status for 'correct')
    success(res, { activity: updatedAct, student: studentExists, xpEarned: 0 });
  } catch (err) {
    next(err);
  }
});

export default router;