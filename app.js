import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/dist/queueAdapters/bullMQ.js";
import { ExpressAdapter } from "@bull-board/express";

import usersRouter from "./routes/users.routes.js";
import carsRouter from "./routes/cars.routes.js";
import imagesRouter from "./routes/images.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import stripeRouter from "./routes/stripe.routes.js";
import { taskQueue } from "./services/taskQueueService.js";

import { stripeWebhookHandler } from "./controllers/stripeWebhookController.js";
import HttpError from "./helpers/HttpError.js";

dotenv.config();
dotenv.config({ path: "./.env" });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.options("*", cors());
app.use(logger("dev"));

app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
);

app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/avatars", express.static(path.join(__dirname, "public/images/avatars")));
app.use(express.static("public"));
app.use(express.static("public/images/recipies"));
app.use("/api/cars", carsRouter);
app.use("/api/images", imagesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/users", usersRouter);
app.use("/api/stripe", stripeRouter);
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Car API",
      version: "1.0.0",
      description: "API documentation for AI Car application",
    },
    servers: [{ url: BASE_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "routes", "*.js")],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Bull Board - Queue Dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
  queues: [new BullMQAdapter(taskQueue)],
  serverAdapter,
});
app.use("/admin/queues", serverAdapter.getRouter());

app.use((req, res, next) => next(HttpError(404, "Not found")));

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
