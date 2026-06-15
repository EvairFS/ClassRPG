import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/notifications ──
router.get("/", async (req: any, res, next) => {
  try {
    const userId = req.user?.id;

    const notifications = await q(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    success(res, notifications);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/notifications/:id/read ──
router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await qOne(
      `
      UPDATE notifications
      SET read = true
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!notification) {
      throw new NotFoundError("Notificação");
    }

    success(res, notification);
  } catch (err) {
    next(err);
  }
});

export default router;