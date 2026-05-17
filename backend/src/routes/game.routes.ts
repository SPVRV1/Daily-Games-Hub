import { Router } from 'express';
import { getTodayChallenge, getChallengeByDate, getPlayedToday, submitResult } from '../controllers/game.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/:gameType/today', getTodayChallenge);
router.get('/:gameType/date/:date', getChallengeByDate);
router.get('/:gameType/played-today', /* verifyToken, */ getPlayedToday); // TODO: re-enable when JWT is ready
router.post('/:gameType/result', /* verifyToken, */ submitResult); // TODO: re-enable when JWT is ready

export default router;