import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 🔌 Configurando o Prisma 7 com o Driver Adapter do Postgres
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const router = Router();

// ⚔️ Rota para INICIAR o combate
router.post('/start', async (req, res) => {
  try {
    const { studentId, missionId } = req.body;

    // 1. Busca o monstro/missão no banco
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return res.status(404).json({ error: 'Monstro/Missão não encontrado.' });
    }

    // 2. Busca as perguntas vinculadas a esse monstro
    const questions = await prisma.question.findMany({
      where: { mission_id: missionId },
    });

    // 3. Retorna os dados estruturados para o front-end ou Postman iniciar a tela de luta
    return res.status(200).json({
      message: '⚔️ O combate começou!',
      monster: {
        id: mission.id,
        name: mission.title,
        hp: mission.monster_hp,
        description: mission.description,
      },
      questions: questions.map((q) => ({
        id: q.id,
        statement: q.statement,
        options: q.options,
      })),
    });
  } catch (error) {
    console.error('Erro ao iniciar batalha:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao iniciar a batalha.' });
  }
});

export default router;