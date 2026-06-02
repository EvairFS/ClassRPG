import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { PORT, CORS_ORIGIN, RATE_LIMIT } from "./src/config.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { success } from "./src/utils/response.js";

// ── Route imports ──
import authRoutes from "./src/routes/auth.js";
import studentRoutes from "./src/routes/students.js";
import teacherRoutes from "./src/routes/teachers.js";
import activityRoutes from "./src/routes/activities.js";
import missionRoutes from "./src/routes/missions.js";
import achievementRoutes from "./src/routes/achievements.js";
import notificationRoutes from "./src/routes/notifications.js";
import teamRoutes from "./src/routes/teams.js";
import rankingRoutes from "./src/routes/ranking.js";
import chartRoutes from "./src/routes/charts.js";
import dashboardRoutes from "./src/routes/dashboards.js";

const app = express();

// ─────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  message: { error: "Muitas requisições. Tente novamente mais tarde.", code: "RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  success(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─────────────────────────────────────────────
// API Info
// ─────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    message: "⚔️ ClassRPG Backend está rodando",
    version: "2.0.0",
    docs: "/api/health",
    endpoints: [
      "/api/login",
      "/api/register",
      "/api/forgot-password",
      "/api/user/me",
      "/api/students",
      "/api/teachers",
      "/api/activities",
      "/api/missions",
      "/api/achievements",
      "/api/notifications",
      "/api/teams",
      "/api/ranking",
      "/api/charts/student-perf-week",
      "/api/charts/class-engagement",
      "/api/charts/platform-growth",
      "/api/charts/skills-radar",
      "/api/dashboard/student",
      "/api/dashboard/teacher",
    ],
  });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─────────────────────────────────────────────
// Servidor local (apenas fora da Vercel)
// ─────────────────────────────────────────────
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`⚔️  ClassRPG Backend rodando em http://localhost:${PORT}`);
    console.log(`   Ambiente: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;