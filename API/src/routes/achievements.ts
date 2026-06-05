import { Router, Request, Response, NextFunction } from "express";
import { q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();
router.use(requireAuth);

// ── GET /api/achievements ──
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await q("SELECT * FROM achievements ORDER BY name");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

export default router;