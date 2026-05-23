import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/missions ──
router.get("/", async (_req, res, next) => {
  try {
    const rows = await q("SELECT * FROM missions ORDER BY id");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const mission = await qOne("SELECT * FROM missions WHERE id = $1", [req.params.id]);
    if (!mission) throw new NotFoundError("Missão");
    success(res, mission);
  } catch (err) {
    next(err);
  }
});

export default router;