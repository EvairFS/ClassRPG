import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// PostgreSQL connection
// ─────────────────────────────────────────────
const pool = new pg.Pool({
  host: "/run/postgresql",
  database: "classrpg",
  user: "postgres",
});

// Helper: run query and return rows
const q = (text, params) => pool.query(text, params).then(r => r.rows);

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }
    const users = await q("SELECT id, email, role, name FROM users WHERE email = $1 AND password = $2", [email, password]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }
    res.json({ user: users[0], token: "mock-jwt-token" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// ─────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────
app.get("/api/students", async (_req, res) => {
  try {
    const students = await q(`
      SELECT s.*, COALESCE(
        json_agg(json_build_object(
          'id', a.id, 'name', a.name, 'description', a.description,
          'icon', a.icon, 'rarity', a.rarity,
          'earned', sa.earned, 'earnedAt', sa.earned_at, 'progress', sa.progress
        ) FILTER (WHERE a.id IS NOT NULL), '[]'
      ) AS achievements
      FROM students s
      LEFT JOIN student_achievements sa ON sa.student_id = s.id
      LEFT JOIN achievements a ON a.id = sa.achievement_id
      GROUP BY s.id
      ORDER BY s.id
    `);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estudantes." });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const rows = await q(`
      SELECT s.*, COALESCE(
        json_agg(json_build_object(
          'id', a.id, 'name', a.name, 'description', a.description,
          'icon', a.icon, 'rarity', a.rarity,
          'earned', sa.earned, 'earnedAt', sa.earned_at, 'progress', sa.progress
        ) FILTER (WHERE a.id IS NOT NULL), '[]'
      ) AS achievements
      FROM students s
      LEFT JOIN student_achievements sa ON sa.student_id = s.id
      LEFT JOIN achievements a ON a.id = sa.achievement_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Estudante não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estudante." });
  }
});

app.get("/api/students/me/current", async (_req, res) => {
  try {
    const rows = await q(`
      SELECT s.*, COALESCE(
        json_agg(json_build_object(
          'id', a.id, 'name', a.name, 'description', a.description,
          'icon', a.icon, 'rarity', a.rarity,
          'earned', sa.earned, 'earnedAt', sa.earned_at, 'progress', sa.progress
        ) FILTER (WHERE a.id IS NOT NULL), '[]'
      ) AS achievements
      FROM students s
      LEFT JOIN student_achievements sa ON sa.student_id = s.id
      LEFT JOIN achievements a ON a.id = sa.achievement_id
      WHERE s.id = 's3'
      GROUP BY s.id
    `);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estudante atual." });
  }
});

// ─────────────────────────────────────────────
// TEACHERS
// ─────────────────────────────────────────────
app.get("/api/teachers", async (_req, res) => {
  try {
    const teachers = await q("SELECT * FROM teachers ORDER BY id");
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
});

app.get("/api/teachers/:id", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM teachers WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Professor não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar professor." });
  }
});

app.get("/api/teachers/me/current", async (_req, res) => {
  try {
    const rows = await q("SELECT * FROM teachers WHERE id = 't1'");
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar professor atual." });
  }
});

// ─────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────
app.get("/api/activities", async (_req, res) => {
  try {
    const rows = await q("SELECT * FROM activities ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar atividades." });
  }
});

app.get("/api/activities/:id", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Atividade não encontrada." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar atividade." });
  }
});

app.post("/api/activities", async (req, res) => {
  try {
    const { title, description, subject, difficulty, xpReward, deadline, instructions, teacher } = req.body;
    const newId = `ac${Date.now()}`;
    const rows = await q(
      `INSERT INTO activities (id, title, description, subject, difficulty, xp_reward, deadline, status, instructions, teacher)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9) RETURNING *`,
      [newId, title || "Nova Atividade", description || "", subject || "Geral", difficulty || "Easy", xpReward || 50, deadline || "2026-12-31", instructions || "", teacher || "Professor"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar atividade." });
  }
});

app.post("/api/activities/:id/submit", async (req, res) => {
  try {
    const acts = await q("SELECT * FROM activities WHERE id = $1", [req.params.id]);
    if (acts.length === 0) return res.status(404).json({ error: "Atividade não encontrada." });

    const a = acts[0];
    const { submission } = req.body;

    await q("UPDATE activities SET status = 'submitted', submission = COALESCE($1, submission) WHERE id = $2", [submission || null, req.params.id]);

    // Give XP to student Carla (s3)
    const student = (await q("UPDATE students SET xp = xp + $1, level = floor((xp + $1) / 250) + 1 WHERE id = 's3' RETURNING *", [a.xp_reward]))[0];

    const updatedAct = (await q("SELECT * FROM activities WHERE id = $1", [req.params.id]))[0];
    res.json({ activity: updatedAct, student, xpEarned: a.xp_reward });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao submeter atividade." });
  }
});

// ─────────────────────────────────────────────
// MISSIONS
// ─────────────────────────────────────────────
app.get("/api/missions", async (_req, res) => {
  try {
    const rows = await q("SELECT * FROM missions ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar missões." });
  }
});

app.get("/api/missions/:id", async (req, res) => {
  try {
    const rows = await q("SELECT * FROM missions WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Missão não encontrada." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar missão." });
  }
});

// ─────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────
app.get("/api/achievements", async (_req, res) => {
  try {
    const rows = await q("SELECT * FROM achievements ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar conquistas." });
  }
});

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
app.get("/api/notifications", async (_req, res) => {
  try {
    const rows = await q("SELECT * FROM notifications ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar notificações." });
  }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const rows = await q("UPDATE notifications SET read = true WHERE id = $1 RETURNING *", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Notificação não encontrada." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar notificação." });
  }
});

