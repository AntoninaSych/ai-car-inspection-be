import { Router } from "express";
import {
    createCheckoutSession,
    getCheckoutSession,
    confirmCheckoutSession,
} from "../controllers/stripeController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe Checkout demo endpoints
 */

/**
 * @swagger
 * /api/stripe/checkout-session:
 *   post:
 *     summary: Create Stripe Checkout session (demo)
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - amount
 *             properties:
 *               task_id:
 *                 type: string
 *                 example: "demo-123"
 *               amount:
 *                 type: integer
 *                 example: 2000
 *                 description: Amount in minor units (e.g. 2000 = 20.00)
 *               currency:
 *                 type: string
 *                 example: "gbp"
 *     responses:
 *       201:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 session_id:
 *                   type: string
 *                   example: "cs_test_123"
 *                 url:
 *                   type: string
 *                   example: "https://checkout.stripe.com/c/pay/cs_test_123"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server/Stripe error
 */
router.post("/checkout-session", (req, res, next) => {
    createCheckoutSession(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/stripe/checkout-session/{sessionId}:
 *   get:
 *     summary: Get Stripe Checkout session details (demo)
 *     tags: [Stripe]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe session id (cs_*)
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     payment_status:
 *                       type: string
 *                       example: "paid"
 *                     amount_total:
 *                       type: integer
 *                       example: 2000
 *                     currency:
 *                       type: string
 *                       example: "gbp"
 *                     client_reference_id:
 *                       type: string
 *                       example: "demo-123"
 *                     metadata:
 *                       type: object
 *                       additionalProperties: true
 *       404:
 *         description: Not found
 *       500:
 *         description: Server/Stripe error
 */
router.get("/checkout-session/:sessionId", (req, res, next) => {
    getCheckoutSession(req, res, next).catch(next);
});

/**
 * @swagger
 * /api/stripe/confirm:
 *   post:
 *     summary: Confirm Checkout session and mark task as paid
 *     description: >
 *       Use this after redirect to success page. Backend retrieves session from Stripe,
 *       verifies status is complete/paid and marks the Task as paid using task_id from metadata.
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: string
 *                 example: "cs_test_123456789"
 *     responses:
 *       200:
 *         description: Task marked as paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 task_id:
 *                   type: string
 *                   example: "demo-123"
 *                 is_paid:
 *                   type: boolean
 *                   example: true
 *                 stripe:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                       example: "cs_test_123456789"
 *                     payment_status:
 *                       type: string
 *                       example: "paid"
 *                     amount_total:
 *                       type: integer
 *                       example: 2000
 *                     currency:
 *                       type: string
 *                       example: "gbp"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task or session not found
 *       409:
 *         description: Payment not completed
 *       500:
 *         description: Server/Stripe error
 */
router.post("/confirm", (req, res, next) => {
    confirmCheckoutSession(req, res, next).catch(next);
});

export default router;
