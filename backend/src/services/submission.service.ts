import prisma from '../database/client';
import { AppError } from '../types';
import studentService from './student.service';

export class SubmissionService {
  /**
   * Enviar resposta de atividade
   * Regra #3 - Participação dos Alunos
   * Regra #4 - Avaliação e Pontuação
   */
  async submitActivity(
    studentId: string,
    activityId: string,
    answerText: string,
    attachments?: string[]
  ) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada', 404);
    }

    if (activity.dueDate < new Date()) {
      throw new AppError('Prazo da atividade expirou', 400);
    }

    // Verificar se já existe submissão aprovada
    const existingSubmission = await prisma.activitySubmission.findFirst({
      where: {
        studentId,
        activityId,
        status: 'APPROVED',
      },
    });

    if (existingSubmission) {
      throw new AppError('Você já completou esta atividade', 400);
    }

    const submission = await prisma.activitySubmission.create({
      data: {
        studentId,
        activityId,
        answerText,
        attachments: attachments || [],
        status: 'PENDING',
        submittedAt: new Date(),
      },
      include: {
        activity: true,
        student: true,
      },
    });

    // Notificar professor
    await this.notifyTeacherAboutSubmission(activity.teacherId, submission);

    return submission;
  }

  /**
   * Avaliar submissão (apenas professor)
   * Regra #4 - Avaliação e Pontuação
   */
  async evaluateSubmission(
    submissionId: string,
    teacherId: string,
    score: number,
    feedback: string,
    status: 'APPROVED' | 'REJECTED'
  ) {
    const submission = await prisma.activitySubmission.findUnique({
      where: { id: submissionId },
      include: {
        activity: true,
        student: true,
      },
    });

    if (!submission) {
      throw new AppError('Submissão não encontrada', 404);
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
    });

    if (!teacher || submission.activity.teacherId !== teacher.id) {
      throw new AppError('Você não tem permissão para avaliar esta submissão', 403);
    }

    // Validar score
    if (score < 0 || score > submission.activity.maxScore) {
      throw new AppError(
        `Score deve estar entre 0 e ${submission.activity.maxScore}`,
        400
      );
    }

    const evaluatedSubmission = await prisma.activitySubmission.update({
      where: { id: submissionId },
      data: {
        score,
        status,
        evaluatedAt: new Date(),
      },
    });

    // Criar feedback
    await prisma.feedback.create({
      data: {
        submissionId,
        teacherId: teacher.id,
        comment: feedback,
      },
    });

    // Se aprovado, adicionar pontos ao aluno
    if (status === 'APPROVED') {
      const pointsEarned = Math.round(
        (score / submission.activity.maxScore) * 100
      );

      await studentService.updateStudentRank(
        submission.student.id,
        pointsEarned
      );

      // Distribuir recompensas
      await this.distributeRewards(submission.student.id, submission.activity.id);

      // Notificar aluno sobre aprovação
      await this.notifyStudentAboutApproval(
        submission.student.id,
        submission.activity.title,
        pointsEarned
      );
    } else {
      // Notificar aluno sobre rejeição
      await this.notifyStudentAboutRejection(
        submission.student.id,
        submission.activity.title,
        feedback
      );
    }

    return evaluatedSubmission;
  }

  /**
   * Obter histórico de submissões do aluno
   * Regra #15 - Histórico de Atividades
   */
  async getStudentSubmissionHistory(studentId: string, limit: number = 20, skip: number = 0) {
    const submissions = await prisma.activitySubmission.findMany({
      where: { studentId },
      include: {
        activity: true,
        feedback: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip,
    });

    return submissions.map((sub) => ({
      id: sub.id,
      activityTitle: sub.activity.title,
      score: sub.score,
      status: sub.status,
      submittedAt: sub.submittedAt,
      evaluatedAt: sub.evaluatedAt,
      feedback: sub.feedback
        ? {
            comment: sub.feedback.comment,
            teacher: sub.feedback.teacher.user.name,
            createdAt: sub.feedback.createdAt,
          }
        : null,
    }));
  }

  /**
   * Obter submissões pendentes de um professor
   * Regra #4 - Avaliação e Pontuação
   */
  async getPendingSubmissions(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        activities: true,
      },
    });

    if (!teacher) {
      throw new AppError('Professor não encontrado', 404);
    }

    const activityIds = teacher.activities.map((a) => a.id);

    const submissions = await prisma.activitySubmission.findMany({
      where: {
        activityId: { in: activityIds },
        status: 'PENDING',
      },
      include: {
        activity: true,
        student: {
          include: { user: true },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return submissions;
  }

  /**
   * Obter análise de desempenho em uma atividade
   * Regra #7 - Relatórios e Análises
   */
  async getActivityPerformanceAnalysis(activityId: string, teacherId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        teacher: true,
        submissions: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada', 404);
    }

    if (activity.teacher.userId !== teacherId) {
      throw new AppError('Você não tem permissão para acessar este relatório', 403);
    }

    const approved = activity.submissions.filter(
      (s) => s.status === 'APPROVED'
    );
    const rejected = activity.submissions.filter(
      (s) => s.status === 'REJECTED'
    );
    const pending = activity.submissions.filter(
      (s) => s.status === 'PENDING'
    );

    const scores = approved.map((s) => s.score || 0);
    const averageScore =
      scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : 0;

    return {
      activityTitle: activity.title,
      totalSubmissions: activity.submissions.length,
      stats: {
        approved: approved.length,
        rejected: rejected.length,
        pending: pending.length,
      },
      scoreAnalysis: {
        average: averageScore,
        highest: Math.max(...scores),
        lowest: Math.min(...scores),
      },
      submissions: activity.submissions.map((sub) => ({
        studentName: sub.student.user.name,
        score: sub.score,
        status: sub.status,
        submittedAt: sub.submittedAt,
      })),
    };
  }

  private async distributeRewards(studentId: string, activityId: string) {
    const rewards = await prisma.activityReward.findMany({
      where: { activityId },
    });

    await Promise.all(
      rewards.map((reward) =>
        prisma.studentReward.create({
          data: {
            studentId,
            rewardId: reward.id,
            earnedAt: new Date(),
          },
        })
      )
    );
  }

  private async notifyTeacherAboutSubmission(teacherId: string, submission: any) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (teacher) {
      // Aqui você pode implementar envio de email real
      console.log(
        `[NOTIFICATION] Professor ${teacher.user.email} tem uma nova submissão para avaliar`
      );
    }
  }

  private async notifyStudentAboutApproval(
    studentId: string,
    activityTitle: string,
    points: number
  ) {
    await prisma.notification.create({
      data: {
        studentId,
        type: 'SUBMISSION_APPROVED',
        title: `Atividade aprovada: ${activityTitle}`,
        message: `Parabéns! Sua resposta foi aprovada e você ganhou ${points} pontos!`,
        read: false,
      },
    });
  }

  private async notifyStudentAboutRejection(
    studentId: string,
    activityTitle: string,
    feedback: string
  ) {
    await prisma.notification.create({
      data: {
        studentId,
        type: 'SUBMISSION_REJECTED',
        title: `Atividade devolvida: ${activityTitle}`,
        message: `Sua resposta precisa de ajustes. Feedback: ${feedback}`,
        read: false,
      },
    });
  }
}

export default new SubmissionService();
