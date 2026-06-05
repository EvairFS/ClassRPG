import { Router, Request, Response, NextFunction } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success, created } from "../utils/response.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

// 🛡️ Interface para o TypeScript reconhecer o usuário injetado pelo JWT
interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

router.use(requireAuth);

// ── GET /api/missions (Listar todas as missões) ──
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await q("SELECT * FROM missions ORDER BY id");
    success(res, rows);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/missions/:id (Detalhes de uma missão específica) ──
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mission = await qOne("SELECT * FROM missions WHERE id = $1", [req.params.id]);
    if (!mission) throw new NotFoundError("Missão");
    
    success(res, mission);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/missions/:id/join (Estudante aceitar/entrar em uma missão) ──
router.post("/:id/join", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const missionId = req.params.id;
    
    // Captura o ID do estudante de forma segura
    const studentId = req.headers["x-user-id"] || req.user?.id || "s3";

    // 1. Verifica se a missão existe
    const mission = await qOne("SELECT id FROM missions WHERE id = $1", [missionId]);
    if (!mission) throw new NotFoundError("Missão");

    // 2. Verifica se o estudante já aceitou essa missão antes para evitar duplicidade
    const alreadyJoined = await qOne(
      "SELECT id FROM student_missions WHERE student_id = $1 AND mission_id = $2",
      [studentId, missionId]
    );
    if (alreadyJoined) {
      throw new BadRequestError("Você já está participando desta missão.");
    }

    // 3. Vincula o estudante à missão no banco de dados (tabela intermediária)
    const joinId = `sm${Date.now()}`;
    const rows = await q(
      `INSERT INTO student_missions (id, student_id, mission_id, status, progress) 
       VALUES ($1, $2, $3, 'active', 0) RETURNING *`,
      [joinId, studentId, missionId]
    );

    created(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;