import prisma from '../database/client';
import { AppError } from '../types';

export class ChallengeService {
  /**
   * Criar desafio entre alunos
   * Regra #9 - Desafios entre Alunos
   */
  async createChallenge(
    challengerStudentId: string,
    challengedStudentId: string,
    title: string,
    description: string,
    rewardPoints: number
  ) {
    const challenger = await prisma.student.findUnique({
      where: { id: challengerStudentId },
    });

    const challenged = await prisma.student.findUnique({
      where: { id: challengedStudentId },
    });

    if (!challenger || !challenged) {
      throw new AppError('Um ou ambos os alunos não foram encontrados', 404);
    }

    if (challengerStudentId === challengedStudentId) {
      throw new AppError('Você não pode desafiar a si mesmo', 400);
    }

    const challenge = await prisma.challenge.create({
      data: {
        challengerStudentId,
        challengedStudentId,
        title,
        description,
        rewardPoints,
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    // Notificar aluno desafiado
    await prisma.notification.create({
      data: {
        studentId: challengedStudentId,
        type: 'NEW_CHALLENGE',
        title: `Novo desafio: ${title}`,
        message: `Você foi desafiado! Aceite e compete para ganhar ${rewardPoints} pontos.`,
        read: false,
      },
    });

    return challenge;
  }

  /**
   * Aceitar desafio
   * Regra #9 - Desafios entre Alunos
   */
  async acceptChallenge(challengeId: string, studentId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new AppError('Desafio não encontrado', 404);
    }

    if (challenge.challengedStudentId !== studentId) {
      throw new AppError('Você não foi desafiado neste desafio', 403);
    }

    if (challenge.status !== 'PENDING') {
      throw new AppError('Este desafio não está disponível', 400);
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Notificar desafiante
    await prisma.notification.create({
      data: {
        studentId: challenge.challengerStudentId,
        type: 'CHALLENGE_ACCEPTED',
        title: `${challenge.title} foi aceito!`,
        message: 'Seu desafio foi aceito. Prepare-se para competir!',
        read: false,
      },
    });

    return updated;
  }

  /**
   * Finalizar desafio (com vencedor)
   * Regra #9 - Desafios entre Alunos
   */
  async finishChallenge(
    challengeId: string,
    winnerId: string,
    winnerScore: number,
    loserScore: number
  ) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new AppError('Desafio não encontrado', 404);
    }

    if (challenge.status !== 'ACCEPTED') {
      throw new AppError('Este desafio não está em progresso', 400);
    }

    const loserId =
      winnerId === challenge.challengerStudentId
        ? challenge.challengedStudentId
        : challenge.challengerStudentId;

    if (
      winnerId !== challenge.challengerStudentId &&
      winnerId !== challenge.challengedStudentId
    ) {
      throw new AppError('O vencedor deve ser um dos participantes do desafio', 400);
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        winnerId,
        completedAt: new Date(),
      },
    });

    // Distribuir pontos para vencedor
    const winnerStudent = await prisma.student.findUnique({
      where: { id: winnerId },
    });

    if (winnerStudent) {
      await prisma.student.update({
        where: { id: winnerId },
        data: {
          totalPoints: {
            increment: challenge.rewardPoints,
          },
        },
      });

      // Notificar vencedor
      await prisma.notification.create({
        data: {
          studentId: winnerId,
          type: 'CHALLENGE_WON',
          title: `Você venceu o desafio: ${challenge.title}`,
          message: `Parabéns! Você ganhou ${challenge.rewardPoints} pontos!`,
          read: false,
        },
      });
    }

    // Notificar perdedor
    await prisma.notification.create({
      data: {
        studentId: loserId,
        type: 'CHALLENGE_LOST',
        title: `Você perdeu o desafio: ${challenge.title}`,
        message: 'Não desista! Tente novamente na próxima vez.',
        read: false,
      },
    });

    return updated;
  }

  /**
   * Listar desafios do aluno
   * Regra #9 - Desafios entre Alunos
   */
  async getStudentChallenges(studentId: string, status?: string) {
    let where: any = {
      OR: [
        { challengerStudentId: studentId },
        { challengedStudentId: studentId },
      ],
    };

    if (status) {
      where.status = status;
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        challengerStudent: {
          include: { user: true },
        },
        challengedStudent: {
          include: { user: true },
        },
        winner: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      challenger: challenge.challengerStudent.user.name,
      challenged: challenge.challengedStudent.user.name,
      status: challenge.status,
      rewardPoints: challenge.rewardPoints,
      winner: challenge.winner?.user.name || null,
      createdAt: challenge.createdAt,
      completedAt: challenge.completedAt,
    }));
  }

  /**
   * Obter ranking de desafios
   * Regra #9 - Desafios entre Alunos
   */
  async getChallengeLeaderboard(limit: number = 20) {
    const completedChallenges = await prisma.challenge.findMany({
      where: { status: 'COMPLETED' },
      include: {
        winner: {
          include: { user: true },
        },
      },
    });

    // Contar vitórias por aluno
    const wins: Record<string, { name: string; wins: number; points: number }> = {};

    completedChallenges.forEach((challenge) => {
      if (challenge.winner) {
        const winnerId = challenge.winner.id;
        if (!wins[winnerId]) {
          wins[winnerId] = {
            name: challenge.winner.user.name,
            wins: 0,
            points: 0,
          };
        }
        wins[winnerId].wins += 1;
        wins[winnerId].points += challenge.rewardPoints;
      }
    });

    const leaderboard = Object.values(wins)
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return leaderboard.map((entry, index) => ({
      position: index + 1,
      ...entry,
    }));
  }
}

export default new ChallengeService();