import { Router } from 'express';
import { getTodayChallenge, getPlayedToday, submitResult } from '../controllers/game.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/:gameType/today', getTodayChallenge);
router.get('/:gameType/played-today', verifyToken, getPlayedToday);
router.post('/:gameType/result', verifyToken, submitResult);

export default router;