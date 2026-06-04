import { Router, Request, Response, NextFunction } from "express";
// 💡 Importe o 'db' ou 'q' dependendo de como você finalizou o seu arquivo db.ts
import { db } from "../db.js"; 
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

// Garante que todas as rotas abaixo exijam autenticação
router.use(requireAuth);

// ── GET /api/achievements ──
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // 💡 Se no seu db.ts a função ainda se chama 'q', mantenha: const rows = await q(...)
    // Se você adotou a estrutura de objeto que montamos antes, usamos o db.query:
    const { rows } = await db.query("SELECT * FROM achievements ORDER BY id");
    
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

export default router;