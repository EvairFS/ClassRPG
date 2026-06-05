import prisma from '../database/client';
import { AppError } from '../types';

export class StudentService {
  /**
   * Obter perfil completo do aluno com ranking e progresso
   * Regra #5 - Patentes e Níveis
   * Regra #15 - Histórico de Atividades
   */
  async getStudentProfile(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        currentRank: true,
        badges: {
          include: {
            badge: true,
          },
        },
        submissions: {
          include: {
            activity: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        teams: true,
        rewards: {
          include: {
            reward: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    // Calcular estatísticas
    const totalPoints = student.totalPoints || 0;
    const completedActivities = student.submissions.filter(
      (sub) => sub.status === 'APPROVED'
    ).length;

    const progressToNextRank = this.calculateProgressToNextRank(
      student.currentRankId,
      totalPoints
    );

    return {
      user: {
        id: student.user.id,
        name: student.user.name,
        email: student.user.email,
      },
      stats: {
        totalPoints,
        completedActivities,
        currentRank: student.currentRank,
        progressToNextRank,
      },
      badges: student.badges.map((sb) => ({
        id: sb.badge.id,
        name: sb.badge.name,
        description: sb.badge.description,
        icon: sb.badge.icon,
        unlockedAt: sb.unlockedAt,
      })),
      recentSubmissions: student.submissions.map((sub) => ({
        id: sub.id,
        activityName: sub.activity.title,
        score: sub.score,
        status: sub.status,
        submittedAt: sub.createdAt,
      })),
      teams: student.teams,
      availableRewards: student.rewards.map((sr) => ({
        id: sr.reward.id,
        name: sr.reward.name,
        description: sr.reward.description,
        type: sr.reward.type,
      })),
    };
  }

  /**
   * Listar ranking de alunos
   * Regra #5 - Patentes e Níveis
   */
  async getRankingLeaderboard(limit: number = 50, skip: number = 0) {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        currentRank: true,
      },
      orderBy: {
        totalPoints: 'desc',
      },
      take: limit,
      skip,
    });

    return students.map((student, index) => ({
      position: skip + index + 1,
      studentId: student.id,
      studentName: student.user.name,
      totalPoints: student.totalPoints || 0,
      rank: student.currentRank.name,
      rankIcon: student.currentRank.icon,
    }));
  }

  /**
   * Calcular próximo nível baseado em pontos
   * Regra #5 - Patentes e Níveis
   * Regra #16 - Ajuste de Dificuldade Automático
   */
  async updateStudentRank(studentId: string, pointsEarned: number) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { currentRank: true },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    const newTotalPoints = (student.totalPoints || 0) + pointsEarned;

    // Definir os limites de pontos para cada patente
    const rankThresholds = [
      { rankId: 'rank_novice', minPoints: 0 },
      { rankId: 'rank_apprentice', minPoints: 100 },
      { rankId: 'rank_journeyman', minPoints: 300 },
      { rankId: 'rank_expert', minPoints: 600 },
      { rankId: 'rank_master', minPoints: 1000 },
      { rankId: 'rank_legendary', minPoints: 2000 },
    ];

    let newRankId = student.currentRankId;
    for (let i = rankThresholds.length - 1; i >= 0; i--) {
      if (newTotalPoints >= rankThresholds[i].minPoints) {
        newRankId = rankThresholds[i].rankId;
        break;
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        totalPoints: newTotalPoints,
        currentRankId: newRankId,
      },
      include: { currentRank: true },
    });

    // Se subiu de rank, criar notificação
    if (newRankId !== student.currentRankId) {
      await this.createRankUpNotification(studentId, updatedStudent.currentRank);
    }

    return {
      success: true,
      newTotalPoints,
      newRank: updatedStudent.currentRank.name,
      rankedUp: newRankId !== student.currentRankId,
    };
  }

  /**
   * Obter sugestões de atividades baseado no nível do aluno
   * Regra #16 - Ajuste de Dificuldade Automático
   */
  async getRecommendedActivities(studentId: string, limit: number = 5) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { currentRank: true, submissions: true },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    // Determinar dificuldade recomendada baseado no rank
    const recommendedDifficulty = this.getDifficultyByRank(
      student.currentRank.name
    );

    const activities = await prisma.activity.findMany({
      where: {
        difficulty: recommendedDifficulty,
        submissions: {
          none: {
            studentId,
          },
        },
      },
      include: {
        teacher: true,
      },
      take: limit,
    });

    return activities;
  }

  private calculateProgressToNextRank(
    currentRankId: string,
    totalPoints: number
  ): number {
    const rankThresholds: Record<string, { current: number; next: number }> = {
      rank_novice: { current: 0, next: 100 },
      rank_apprentice: { current: 100, next: 300 },
      rank_journeyman: { current: 300, next: 600 },
      rank_expert: { current: 600, next: 1000 },
      rank_master: { current: 1000, next: 2000 },
      rank_legendary: { current: 2000, next: 9999 },
    };

    const thresholds = rankThresholds[currentRankId] || rankThresholds.rank_novice;
    const progress =
      ((totalPoints - thresholds.current) /
        (thresholds.next - thresholds.current)) *
      100;

    return Math.min(Math.max(progress, 0), 100);
  }

  private getDifficultyByRank(rankName: string): string {
    const difficultyMap: Record<string, string> = {
      NOVICE: 'EASY',
      APPRENTICE: 'EASY',
      JOURNEYMAN: 'MEDIUM',
      EXPERT: 'MEDIUM',
      MASTER: 'HARD',
      LEGENDARY: 'HARD',
    };

    return difficultyMap[rankName] || 'EASY';
  }

  private async createRankUpNotification(studentId: string, newRank: any) {
    await prisma.notification.create({
      data: {
        studentId,
        type: 'RANK_UP',
        title: `Parabéns! Você atingiu o nível ${newRank.name}`,
        message: `Você subiu para a patente ${newRank.name}. Novas atividades desbloqueadas!`,
        read: false,
      },
    });
  }
}

export default new StudentService();