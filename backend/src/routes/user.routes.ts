import { Router } from 'express';
import { getLeaderboard, getProfile } from '../controllers/user.controller';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/profile', getProfile);

export default router;
