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

// ⚔️ Rota para PROCESSAR O TURNO (Responder a pergunta)
router.post('/turn', async (req, res) => {
  try {
    const { studentId, questionId, selectedIndex } = req.body;

    // 1. Busca a pergunta no banco para verificar a resposta correta
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }

    // 2. Verifica se o índice que o aluno escolheu é o correto
    const isCorrect = question.correct_index === selectedIndex;

    if (isCorrect) {
      // Aqui no futuro você pode atualizar o HP do monstro no banco, dar XP, etc.
      return res.status(200).json({
        correct: true,
        message: `💥 Acertou em cheio! Você causou ${question.damage} de dano no Chefão do HTTP!`,
        damageDealt: question.damage,
      });
    } else {
      // Aqui o monstro contra-ataca e tira HP do aluno
      return res.status(200).json({
        correct: false,
        message: `❌ Resposta incorreta! O Chefão do HTTP usou 'Requisição Malformada' e te deu 15 de dano!`,
        damageDealt: 0,
      });
    }
  } catch (error) {
    console.error('Erro ao processar turno:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o turno do combate.' });
  }
});

// 🏆 Rota para FINALIZAR o combate e entregar as recompensas do banco
router.post('/finish', async (req, res) => {
  try {
    const { studentId, missionId, status } = req.body; // status pode ser 'WIN' ou 'LOSE'

    // 1. Busca a missão para saber o prêmio (XP e Ouro)
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return res.status(404).json({ error: 'Missão/Monstro não encontrada.' });
    }

    // 2. Se o aluno VENCEU a batalha no Front-end:
    if (status === 'WIN') {
      
      // Atualiza o estudante aplicando os incrementos diretamente no banco (Super seguro!)
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
          xp: { increment: mission.xp_reward },
          gold: { increment: mission.gold_reward },
          missions_completed: { increment: 1 }, // 🎯 Soma +1 nas missões concluídas!
        },
      });

      // 💡 LÓGICA EXTRA DE LEVEL UP (Exemplo: cada nível precisa de 1000 de XP)
      // Se você quiser que ele suba de nível automaticamente, descomente as linhas abaixo:
      /*
      const novoLevel = Math.floor(updatedStudent.xp / 1000) + 1;
      if (novoLevel > updatedStudent.level) {
        await prisma.student.update({
          where: { id: studentId },
          data: { level: novoLevel }
        });
        updatedStudent.level = novoLevel;
      }
      */

      return res.status(200).json({
        message: `🎉 Vitória! Você derrotou o '${mission.title}'!`,
        rewards: {
          xpGained: mission.xp_reward,
          goldGained: mission.gold_reward,
        },
        studentStatus: {
          currentXp: updatedStudent.xp,
          currentGold: updatedStudent.gold,
          totalMissionsCompleted: updatedStudent.missions_completed,
          level: updatedStudent.level
        }
      });
    }

    // 3. Se o aluno PERDEU a batalha (Opcional: você pode tirar vida persistente ou só mandar mensagem)
    return res.status(200).json({
      message: '💀 Você foi derrotado pelo monstro! Treine mais e tente novamente.',
    });

  } catch (error) {
    console.error('Erro ao finalizar combate:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a finalização do combate.' });
  }
});

export default router;