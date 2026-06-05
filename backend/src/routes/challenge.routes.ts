import { Router } from 'express';
import challengeController from '../controllers/challenge.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const challengeRouter = Router();

// Todas as rotas de desafio exigem login
challengeRouter.use(isAuthenticated);

challengeRouter.post('/', challengeController.create);
challengeRouter.get('/my-challenges', challengeController.listMyChallenges);
challengeRouter.get('/leaderboard', challengeController.getLeaderboard);
challengeRouter.patch('/:id/accept', challengeController.accept);

export { challengeRouter };