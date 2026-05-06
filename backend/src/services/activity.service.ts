import prisma from '../database/client';
import { AppError } from '../types';
import { CreateActivityInput } from '../types/activity.types';

export class ActivityService {
  /**
   * Criar nova atividade RPG
   * Regra #2 - Criação de Atividades
   * Regra #12 - Níveis de Dificuldade
   */
  async createActivity(teacherId: string, data: CreateActivityInput) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
    });

    if (!teacher) {
      throw new AppError('Professor não encontrado', 404);
    }

    if (!teacher.approvedAt) {
      throw new AppError(
        'Professor não aprovado para criar atividades',
        403
      );
    }

    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        objective: data.objective,
        difficulty: data.difficulty || 'MEDIUM',
        maxScore: data.maxScore || 100,
        dueDate: new Date(data.dueDate),
        teacherId: teacher.id,
        status: 'DRAFT',
      },
    });

    // Criar objetivos
    if (data.objectives && data.objectives.length > 0) {
      await prisma.objective.createMany({
        data: data.objectives.map((obj) => ({
          activityId: activity.id,
          title: obj.title,
          description: obj.description,
          points: obj.points,
        })),
      });
    }

    // Criar desafios
    if (data.challenges && data.challenges.length > 0) {
      await prisma.activityChallenge.createMany({
        data: data.challenges.map((challenge) => ({
          activityId: activity.id,
          title: challenge.title,
          description: challenge.description,
          points: challenge.points,
        })),
      });
    }

    // Criar recompensas
    if (data.rewards && data.rewards.length > 0) {
      await prisma.activityReward.createMany({
        data: data.rewards.map((reward) => ({
          activityId: activity.id,
          name: reward.name,
          type: reward.type,
          value: reward.value,
        })),
      });
    }

    return activity;
  }

  /**
   * Publicar atividade (torna disponível para alunos)
   * Regra #2 - Criação de Atividades
   */
  async publishActivity(activityId: string, teacherId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { teacher: true },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada', 404);
    }

    if (activity.teacher.userId !== teacherId) {
      throw new AppError('Você não tem permissão para publicar esta atividade', 403);
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: { status: 'PUBLISHED' },
    });

    // Criar notificação para todos os alunos
    await this.notifyStudentsAboutActivity(activityId, activity.title);

    return updated;
  }

  /**
   * Listar atividades disponíveis para aluno
   * Regra #3 - Participação dos Alunos
   */
  async getAvailableActivities(studentId: string, difficulty?: string) {
    let where: any = {
      status: 'PUBLISHED',
      dueDate: {
        gt: new Date(), // Atividades não expiradas
      },
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        teacher: {
          include: { user: true },
        },
        objectives: true,
        challenges: true,
        rewards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrar atividades que o aluno já completou
    const availableActivities = await Promise.all(
      activities.map(async (activity) => {
        const submission = await prisma.activitySubmission.findFirst({
          where: {
            activityId: activity.id,
            studentId,
            status: 'APPROVED',
          },
        });

        return {
          ...activity,
          alreadyCompleted: !!submission,
        };
      })
    );

    return availableActivities.filter((a) => !a.alreadyCompleted);
  }

  /**
   * Obter detalhes da atividade
   * Regra #2 - Criação de Atividades
   */
  async getActivityDetails(activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        teacher: {
          include: { user: true },
        },
        objectives: true,
        challenges: true,
        rewards: true,
        submissions: {
          select: {
            id: true,
            status: true,
            score: true,
          },
        },
      },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada', 404);
    }

    if (activity.status !== 'PUBLISHED') {
      throw new AppError(
        'Esta atividade não está disponível',
        403
      );
    }

    return {
      ...activity,
      totalSubmissions: activity.submissions.length,
      approvedSubmissions: activity.submissions.filter(
        (s) => s.status === 'APPROVED'
      ).length,
    };
  }

  /**
   * Atualizar atividade (apenas em DRAFT)
   * Regra #2 - Criação de Atividades
   */
  async updateActivity(
    activityId: string,
    teacherId: string,
    data: Partial<CreateActivityInput>
  ) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { teacher: true },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada', 404);
    }

    if (activity.teacher.userId !== teacherId) {
      throw new AppError('Você não tem permissão para editar esta atividade', 403);
    }

    if (activity.status !== 'DRAFT') {
      throw new AppError(
        'Apenas atividades em rascunho podem ser editadas',
        400
      );
    }

    return await prisma.activity.update({
      where: { id: activityId },
      data: {
        title: data.title,
        description: data.description,
        objective: data.objective,
        difficulty: data.difficulty,
        maxScore: data.maxScore,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  /**
   * Listar atividades criadas pelo professor
   * Regra #2 - Criação de Atividades
   */
  async getTeacherActivities(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
    });

    if (!teacher) {
      throw new AppError('Professor não encontrado', 404);
    }

    const activities = await prisma.activity.findMany({
      where: { teacherId: teacher.id },
      include: {
        submissions: true,
        objectives: true,
        challenges: true,
        rewards: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities.map((activity) => ({
      ...activity,
      stats: {
        totalSubmissions: activity.submissions.length,
        approvedSubmissions: activity.submissions.filter(
          (s) => s.status === 'APPROVED'
        ).length,
        averageScore:
          activity.submissions.length > 0
            ? (
                activity.submissions.reduce(
                  (acc, sub) => acc + (sub.score || 0),
                  0
                ) / activity.submissions.length
              ).toFixed(2)
            : 0,
      },
    }));
  }

  private async notifyStudentsAboutActivity(
    activityId: string,
    activityTitle: string
  ) {
    const students = await prisma.student.findMany();

    await Promise.all(
      students.map((student) =>
        prisma.notification.create({
          data: {
            studentId: student.id,
            type: 'NEW_ACTIVITY',
            title: `Nova atividade: ${activityTitle}`,
            message: `Uma nova atividade foi publicada. Acesse e complete para ganhar pontos!`,
            read: false,
          },
        })
      )
    );
  }
}

export default new ActivityService();