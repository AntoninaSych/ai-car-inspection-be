import { Router } from "express";
import { createCheckoutSession, getCheckoutSession } from "../controllers/stripeController.js";

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
 *               - fake_id
 *               - amount
 *             properties:
 *               fake_id:
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
 *       404:
 *         description: Not found
 *       500:
 *         description: Server/Stripe error
 */
router.get("/checkout-session/:sessionId", (req, res, next) => {
    getCheckoutSession(req, res, next).catch(next);
});

export default router;
