import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { parsePagination } from "../utils/pagination.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

// Apply auth middleware
router.use(requireAuth);

const STUDENT_WITH_ACHIEVEMENTS = `
  SELECT s.*, COALESCE(
    json_agg(json_build_object(
      'id', a.id, 'name', a.name, 'description', a.description,
      'icon', a.icon, 'rarity', a.rarity,
      'earned', sa.earned, 'earnedAt', sa.earned_at, 'progress', sa.progress
    ) FILTER (WHERE a.id IS NOT NULL), '[]'
  ) AS achievements
  FROM students s
  LEFT JOIN student_achievements sa ON sa.student_id = s.id
  LEFT JOIN achievements a ON a.id = sa.achievement_id
`;

// ── GET /api/students (with pagination) ──
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    const countResult = await q("SELECT COUNT(*) FROM students");
    const total = parseInt(countResult[0].count, 10);

    const students = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      GROUP BY s.id
      ORDER BY s.xp DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    success(res, students, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/me/current ──
router.get("/me/current", async (req, res, next) => {
  try {
    const studentId = req.headers["x-user-id"] || req.user?.id || "s3";
    const rows = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      WHERE s.id = $1
      GROUP BY s.id
    `, [studentId]);
    success(res, rows[0] || null);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const rows = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      WHERE s.id = $1
      GROUP BY s.id
    `, [req.params.id]);
    if (rows.length === 0) throw new NotFoundError("Estudante");
    success(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;