import { Router } from 'express';
import { getTodayChallenge, getPlayedToday, submitResult } from '../controllers/game.controller.js';
//import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:gameType/today', /*authMiddleware, */ getTodayChallenge);
router.get('/:gameType/played-today', /*authMiddleware,*/ getPlayedToday);
router.post('/:gameType/result', /*authMiddleware,*/ submitResult);

export default router;