import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

router.use(requireAuth);

// Função para definir a patente do aluno dinamicamente com base no XP real
const calcularPatente = (xp: number): string => {
  if (xp >= 5000) return "Lenda";
  if (xp >= 3000) return "Mestre";
  if (xp >= 1500) return "Cavaleiro";
  if (xp >= 500)  return "Aprendiz";
  return "Novato";
};

// ── GET /api/ranking ──
router.get("/", async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    // Captura os filtros enviados pelos botões do Frontend (ex: ?scope=turma)
    const { scope } = req.query; 

    let query = `
      SELECT s.*, u.name, u.email 
      FROM public.students s 
      JOIN public.users u ON s.id = u.id
    `;
    const params: any[] = [];

    // 🏆 FILTRO: "Minha Turma"
    // Se o frontend passar ?scope=turma, descobrimos a turma do aluno logado e filtramos
    if (scope === "turma" && studentId) {
      const alunoLogado = await qOne("SELECT classroom FROM public.students WHERE id = $1", [studentId]);
      if (alunoLogado?.classroom) {
        query += " WHERE s.classroom = $1";
        params.push(alunoLogado.classroom);
      }
    }

    // Ordena do maior XP para o menor
    query += " ORDER BY s.xp DESC, u.name ASC";

    const students = await q(query, params);

    // Mantém EXATAMENTE a estrutura [{ rank, student }] que seu frontend já consome
    const ranking = students.map((s: any, i: number) => ({
      rank: i + 1,
      student: {
        ...s,
        patente: calcularPatente(s.xp) // Insere a patente em tempo real para a tabela e pódio
      }
    }));

    success(res, ranking);
  } catch (err) {
    next(err);
  }
});

export default router;