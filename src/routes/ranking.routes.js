import { Router } from 'express';
import rankingController from '../controllers/ranking.controller.js';

const router = Router();

router.get('/ranking/types', rankingController.getValidEntityTypes);

router.get('/ranking/:entityType', rankingController.getTopVoted);

export default router;

