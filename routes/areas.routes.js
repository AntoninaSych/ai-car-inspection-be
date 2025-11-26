import { Router } from 'express';
import { getAllAreas } from '../controllers/areas.controller.js';

/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: API endpoints for managing areas
 */

/**
 * @swagger
 * /api/areas:
 *   get:
 *     summary: Get all areas
 *     tags: [Areas]
 *     responses:
 *       200:
 *         description: List of all areas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */

const router = Router();

router.get('/', getAllAreas);

export default router;
