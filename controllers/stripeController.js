import Stripe from "stripe";
import HttpError from "../helpers/HttpError.js";
import ErrorCodes from "../helpers/errorCodes.js";
import { Task } from "../models/index.js";

const getStripeClient = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw HttpError(500, "STRIPE_SECRET_KEY is not configured", ErrorCodes.PAYMENT_STRIPE_NOT_CONFIGURED);
    return new Stripe(key);
};

const getFrontendBaseUrl = () => {
    return process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
};

export const createCheckoutSession = async (req, res, next) => {
    const stripe = getStripeClient();

    const { task_id, amount, currency } = req.body || {};

    if (typeof task_id !== "string" || !task_id.trim()) {
        return next(HttpError(400, "task_id is required", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 50) {
        return next(HttpError(400, "amount must be an integer in minor units and >= 50", ErrorCodes.VALIDATION_INVALID_AMOUNT));
    }

    const task = await Task.findByPk(task_id);

    if (!task) {
        return next(HttpError(404, "Task not found", ErrorCodes.RESOURCE_TASK_NOT_FOUND));
    }

    // If you protect the route with auth middleware, req.user should exist
    // For demo/testing without auth we don't block here, but if user exists we can enforce ownership
    if (req.user?.id && task.owner_id && task.owner_id !== req.user.id) {
        return next(HttpError(403, "You don't have permission to pay for this task", ErrorCodes.RESOURCE_ACCESS_DENIED));
    }

    if (task.is_paid) {
        return res.status(200).json({
            ok: true,
            message: "Task is already paid",
            task_id: task.id,
        });
    }

    const cur = String(currency || process.env.STRIPE_CURRENCY || "gbp").toLowerCase();

    const successUrl =
        process.env.STRIPE_SUCCESS_URL ||
        `${getFrontendBaseUrl()}/stripe/success?session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
        process.env.STRIPE_CANCEL_URL ||
        `${getFrontendBaseUrl()}/stripe/cancel`;

    // TODO add brand, model and year to line_items.price_data.product_data.name
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        client_reference_id: task.id,
        metadata: {
            task_id: task.id,
            amount: String(parsedAmount),
            currency: cur,
        },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: cur,
                    unit_amount: parsedAmount,
                    product_data: {
                        name: `Car RepAIr Report (ID: ${task.id})`,
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
        return next(HttpError(400, "sessionId is required", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
        return next(HttpError(404, "Session not found", ErrorCodes.RESOURCE_SESSION_NOT_FOUND));
    }

    return res.status(200).json({
        ok: true,
        session: {
            id: session.id,
            status: session.status,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            client_reference_id: session.client_reference_id,
            metadata: session.metadata,
        },
    });
};

export const confirmCheckoutSession = async (req, res, next) => {
    const stripe = getStripeClient();

    const { session_id } = req.body || {};

    if (typeof session_id !== "string" || !session_id.trim()) {
        return next(HttpError(400, "session_id is required", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
        return next(HttpError(404, "Session not found", ErrorCodes.RESOURCE_SESSION_NOT_FOUND));
    }

    if (session.status !== "complete" || session.payment_status !== "paid") {
        return next(HttpError(409, "Payment is not completed", ErrorCodes.VALIDATION_FAILED));
    }

    const taskId = session?.metadata?.task_id || session?.client_reference_id;

    if (!taskId) {
        return next(HttpError(400, "task_id is missing in session metadata", ErrorCodes.VALIDATION_REQUIRED_FIELD));
    }

    const task = await Task.findByPk(taskId);

    if (!task) {
        return next(HttpError(404, "Task not found", ErrorCodes.RESOURCE_TASK_NOT_FOUND));
    }

    if (req.user?.id && task.owner_id && task.owner_id !== req.user.id) {
        return next(HttpError(403, "You don't have permission to update this task", ErrorCodes.RESOURCE_ACCESS_DENIED));
    }

    if (!task.is_paid) {
        await task.update({ is_paid: true });
    }

    return res.status(200).json({
        ok: true,
        task_id: task.id,
        is_paid: task.is_paid,
        stripe: {
            session_id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
        },
    });
};
