import { Router } from "express";
import {
    forgotPassword,
    validateResetPasswordToken,
    resetPassword,
} from "../controllers/passwordController.js";
import {
    directAccessLogin,
    validateDirectAccessToken,
} from "../controllers/directAccessController.js";
import {
    verifyEmail,
    resendVerification,
} from "../controllers/emailVerificationController.js";
import { forgotPasswordLimiter, resendVerificationLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and token-based access endpoints
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many requests (max 3 per day)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/reset-password", (req, res, next) => {
    resetPassword(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/direct-access:
 *   get:
 *     summary: Login via direct access token
 *     description: Validates a direct access token and returns a session token for automatic login
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Direct access token from email link
 *     responses:
 *       200:
 *         description: Login result
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     token:
 *                       type: string
 *                       description: JWT session token
 *                     reportId:
 *                       type: string
 *                       format: uuid
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatarURL:
 *                           type: string
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: false
 *                     reason:
 *                       type: string
 *                       enum: [missing, invalid, used, expired, user_not_found]
 */
router.get("/direct-access", (req, res, next) => {
    directAccessLogin(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/direct-access/validate:
 *   get:
 *     summary: Validate direct access token
 *     description: Validates a direct access token without logging in
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Direct access token
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
 *                     reportId:
 *                       type: string
 *                       format: uuid
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: false
 *                     reason:
 *                       type: string
 *                       enum: [missing, invalid, used, expired]
 */
router.get("/direct-access/validate", (req, res, next) => {
    validateDirectAccessToken(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify email address
 *     description: Verifies user's email using a verification token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/verify-email", (req, res, next) => {
    verifyEmail(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Sends a new verification email to the user
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
 *         description: Verification email sent (if email exists and not verified)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If the email exists and is not verified, a verification link will be sent
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many requests (max 3 per day)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 */
router.post("/resend-verification", resendVerificationLimiter, (req, res, next) => {
    resendVerification(req, res, next).catch(next);
});

export default router;
