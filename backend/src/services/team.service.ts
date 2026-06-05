import prisma from '../database/client';
import { AppError } from '../types';

export class TeamService {
  /**
   * Criar nova equipe
   * Regra #10 - Equipes e Colaboração
   */
  async createTeam(leaderId: string, name: string, description: string) {
    const student = await prisma.student.findUnique({
      where: { id: leaderId },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        leaderId,
      },
    });

    // Adicionar criador como membro
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        studentId: leaderId,
        role: 'LEADER',
        joinedAt: new Date(),
      },
    });

    return team;
  }

  /**
   * Convidar membro para equipe
   * Regra #10 - Equipes e Colaboração
   */
  async inviteTeamMember(teamId: string, studentId: string, invitedByLeaderId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new AppError('Equipe não encontrada', 404);
    }

    if (team.leaderId !== invitedByLeaderId) {
      throw new AppError('Apenas o líder pode convidar membros', 403);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    const alreadyMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        studentId,
      },
    });

    if (alreadyMember) {
      throw new AppError('Este aluno já é membro da equipe', 400);
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        studentId,
        role: 'MEMBER',
        joinedAt: new Date(),
      },
    });

    // Notificar aluno
    await prisma.notification.create({
      data: {
        studentId,
        type: 'TEAM_INVITE',
        title: `Você foi convidado para a equipe ${team.name}`,
        message: `O líder ${team.name} o convidou para participar da equipe.`,
        read: false,
      },
    });

    return member;
  }

  /**
   * Listar membros da equipe
   * Regra #10 - Equipes e Colaboração
   */
  async getTeamMembers(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            student: {
              include: {
                user: true,
                currentRank: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new AppError('Equipe não encontrada', 404);
    }

    return {
      teamName: team.name,
      members: team.members.map((m) => ({
        id: m.student.id,
        name: m.student.user.name,
        email: m.student.user.email,
        rank: m.student.currentRank.name,
        role: m.role,
        joinedAt: m.joinedAt,
        totalPoints: m.student.totalPoints,
      })),
    };
  }

  /**
   * Obter equipes do aluno
   * Regra #10 - Equipes e Colaboração
   */
  async getStudentTeams(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Aluno não encontrado', 404);
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            studentId,
          },
        },
      },
      include: {
        members: {
          select: { studentId: true },
        },
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      memberCount: team.members.length,
      isLeader: team.leaderId === studentId,
    }));
  }

  /**
   * Remover membro da equipe
   * Regra #10 - Equipes e Colaboração
   */
  async removeTeamMember(teamId: string, studentId: string, removedByLeaderId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new AppError('Equipe não encontrada', 404);
    }

    if (team.leaderId !== removedByLeaderId) {
      throw new AppError('Apenas o líder pode remover membros', 403);
    }

    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        studentId,
      },
    });

    return { success: true, message: 'Membro removido da equipe' };
  }

  /**
   * Calcular pontos totais da equipe
   * Regra #10 - Equipes e Colaboração
   */
  async getTeamScore(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!team) {
      throw new AppError('Equipe não encontrada', 404);
    }

    const totalPoints = team.members.reduce(
      (sum, member) => sum + (member.student.totalPoints || 0),
      0
    );

    return {
      teamName: team.name,
      totalPoints,
      memberCount: team.members.length,
      averagePointsPerMember:
        team.members.length > 0 ? (totalPoints / team.members.length).toFixed(2) : 0,
    };
  }
}

export default new TeamService();