import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/charts/student-perf-week ──
router.get("/student-perf-week", (_req, res) => {
  success(res, [
    { day: "Seg", xp: 120, missions: 1 },
    { day: "Ter", xp: 240, missions: 2 },
    { day: "Qua", xp: 180, missions: 1 },
    { day: "Qui", xp: 380, missions: 3 },
    { day: "Sex", xp: 260, missions: 2 },
    { day: "Sáb", xp: 90, missions: 1 },
    { day: "Dom", xp: 50, missions: 0 },
  ]);
});

// ── GET /api/charts/class-engagement ──
router.get("/class-engagement", (_req, res) => {
  success(res, [
    { week: "S1", ativos: 24, entregas: 88 },
    { week: "S2", ativos: 27, entregas: 102 },
    { week: "S3", ativos: 25, entregas: 96 },
    { week: "S4", ativos: 29, entregas: 124 },
    { week: "S5", ativos: 30, entregas: 138 },
    { week: "S6", ativos: 31, entregas: 142 },
  ]);
});

// ── GET /api/charts/platform-growth ──
router.get("/platform-growth", (_req, res) => {
  success(res, [
    { month: "Jan", schools: 18, students: 1240, teachers: 92 },
    { month: "Fev", schools: 22, students: 1680, teachers: 121 },
    { month: "Mar", schools: 27, students: 2210, teachers: 158 },
    { month: "Abr", schools: 31, students: 2840, teachers: 196 },
    { month: "Mai", schools: 36, students: 3520, teachers: 232 },
  ]);
});

// ── GET /api/charts/skills-radar ──
router.get("/skills-radar", (_req, res) => {
  success(res, [
    { skill: "Matemática", value: 82 },
    { skill: "Português", value: 74 },
    { skill: "Ciências", value: 88 },
    { skill: "História", value: 66 },
    { skill: "Geografia", value: 71 },
    { skill: "Inglês", value: 79 },
  ]);
});

export default router;