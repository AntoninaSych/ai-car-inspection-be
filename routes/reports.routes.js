import { Router } from "express";
import auth from "../middlewares/auth.js";
import { getCurrentUserReports, getReportById } from "../controllers/reportController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API endpoints for managing reports
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DamageItem:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *           description: Location of the damage (e.g., front bumper, door)
 *         severity:
 *           type: string
 *           enum: [minor, moderate, severe, unknown]
 *           description: Severity level of the damage
 *         description:
 *           type: string
 *           description: Detailed description of the damage
 *         estimated_parts_cost_original:
 *           type: string
 *           description: Approximate cost for OEM parts only
 *         estimated_parts_cost_alternative:
 *           type: string
 *           description: Approximate cost for aftermarket parts only
 *         estimated_labor_cost:
 *           type: string
 *           description: Approximate labor/repair work cost
 *     ReportData:
 *       type: object
 *       properties:
 *         damage_detected:
 *           type: boolean
 *           description: Whether any damage was detected
 *         damages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DamageItem'
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           description: List of recommendations for repairs
 *         estimated_total_parts_cost_original:
 *           type: string
 *           description: Total OEM parts cost
 *         estimated_total_parts_cost_alternative:
 *           type: string
 *           description: Total aftermarket parts cost
 *         estimated_total_labor_cost:
 *           type: string
 *           description: Total labor cost
 *         summary:
 *           type: string
 *           description: Brief summary of the inspection
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Report unique identifier
 *         task_id:
 *           type: string
 *           format: uuid
 *           description: Associated task identifier
 *         data:
 *           $ref: '#/components/schemas/ReportData'
 *         url:
 *           type: string
 *           nullable: true
 *           description: Optional URL to full report
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reports/current:
 *   get:
 *     summary: Get current user's reports
 *     description: Retrieves all reports associated with the authenticated user's tasks, ordered by creation date (newest first)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
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
 *                         description: "Small scratch on lower section"
 *                         estimated_parts_cost_original: "$200-300"
 *                         estimated_parts_cost_alternative: "$100-150"
 *                         estimated_labor_cost: "$100-150"
 *                     recommendations:
 *                       - "Repaint affected area"
 *                       - "Check for underlying damage"
 *                     estimated_total_parts_cost_original: "$200-300"
 *                     estimated_total_parts_cost_alternative: "$100-150"
 *                     estimated_total_labor_cost: "$100-150"
 *                     summary: "Minor cosmetic damage detected on front bumper"
 *                   url: null
 *                   created_at: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Permission denied
 */
router.get("/current", auth, getCurrentUserReports);

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: Get report by ID
 *     description: Retrieves a specific report by its ID. User must own the associated task.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The report ID
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *             example:
 *               ok: true
 *               report:
 *                 id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 task_id: "56fa1bc4-084b-4d9b-94b6-08ab97216d37"
 *                 data:
 *                   damage_detected: true
 *                   damages:
 *                     - location: "front bumper"
 *                       severity: "minor"
 *                       description: "Small scratch on lower section"
 *                       estimated_parts_cost_original: "$200-300"
 *                       estimated_parts_cost_alternative: "$100-150"
 *                       estimated_labor_cost: "$100-150"
 *                   recommendations:
 *                     - "Repaint affected area"
 *                   estimated_total_parts_cost_original: "$200-300"
 *                   estimated_total_parts_cost_alternative: "$100-150"
 *                   estimated_total_labor_cost: "$100-150"
 *                   summary: "Minor cosmetic damage detected"
 *                 url: null
 *                 created_at: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Permission denied - User does not own the associated task
 *       404:
 *         description: Report not found
 */
router.get("/:reportId", auth, getReportById);

export default router;
