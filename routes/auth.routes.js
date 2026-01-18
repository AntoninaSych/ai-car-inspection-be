import { Router } from "express";
import {
    forgotPassword,
    validateResetPasswordToken,
    resetPassword,
} from "../controllers/passwordController.js";
import { forgotPasswordLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Password reset endpoints
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset link to the user's email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset link sent (or email does not exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset link sent
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests (max 3 per day)
 */
router.post("/forgot-password", forgotPasswordLimiter, (req, res, next) => {
    forgotPassword(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/reset-password/validate:
 *   get:
 *     summary: Validate reset token
 *     description: Validates password reset token from query string
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: false
 *                     reason:
 *                       type: string
 *                       enum: [used, expired, invalid]
 *                       example: expired
 */
router.get("/reset-password/validate", (req, res, next) => {
    validateResetPasswordToken(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets user password using a valid reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: e3f1c8d4a9b2...
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       200:
 *         description: Password successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", (req, res, next) => {
    resetPassword(req, res, next).catch(next);
});

export default router;
