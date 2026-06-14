import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PORT, NODE_ENV } from "./config.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

// ── Importações das Rotas ──
import authRoutes from "./src/routes/auth.js";
import activityRoutes from "./src/routes/activities.js";
import achievementRoutes from "./src/routes/achievements.js";
import missionRoutes from "./src/routes/missions.js";
import chartRoutes from "./src/routes/charts.js";
import dashboardRoutes from "./src/routes/dashboards.js";
import notificationRoutes from "./src/routes/notifications.js";
import rankingRoutes from "./src/routes/ranking.js";
import studentRoutes from "./src/routes/students.js";
import teacherRoutes from "./src/routes/teachers.js";
import teamRoutes from "./src/routes/teams.js";
import battleRoutes from './src/routes/battle.routes.js';

const app = express();

// 🔥 CORREÇÃO DO RATE-LIMIT NA RENDER:
// Diz ao Express para confiar no proxy reverso da Render para identificar os IPs reais
app.set("trust proxy", 1); 

// ── Middlewares Globais Configurados ──
app.use(
  cors({
    origin: "https://classrpg.classrpg.workers.dev", // Seu front na Cloudflare
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);
app.use(express.json());

// ── Rota de Healthcheck (Status da API) ──
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: "OK", 
    environment: NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

// ── Vinculação das Rotas da API ──
app.use("/api", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/battles", battleRoutes);

// ── Middleware de Tratamento de Erros (Sempre por último!) ──
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// ── Inicialização do Servidor ──
app.listen(PORT, () => {
  console.log(`🚀 Servidor do ClassRPG rodando em modo [${NODE_ENV}] na porta ${PORT}`);
});