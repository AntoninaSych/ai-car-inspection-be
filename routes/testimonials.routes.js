import { Router } from 'express';
import { getAllTestimonials } from '../controllers/testimonials.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: API endpoints for managing testimonials
 */

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: List of all testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   testimonial:
 *                     type: string
 */

router.get('/', getAllTestimonials);

export default router;
