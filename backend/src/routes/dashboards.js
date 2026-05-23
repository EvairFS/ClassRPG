import { Router } from "express";
import { q, qOne } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { success } from "../utils/response.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/dashboard/student ──
router.get("/student", async (_req, res, next) => {
  try {
    const [students, activitiesList, missionsList, achievementsList, notificationsList, teamsList] =
      await Promise.all([
        q("SELECT * FROM students ORDER BY xp DESC"),
        q("SELECT * FROM activities ORDER BY id"),
        q("SELECT * FROM missions ORDER BY id"),
        q("SELECT * FROM achievements ORDER BY id"),
        q("SELECT * FROM notifications ORDER BY id"),
        q("SELECT * FROM teams ORDER BY id"),
      ]);

    success(res, {
      currentStudent: students.find((s) => s.id === "s3") || students[0],
      students,
      activities: activitiesList,
      missions: missionsList,
      achievements: achievementsList,
      notifications: notificationsList,
      teams: teamsList,
      ranking: students.map((s, i) => ({ rank: i + 1, student: s })),
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/teacher ──
router.get("/teacher", async (_req, res, next) => {
  try {
    const [students, activitiesList, teachers] = await Promise.all([
      q("SELECT * FROM students ORDER BY id"),
      q("SELECT * FROM activities ORDER BY id"),
      q("SELECT * FROM teachers ORDER BY id"),
    ]);

    const avgXp = Math.round(
      students.reduce((sum, s) => sum + s.xp, 0) / (students.length || 1)
    );

    success(res, {
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
    next(err);
  }
});

export default router;