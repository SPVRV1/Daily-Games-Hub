import { Router } from 'express';
import { getLeaderboard, getMyStats, getUserStats } from '../controllers/stats.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/user/:userId', getUserStats);
router.get('/user/me', verifyToken, getMyStats);

export default router;
