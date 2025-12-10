import Stripe from "stripe";
import HttpError from "../helpers/HttpError.js";

const getStripeClient = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw HttpError(500, "STRIPE_SECRET_KEY is not configured");
    return new Stripe(key);
};

const getFrontendBaseUrl = () => {
    return process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
};

export const createCheckoutSession = async (req, res, next) => {
    const stripe = getStripeClient();

    const { fake_id, amount, currency } = req.body || {};

    if (typeof fake_id !== "string" || !fake_id.trim()) {
        return next(HttpError(400, "fake_id is required"));
    }

    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 50) {
        return next(HttpError(400, "amount must be an integer in minor units and >= 50"));
    }

    const cur = String(currency || process.env.STRIPE_CURRENCY || "gbp").toLowerCase();

    const successUrl =
        process.env.STRIPE_SUCCESS_URL ||
        `${getFrontendBaseUrl()}/stripe/success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
        process.env.STRIPE_CANCEL_URL ||
        `${getFrontendBaseUrl()}/stripe/cancel`;

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        client_reference_id: fake_id,
        metadata: { fake_id },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: cur,
                    unit_amount: parsedAmount,
                    product_data: {
                        name: `Demo payment (ID: ${fake_id})`,
                    },
                },
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return res.status(201).json({
        ok: true,
        session_id: session.id,
        url: session.url,
    });
};

export const getCheckoutSession = async (req, res, next) => {
    const stripe = getStripeClient();

    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== "string") {
        return next(HttpError(400, "sessionId is required"));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
        return next(HttpError(404, "Session not found"));
    }

    return res.status(200).json({
        ok: true,
        session: {
            id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            client_reference_id: session.client_reference_id,
            metadata: session.metadata,
        },
    });
};
