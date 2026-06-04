import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

const TEAMS_WITH_MEMBERS = `
  SELECT t.*, COALESCE(
    json_agg(tm.student_id) FILTER (WHERE tm.student_id IS NOT NULL), '[]'
  ) AS member_ids
  FROM teams t
  LEFT JOIN team_members tm ON tm.team_id = t.id
`;

// ── GET /api/teams ──
router.get("/", async (_req, res, next) => {
  try {
    const teams = await q(`
      ${TEAMS_WITH_MEMBERS}
      GROUP BY t.id
      ORDER BY t.xp DESC
    `);
    success(res, teams);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/teams/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const rows = await q(`
      ${TEAMS_WITH_MEMBERS}
      WHERE t.id = $1
      GROUP BY t.id
    `, [req.params.id]);
    if (rows.length === 0) throw new NotFoundError("Equipa");
    success(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;