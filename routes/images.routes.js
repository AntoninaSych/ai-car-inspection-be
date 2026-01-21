import { Router } from "express";
import multer from "multer";
import auth from "../middlewares/auth.js";
import { uploadImageWithType } from "../controllers/imageController.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload one image with its type (optionally attach to an existing task)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [left, right, front, back, issue, other]
 *               task_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional existing task ID
 *     responses:
 *       201:
 *         description: Uploaded image info
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (not task owner)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/upload", auth, upload.single("file"), uploadImageWithType);

export default router;
