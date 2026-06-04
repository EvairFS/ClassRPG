import { prisma } from "../db";

export const missionService = {
  /**
   * Atualiza o progresso das missões de um aluno baseado em uma ação específica.
   */
  async trackAction(studentId: string, actionType: string) {
    // 1. Busca todos os progressos ativos na tabela 'student_missions' para o tipo de ação correspondente
    const activeMissions = await prisma.studentMission.findMany({
      where: {
        student_id: studentId,
        status: "IN_PROGRESS",
        mission: { 
          type: actionType // Vincula o gatilho ao campo 'type' da tabela 'missions'
        }
      },
      include: { mission: true }
    });

    for (const studentMission of activeMissions) {
      const nextProgress = studentMission.progress + 1;
      const isCompleted = nextProgress >= studentMission.total;

      // 2. Atualiza o progresso na tabela 'student_missions'
      await prisma.studentMission.update({
        where: { id: studentMission.id },
        data: {
          progress: Math.min(nextProgress, studentMission.total),
          status: isCompleted ? "COMPLETED" : "IN_PROGRESS"
        }
      });

      // 3. Se completou a missão, aplica as recompensas de XP/Gold e gera a notificação
      if (isCompleted) {
        await prisma.user.update({
          where: { id: studentId },
          data: {
            xp: { increment: studentMission.mission.xp_reward }
            // Se a sua tabela de usuários/alunos tiver a coluna gold, pode descomentar a linha abaixo:
            // gold: { increment: 50 } 
          }
        });
        
        // Cria o registro de notificação para o front-end ler
        await prisma.notification.create({
          data: {
            userId: studentId, // ajuste para student_id se sua tabela de notificações usar snake_case
            title: "⚔️ Missão Cumprida!",
            message: `Você completou a missão "${studentMission.mission.title}" e ganhou +${studentMission.mission.xp_reward} XP!`
          }
        });
      }
    }
  }
};