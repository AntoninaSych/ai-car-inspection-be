import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createTask } from "../controllers/taskController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/tasks";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task with vehicle metadata and typed images
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               brand_id:
 *                 type: string
 *                 default: "fa45b0aa-f857-4fe8-8b21-a1396648bb18"
 *                 description: UUID of car brand
 *
 *               model_id:
 *                 type: string
 *                 default: "8c45310a-2d9b-466b-80a7-555235c954ad"
 *                 description: UUID of car model
 *
 *               year:
 *                 type: integer
 *                 example: 2018
 *
 *               mileage:
 *                 type: integer
 *                 example: 85000
 *
 *               description:
 *                 type: string
 *                 example: "Front bumper damage"
 *
 *               front:
 *                 type: string
 *                 format: binary
 *               back:
 *                 type: string
 *                 format: binary
 *               left:
 *                 type: string
 *                 format: binary
 *               right:
 *                 type: string
 *                 format: binary
 *               issue:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               task_id: "56fa1bc4-084b-4d9b-94b6-08ab97216d37"
 *               message: "Task created successfully"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             examples:
 *               missing_images:
 *                 summary: No images provided
 *                 value:
 *                   message: "At least one image is required"
 *               invalid_year_low:
 *                 summary: Year is lower than allowed by model
 *                 value:
 *                   message: "Year must be >= 2010"
 *               invalid_year_high:
 *                 summary: Year is higher than allowed by model
 *                 value:
 *                   message:
 *                     "Year must be <= 2023"
 *
 *       404:
 *         description: Brand or model not found
 *         content:
 *           application/json:
 *             examples:
 *               brand_not_found:
 *                 summary: Brand does not exist
 *                 value:
 *                   message: "Brand not found"
 *               model_not_found:
 *                 summary: Model does not exist
 *                 value:
 *                   message: "Model not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Default task status not found"
 */
router.post(
    "/",
    auth,
    upload.fields([
        { name: "front", maxCount: 1 },
        { name: "back", maxCount: 1 },
        { name: "left", maxCount: 1 },
        { name: "right", maxCount: 1 },
        { name: "issue", maxCount: 1 }
    ]),
    createTask
);

export default router;
