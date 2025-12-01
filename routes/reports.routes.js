import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getCurrentUserReports } from "../controllers/reportController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API endpoints for managing reports
 */

/**
 * @swagger
 * /api/reports/current:
 *   get:
 *     summary: Get current user's reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               reports:
 *                 - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   task_id: "56fa1bc4-084b-4d9b-94b6-08ab97216d37"
 *                   data:
 *                     damage_detected: true
 *                     damages:
 *                       - location: "front bumper"
 *                         severity: "minor"
 *                         description: "Small scratch"
 *                         estimated_repair_cost_original: "$300-400"
 *                         estimated_repair_cost_alternative: "$150-200"
 *                     summary: "Minor cosmetic damage detected"
 *                   url: null
 *                   created_at: "2024-01-15T10:30:00Z"
 *       403:
 *         description: Permission denied
 */
router.get("/current", auth, getCurrentUserReports);

export default router;
