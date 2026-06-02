import { Router } from "express";
import { q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/achievements ──
router.get("/", async (_req, res, next) => {
  try {
    const rows = await q("SELECT * FROM achievements ORDER BY id");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

export default router;