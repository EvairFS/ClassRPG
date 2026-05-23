import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, createActivitySchema, submitActivitySchema } from "../middleware/validate.js";
import { success, created } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/activities ──
router.get("/", async (_req, res, next) => {
  try {
    const rows = await q("SELECT * FROM activities ORDER BY deadline ASC");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/activities/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const activity = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!activity) throw new NotFoundError("Atividade");
    success(res, activity);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/activities ──
router.post("/", validate(createActivitySchema), async (req, res, next) => {
  try {
    const { title, description, subject, difficulty, xpReward, deadline, instructions, teacher } = req.body;
    const newId = `ac${Date.now()}`;
    const rows = await q(
      `INSERT INTO activities (id, title, description, subject, difficulty, xp_reward, deadline, status, instructions, teacher)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9) RETURNING *`,
      [newId, title, description, subject, difficulty, xpReward, deadline, instructions, teacher]
    );
    created(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/activities/:id/submit ──
router.post("/:id/submit", validate(submitActivitySchema), async (req, res, next) => {
  try {
    const activity = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (!activity) throw new NotFoundError("Atividade");

    const { submission, studentId: bodyStudentId } = req.body;
    const studentId = bodyStudentId || req.headers["x-user-id"] || req.user?.id || "s3";

    const studentExists = await qOne("SELECT id FROM students WHERE id = $1", [studentId]);
    if (!studentExists) throw new NotFoundError("Estudante");

    // Update activity status
    await q(
      "UPDATE activities SET status = 'submitted', submission = COALESCE($1, submission) WHERE id = $2",
      [submission || null, req.params.id]
    );

    // Award XP to student and update level
    const student = await qOne(
      "UPDATE students SET xp = xp + $1, level = floor((xp + $1) / 250) + 1, activities_completed = activities_completed + 1 WHERE id = $2 RETURNING *",
      [activity.xp_reward, studentId]
    );

    // Award XP to team
    await q(
      "UPDATE teams SET xp = xp + $1, weekly_xp = weekly_xp + $1 WHERE id = (SELECT team_id FROM students WHERE id = $2)",
      [activity.xp_reward, studentId]
    );

    const updatedAct = await qOne("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    success(res, { activity: updatedAct, student, xpEarned: activity.xp_reward });
  } catch (err) {
    next(err);
  }
});

export default router;