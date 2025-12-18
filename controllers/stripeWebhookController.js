import Stripe from "stripe";
import { Task } from "../models/index.js";
import { addTaskToQueue } from "../services/taskQueueService.js";

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
        console.error("Stripe webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        console.log("Stripe webhook received:", event.type);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const taskId = session?.metadata?.task_id;

          console.log("Stripe session completed:", {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            taskId,
          });

          if (taskId) {
            const task = await Task.findByPk(taskId);

            if (task) {
              if (!task.is_paid) {
                await task.update({ is_paid: true });
                console.log("Task marked as paid:", task.id);

                // Add task to processing queue
                try {
                  await addTaskToQueue(task.id);
                  console.log("Task added to processing queue:", task.id);
                } catch (queueError) {
                  console.error("Failed to add task to queue:", queueError.message);
                  // Don't fail the webhook - task is marked as paid
                  // Queue can be retried manually or task can be reprocessed
                }
              } else {
                console.log("Task already paid:", task.id);
              }
            } else {
              console.warn("Task not found for webhook taskId:", taskId);
            }
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      return res.status(200).json({ received: true });
    } catch (err) {
        console.error("Stripe webhook handler failed:", err);
        return res.status(500).json({ message: "Webhook handler failed" });
    }
};
