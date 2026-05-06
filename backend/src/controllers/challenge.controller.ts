import { Request, Response } from 'express';
import challengeService from '../services/challenge.service';

export class ChallengeController {
  /**
   * POST /challenges
   */
  async create(req: Request, res: Response) {
    const { challengedStudentId, title, description, rewardPoints } = req.body;
    const challengerId = req.user.id; // ID vindo do middleware de autenticação

    const challenge = await challengeService.createChallenge(
      challengerId,
      challengedStudentId,
      title,
      description,
      rewardPoints
    );

    return res.status(201).json(challenge);
  }

  /**
   * PATCH /challenges/:id/accept
   */
  async accept(req: Request, res: Response) {
    const { id } = req.params;
    const studentId = req.user.id;

    const challenge = await challengeService.acceptChallenge(id, studentId);
    return res.json(challenge);
  }

  /**
   * GET /challenges/my-challenges
   */
  async listMyChallenges(req: Request, res: Response) {
    const studentId = req.user.id;
    const { status } = req.query;

    const challenges = await challengeService.getStudentChallenges(
      studentId, 
      status as string
    );
    return res.json(challenges);
  }

  /**
   * GET /challenges/leaderboard
   */
  async getLeaderboard(req: Request, res: Response) {
    const leaderboard = await challengeService.getChallengeLeaderboard();
    return res.json(leaderboard);
  }
}

export default new ChallengeController();