// ─────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────
app.get("/api/teams", async (_req, res) => {
  try {
    const teams = await q(`
      SELECT t.*, COALESCE(
        json_agg(tm.student_id) FILTER (WHERE tm.student_id IS NOT NULL), '[]'
      ) AS member_ids
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      GROUP BY t.id
      ORDER BY t.id
    `);
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar equipas." });
  }
});

app.get("/api/teams/:id", async (req, res) => {
  try {
    const rows = await q(`
      SELECT t.*, COALESCE(
        json_agg(tm.student_id) FILTER (WHERE tm.student_id IS NOT NULL), '[]'
      ) AS member_ids
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      WHERE t.id = $1
      GROUP BY t.id
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Equipa não encontrada." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar equipa." });
  }
});

// ─────────────────────────────────────────────
// RANKING
// ─────────────────────────────────────────────
app.get("/api/ranking", async (_req, res) => {
  try {
    const students = await q("SELECT * FROM students ORDER BY xp DESC");
    const ranking = students.map((s, i) => ({ rank: i + 1, student: s }));
    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking." });
  }
});

// ─────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────
app.get("/api/charts/student-perf-week", (_req, res) => {
  res.json([
    { day: "Seg", xp: 120, missions: 1 },
    { day: "Ter", xp: 240, missions: 2 },
    { day: "Qua", xp: 180, missions: 1 },
    { day: "Qui", xp: 380, missions: 3 },
    { day: "Sex", xp: 260, missions: 2 },
    { day: "Sáb", xp: 90, missions: 1 },
    { day: "Dom", xp: 50, missions: 0 },
  ]);
});

app.get("/api/charts/class-engagement", (_req, res) => {
  res.json([
    { week: "S1", ativos: 24, entregas: 88 },
    { week: "S2", ativos: 27, entregas: 102 },
    { week: "S3", ativos: 25, entregas: 96 },
    { week: "S4", ativos: 29, entregas: 124 },
    { week: "S5", ativos: 30, entregas: 138 },
    { week: "S6", ativos: 31, entregas: 142 },
  ]);
});

app.get("/api/charts/platform-growth", (_req, res) => {
  res.json([
    { month: "Jan", schools: 18, students: 1240, teachers: 92 },
    { month: "Fev", schools: 22, students: 1680, teachers: 121 },
    { month: "Mar", schools: 27, students: 2210, teachers: 158 },
    { month: "Abr", schools: 31, students: 2840, teachers: 196 },
    { month: "Mai", schools: 36, students: 3520, teachers: 232 },
  ]);
});

app.get("/api/charts/skills-radar", (_req, res) => {
  res.json([
    { skill: "Matemática", value: 82 },
    { skill: "Português", value: 74 },
    { skill: "Ciências", value: 88 },
    { skill: "História", value: 66 },
    { skill: "Geografia", value: 71 },
    { skill: "Inglês", value: 79 },
  ]);
});

// ─────────────────────────────────────────────
// DASHBOARDS
// ─────────────────────────────────────────────
app.get("/api/dashboard/student", async (_req, res) => {
  try {
    const students = await q("SELECT * FROM students ORDER BY xp DESC");
    const activitiesList = await q("SELECT * FROM activities ORDER BY id");
    const missionsList = await q("SELECT * FROM missions ORDER BY id");
    const achievementsList = await q("SELECT * FROM achievements ORDER BY id");
    const notificationsList = await q("SELECT * FROM notifications ORDER BY id");
    const teamsList = await q("SELECT * FROM teams ORDER BY id");

    res.json({
      currentStudent: students.find(s => s.id === "s3") || students[0],
      students,
      activities: activitiesList,
      missions: missionsList,
      achievements: achievementsList,
      notifications: notificationsList,
      teams: teamsList,
      ranking: students.map((s, i) => ({ rank: i + 1, student: s })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

app.get("/api/dashboard/teacher", async (_req, res) => {
  try {
    const students = await q("SELECT * FROM students ORDER BY id");
    const activitiesList = await q("SELECT * FROM activities ORDER BY id");
    const teachers = await q("SELECT * FROM teachers ORDER BY id");
    const avgXp = Math.round(students.reduce((sum, s) => sum + s.xp, 0) / students.length);

    res.json({
      students,
      activities: activitiesList,
      teachers,
      currentTeacher: teachers[0] || null,
      stats: {
        totalStudents: students.length,
        totalActivities: activitiesList.length,
        averageXp: avgXp,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`⚔️ ClassRPG Backend rodando em http://localhost:${PORT}`);
});