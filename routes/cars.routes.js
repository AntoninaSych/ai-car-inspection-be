import { Router } from "express";
import { getBrands, getModelsByBrand } from "../controllers/cars.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Endpoints for car brand and model data
 */

/**
 * @swagger
 * /api/cars/brands:
 *   get:
 *     summary: Get car brands with optional search
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search brands by partial name (case-insensitive)
 *     responses:
 *       200:
 *         description: List of matching brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       cyrillic_name:
 *                         type: string
 *                       country:
 *                         type: string
 *                       popular:
 *                         type: boolean
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/brands", (req, res, next) => {
    getBrands(req, res).catch(next);
});

/**
 * @swagger
 * /api/cars/brands/{brandId}/models:
 *   get:
 *     summary: Get all models for a specific brand
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID (e.g. ABARTH)
 *     responses:
 *       200:
 *         description: List of car models for the brand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       brand_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       cyrillic_name:
 *                         type: string
 *                       year_from:
 *                         type: integer
 *                       year_to:
 *                         type: integer
 *                       class:
 *                         type: string
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/brands/:brandId/models", (req, res, next) => {
    getModelsByBrand(req, res).catch(next);
});

export default router;
