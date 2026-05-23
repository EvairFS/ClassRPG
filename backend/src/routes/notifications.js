import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/notifications ──
router.get("/", async (_req, res, next) => {
  try {
    const rows = await q("SELECT * FROM notifications ORDER BY id");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/notifications/:id/read ──
router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await qOne(
      "UPDATE notifications SET read = true WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!notification) throw new NotFoundError("Notificação");
    success(res, notification);
  } catch (err) {
    next(err);
  }
});

export default router;