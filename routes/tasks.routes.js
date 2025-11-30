import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createTask } from "../controllers/taskController.js";

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create task using previously uploaded images
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand_id
 *               - model_id
 *               - image_ids
 *             properties:
 *               brand_id:
 *                 type: string
 *                 example: "BMW"
 *               model_id:
 *                 type: string
 *                 example: "BMW_1M"
 *               description:
 *                 type: string
 *                 example: "Rear bumper damage"
 *               image_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "a659c33b-4056-4d22-800c-f744fecf30fc"
 *
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Brand or model not found
 */
router.post("/", auth, createTask);

export default router;
