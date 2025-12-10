import Stripe from "stripe";
import { Task } from "../models/index.js";

const getStripeClient = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    return new Stripe(key);
};

export const stripeWebhookHandler = async (req, res) => {
    const stripe = getStripeClient();

    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        return res.status(500).json({ message: "STRIPE_WEBHOOK_SECRET is not configured" });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
        // Important: if signature fails, Task will never be updated
        console.error("Stripe webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        console.log("Stripe webhook received:", event.type);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            const taskIdRaw = session?.metadata?.task_id || session?.client_reference_id || "";
            const taskId = String(taskIdRaw);

            console.log("Stripe session completed:", {
                sessionId: session.id,
                paymentStatus: session.payment_status,
                taskId,
            });

            if (taskId) {
                const task = await Task.findByPk(taskId);

                if (!task) {
                    console.warn("Task not found for webhook taskId:", taskId);
                    return res.status(200).json({ received: true });
                }

                if (!task.is_paid) {
                    await task.update({ is_paid: true });
                    console.log("Task marked as paid:", task.id);
                } else {
                    console.log("Task already paid:", task.id);
                }
            }
        }

        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("Stripe webhook handler failed:", err);
        return res.status(500).json({ message: "Webhook handler failed" });
    }
};
