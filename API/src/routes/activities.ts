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
    
    // 🛠️ CORREÇÃO: Mudamos 'teacher' para 'teacher_id' no SQL.
    // 💡 OBS: Removi o 'newId' para deixar o Postgres gerar o UUID padrão automaticamente.
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

// ── POST /api/activities/:id/submit ──
router.post("/:id/submit", validate(submitActivitySchema), async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const activity = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!activity) throw new NotFoundError("Atividade");

    const { submission, studentId: bodyStudentId } = req.body;
    
    const studentId = bodyStudentId || req.headers["x-user-id"] || req.user?.id || "s3";

    const studentExists = await qOne("SELECT id FROM students WHERE id = $1", [studentId]);
    if (!studentExists) throw new NotFoundError("Estudante");

    // 🛠️ CORREÇÃO 1: Verificar se já existe um registro do aluno para esta atividade
    const existingRecord = await qOne(
      "SELECT id FROM student_activities WHERE student_id = $1 AND activity_id = $2",
      [studentId, req.params.id]
    );

    if (existingRecord) {
      // Se já existir (ex: status 'pending'), nós atualizamos a entrega
      await q(
        "UPDATE student_activities SET submission = $1, status = 'submitted', updated_at = now() WHERE id = $2",
        [submission || null, existingRecord.id]
      );
    } else {
      // Se não existir, criamos o registro de entrega do zero
      await q(
        "INSERT INTO student_activities (student_id, activity_id, submission, status) VALUES ($1, $2, $3, 'submitted')",
        [studentId, req.params.id, submission || null]
      );
    }

    // Award XP to student and update level (Mantido igual)
    const student = await qOne(
      "UPDATE students SET xp = xp + $1, level = floor((xp + $1) / 250) + 1, activities_completed = activities_completed + 1 WHERE id = $2 RETURNING *",
      [activity.xp_reward, studentId]
    );

    // Award XP to team (Mantido igual)
    await q(
      "UPDATE teams SET xp = xp + $1, weekly_xp = weekly_xp + $1 WHERE id = (SELECT team_id FROM students WHERE id = $2)",
      [activity.xp_reward, studentId]
    );

    // 🛠️ CORREÇÃO 2: Buscar a atividade combinada com a entrega usando o LEFT JOIN que funcionou no Supabase
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

    success(res, { activity: updatedAct, student, xpEarned: activity.xp_reward });
  } catch (err) {
    next(err);
  }
});

export default router;
