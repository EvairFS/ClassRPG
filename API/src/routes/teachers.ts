import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth, CustomRequest } from "../middleware/auth.js"; // 🌟 ALTERADO: Importamos o CustomRequest
import { success } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/teachers ──
router.get("/", async (_req, res, next) => {
  try {
    const teachers = await q("SELECT * FROM teachers ORDER BY id");
    success(res, teachers);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/teachers/me/current ──
// 🌟 ALTERADO: Tipamos o 'req' como 'CustomRequest' para liberar o 'req.user'
router.get("/me/current", async (req: CustomRequest, res, next) => {
  try {
    const teacherId = req.headers["x-user-id"] || req.user?.id || "t1";
    const teacher = await qOne("SELECT * FROM teachers WHERE id = $1", [teacherId]);
    success(res, teacher || null);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/teachers/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const teacher = await qOne("SELECT * FROM teachers WHERE id = $1", [req.params.id]);
    if (!teacher) throw new NotFoundError("Professor");
    success(res, teacher);
  } catch (err) {
    next(err);
  }
});

export default router;