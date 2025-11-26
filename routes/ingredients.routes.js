import { Router } from 'express';
import { getAllIngredients } from '../controllers/ingredients.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: API endpoints for managing ingredients
 */

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: Get all ingredients
 *     tags: [Ingredients]
 *     responses:
 *       200:
 *         description: List of all ingredients
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
 *                   thumb:
 *                     type: string
 *                   desc:
 *                     type: string
 */

router.get('/', getAllIngredients);

export default router;
