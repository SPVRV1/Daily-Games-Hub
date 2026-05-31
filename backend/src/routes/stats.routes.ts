import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getLeaderboard, getMyStats } from '../controllers/stats.controller.js';

const router = Router();

router.get('/me', verifyToken, getMyStats);
router.get('/leaderboard', getLeaderboard);

export default router;
