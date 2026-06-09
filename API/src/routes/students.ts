import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth, CustomRequest } from "../middleware/auth.js"; // 🌟 ALTERADO: Importamos o CustomRequest
import { parsePagination } from "../utils/pagination.js";
import { success } from "../utils/response.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js"; // 🌟 Adicionado BadRequestError

const router = Router();

// Apply auth middleware
router.use(requireAuth);

const STUDENT_WITH_ACHIEVEMENTS = `
  SELECT s.*, COALESCE(
    json_agg(json_build_object(
      'id', a.id, 'name', a.name, 'description', a.description,
      'icon', a.icon, 'rarity', a.rarity,
      'earned', sa.earned, 'earnedAt', sa.earned_at, 'progress', sa.progress
    ) FILTER (WHERE a.id IS NOT NULL)), '[]'
  ) AS achievements
  FROM students s
  LEFT JOIN student_achievements sa ON sa.student_id = s.id
  LEFT JOIN achievements a ON a.id = sa.achievement_id
`;

// ── GET /api/students (with pagination) ──
router.get("/", async (req, res, next) => {
  try {
    // 🌟 ALTERADO: Adicionado 'as any' para o TypeScript aceitar o req.query na paginação
    const { page, limit, offset } = parsePagination(req.query as any);

    const countResult = await q("SELECT COUNT(*) FROM students");
    const total = parseInt(countResult[0].count, 10);

    const students = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      GROUP BY s.id
      ORDER BY s.xp DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    success(res, students, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/me/current ──
// 🌟 ALTERADO: Tipamos o 'req' como 'CustomRequest' para liberar o 'req.user'
router.get("/me/current", async (req: CustomRequest, res, next) => {
  try {
    const studentId = req.headers["x-user-id"] || req.user?.id || "s3";
    const rows = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      WHERE s.id = $1
      GROUP BY s.id
    `, [studentId]);
    success(res, rows[0] || null);
  } catch (err) {
    next(err);
  }
});

// ── 🔥 NOVO: PUT /api/students/character (Configurar dados do herói) ──
router.put("/character", async (req: CustomRequest, res, next) => {
  try {
    const studentId = req.user?.id;
    const { gender, class: characterClass, skin_color, hair_style, hair_color } = req.body;

    if (!studentId) {
      throw new BadRequestError("Estudante não autenticado.");
    }

    if (!gender || !characterClass || !skin_color || !hair_style) {
      throw new BadRequestError("Gênero, classe, cor de pele e estilo de cabelo são obrigatórios.");
    }

    // Normalização para maiúsculas
    const selectedClass = characterClass.toUpperCase();
    const selectedGender = gender.toUpperCase();
    const selectedHairStyle = hair_style.toUpperCase();

    // Validações de segurança
    if (!["GUERREIRO", "MAGO", "LADINO"].includes(selectedClass)) {
      throw new BadRequestError("Classe inválida.");
    }
    if (!["MASCULINO", "FEMININO", "NÃO-BINÁRIO"].includes(selectedGender)) {
      throw new BadRequestError("Gênero inválido.");
    }
    if (!["SHORT", "LONG", "BALD"].includes(selectedHairStyle)) {
      throw new BadRequestError("Estilo de cabelo inválido.");
    }

    // Se o estilo for careca, limpamos a cor do cabelo para null
    const finalHairColor = selectedHairStyle === "BALD" ? null : hair_color;

    // Atualização com as colunas novas que você adicionou via ALTER TABLE
    const rows = await q(
      `UPDATE students 
       SET 
         gender = $1, 
         class = $2, 
         appearance_skin_color = $3, 
         appearance_hair_style = $4, 
         appearance_hair_color = $5,
         updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, gender, class, appearance_skin_color, appearance_hair_style, appearance_hair_color`,
      [selectedGender, selectedClass, skin_color, selectedHairStyle, finalHairColor, studentId]
    );

    if (rows.length === 0) {
      throw new NotFoundError("Estudante");
    }

    success(res, {
      message: "Visual do personagem salvo com sucesso!",
      student: rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/:id ──
router.get("/:id", async (req, res, next) => {
  try {
    const rows = await q(`
      ${STUDENT_WITH_ACHIEVEMENTS}
      WHERE s.id = $1
      GROUP BY s.id
    `, [req.params.id]);
    if (rows.length === 0) throw new NotFoundError("Estudante");
    success(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
