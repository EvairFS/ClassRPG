import { Router, Request, Response, NextFunction } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

// ── EXTENSÃO GLOBAL DO EXPRESS ──
// Isso adiciona com segurança a propriedade 'user' ao Request padrão sem quebrar o Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
        email?: string;
        name?: string;
      };
    }
  }
}

const router = Router();

router.use(requireAuth);

// ── GET /api/dashboard/student ──
router.get("/student", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.id || "s3"; 

    const [
      currentStudent,
      students,
      activitiesList,
      missionsList,
      achievementsList,
      notificationsList,
      teamsList
    ] = await Promise.all([
      qOne("SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.id = u.id WHERE s.id = $1", [studentId]),
      q("SELECT s.*, u.name FROM students s JOIN users u ON s.id = u.id ORDER BY s.xp DESC"),
      q(`
        SELECT a.*, sa.status, sa.grade, sa.submission, sa.feedback 
        FROM activities a 
        LEFT JOIN student_activities sa ON a.id = sa.activity_id AND sa.student_id = $1
        ORDER BY a.deadline ASC
      `, [studentId]),
      q(`
        SELECT m.*, sm.status, sm.progress, sm.current_monster_hp, sm.current_student_hp 
        FROM missions m 
        LEFT JOIN student_missions sm ON m.id = sm.mission_id AND sm.student_id = $1
        ORDER BY m.deadline ASC
      `, [studentId]),
      
      q(`
        SELECT a.*, sa.earned, sa.progress as student_progress 
        FROM achievements a 
        LEFT JOIN student_achievements sa ON a.id = sa.achievement_id AND sa.student_id = $1
      `, [studentId]), 
      
      q("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [studentId]),
      q("SELECT * FROM teams ORDER BY xp DESC"),
    ]);

    // 🎯 LÓGICA DO PRÓXIMO DESAFIO DINÂMICO:
    // Como a query já vem ordenada por prazo (ASC), pegamos a primeira que NÃO está completa.
    const proximaMissao = missionsList.find(
      (m: any) => m.status !== "COMPLETED" && m.status !== "COMPLETA"
    );

    let proximoDesafio = null;

    if (proximaMissao) {
      const hoje = new Date();
      const prazo = new Date(proximaMissao.deadline);
      
      // Zera as horas para calcular a diferença exata em dias corridos
      hoje.setHours(0, 0, 0, 0);
      const prazoZerado = new Date(prazo);
      prazoZerado.setHours(0, 0, 0, 0);

      const diferencaTempo = prazoZerado.getTime() - hoje.getTime();
      const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      let textoDias = "";
      if (diferencaDias > 0) {
        textoDias = `Em ${diferencaDias} dia${diferencaDias > 1 ? "s" : ""}`;
      } else if (diferencaDias === 0) {
        textoDias = "Expira hoje!";
      } else {
        textoDias = "Prazo encerrado";
      }

      proximoDesafio = {
        id: proximaMissao.id,
        titulo: proximaMissao.title,
        xpReward: proximaMissao.xp_reward || proximaMissao.xp || 100,
        diasRestantes: textoDias,
      };
    }

    // Retorna a resposta injetando o 'proximoDesafio' calculado
    success(res, {
      currentStudent: currentStudent || students[0],
      students,
      activities: activitiesList,
      missions: missionsList,
      achievements: achievementsList,
      notifications: notificationsList,
      teams: teamsList,
      ranking: students.map((s, i) => ({ rank: i + 1, student: s })),
      proximoDesafio, // 👈 Enviado ao Frontend aqui!
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/teacher ──
router.get("/teacher", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user?.id;

    const [
      globalStats,
      topPerformers,
      missionsProgress,
      habilidadesRadar,
      xpMedioDiario,
      teachersList,
      activitiesList // 👈 Reintroduzido para alimentar o .filter() do frontend
    ] = await Promise.all([
      qOne(`
        SELECT 
          (SELECT COUNT(*)::int FROM public.students) as total_students,
          (SELECT COUNT(*)::int FROM public.student_activities WHERE status = 'submitted') as pending_activities,
          (SELECT COALESCE(ROUND(AVG(xp)), 0)::int FROM public.students) as average_xp,
          (SELECT COUNT(*)::int FROM public.student_activities WHERE status = 'graded') as graded_activities,
          (SELECT COALESCE(SUM(xp), 0)::int FROM public.students) as xp_distribuido
        `),
      q(`
        SELECT s.id, u.name, s.classroom, s.xp, s.missions_completed as missoes, s.streak 
          FROM public.students s 
          JOIN public.users u ON s.id = u.id 
          ORDER BY s.xp DESC
      `),
      q(`
        SELECT 
          m.id, m.title, m.type, m.xp_reward, m.gold_reward, m.deadline,
          COUNT(sm.id) FILTER (WHERE sm.status = 'COMPLETED')::int as concluidas,
          (SELECT COUNT(*)::int FROM public.students) as total_alunos
        FROM public.missions m
        LEFT JOIN public.student_missions sm ON m.id = sm.mission_id
        GROUP BY m.id
        ORDER BY m.deadline DESC
      `),
      q(`
        SELECT a.subject as habilidade, COALESCE(ROUND(AVG(sa.grade)), 0)::int as value
        FROM public.student_activities sa
        JOIN public.activities a ON sa.activity_id = a.id
        WHERE sa.status = 'graded'
        GROUP BY a.subject
      `),
      q(`
        SELECT 
          TO_CHAR(sm.updated_at, 'Dy') as dia, 
          COALESCE(ROUND(AVG(m.xp_reward)), 0)::int as xp
        FROM public.student_missions sm
        JOIN public.missions m ON sm.mission_id = m.id
        WHERE sm.status = 'COMPLETED'
        GROUP BY TO_CHAR(sm.updated_at, 'Dy'), EXTRACT(ISODOW FROM sm.updated_at)
        ORDER BY EXTRACT(ISODOW FROM sm.updated_at)
      `),
      q("SELECT * FROM public.teachers ORDER BY id"),
      q("SELECT * FROM public.activities ORDER BY deadline ASC") // 👈 Busca todas as atividades para o frontend tratar
    ]);

    const totalAlunos = globalStats.total_students || 1;
    const totalMissoesConcluidas = topPerformers.reduce((sum: number, p: any) => sum + p.missoes, 0);
    const taxaEngajamento = Math.min(100, Math.round((totalMissoesConcluidas / (totalAlunos * 5)) * 100));

    success(res, {
      teachers: teachersList,
      currentTeacher: teachersList.find((t: any) => t.id === teacherId) || teachersList[0] || null,
      students: topPerformers, 
      activities: activitiesList, // 👈 Enviando o array mapeado para sanar o erro do .filter()
      
      stats: {
        totalStudents: globalStats.total_students,
        totalActivities: globalStats.pending_activities,
        averageXp: globalStats.average_xp,
        gradedActivities: globalStats.graded_activities,
        xpDistribuido: globalStats.xp_distribuido,
        taxaEngajamento: taxaEngajamento || 85,
        missoesPorAluno: Math.round(totalMissoesConcluidas / totalAlunos)
      },
      topPerformers: topPerformers.map((p: any) => ({
        nome: p.name,
        turma: p.classroom,
        xp: p.xp,
        missoes: p.missoes,
        sequencia: `${p.streak}d`
      })),
      missions: missionsProgress,
      habilidadesMedias: habilidadesRadar.length ? habilidadesRadar : [
        { habilidade: "Matemática", value: 0 },
        { habilidade: "Português", value: 0 }
      ],
      xpMedioDiario: xpMedioDiario.length ? xpMedioDiario : [
        { dia: "Seg", xp: 0 }, { dia: "Ter", xp: 0 }, { dia: "Qua", xp: 0 }, 
        { dia: "Qui", xp: 0 }, { dia: "Sex", xp: 0 }
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;