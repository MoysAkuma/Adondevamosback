import { Router } from 'express';
import rankingController from '../controllers/ranking.controller.js';

const router = Router();

/**
 * @swagger
 * /ranking/types:
 *   get:
 *     summary: Get valid entity types for ranking
 *     tags: [Ranking]
 *     responses:
 *       200:
 *         description: List of valid entity types
 */
router.get('/ranking/types', rankingController.getValidEntityTypes);

/**
 * @swagger
 * /ranking/{entityType}:
 *   get:
 *     summary: Get top voted entities by type
 *     tags: [Ranking]
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [places, trips, itineraries]
 *         description: The type of entity to get ranking for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of top entities to return (default 3)
 *     responses:
 *       200:
 *         description: Top voted entities
 *       400:
 *         description: Invalid entity type
 */
router.get('/ranking/:entityType', rankingController.getTopVoted);

export default router;
