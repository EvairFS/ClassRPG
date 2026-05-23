import { Router } from "express";
import { q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/ranking ──
router.get("/", async (_req, res, next) => {
  try {
    const students = await q("SELECT * FROM students ORDER BY xp DESC");
    const ranking = students.map((s, i) => ({ rank: i + 1, student: s }));
    success(res, ranking);
  } catch (err) {
    next(err);
  }
});

export default router;