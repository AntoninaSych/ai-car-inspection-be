import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import usersRouter from "./routes/users.routes.js";
import carsRouter from "./routes/cars.routes.js";
import HttpError from "./helpers/HttpError.js";
import imagesRouter from "./routes/images.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import stripeRouter from "./routes/stripe.routes.js";


dotenv.config();
dotenv.config({ path: "./.env" });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.options("*", cors());
app.use(logger("dev"));
app.use(express.json());
app.use("/api/cars", carsRouter);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
    "/avatars",
    express.static(path.join(__dirname, "public/images/avatars"))
);
app.use(express.static("public"));
app.use(express.static("public/images/recipies"));
app.use("/api/images", imagesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/users", usersRouter);

// Stripe demo
app.use("/api/stripe", stripeRouter);

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    info: {
      title: "AI Car API",
      version: "1.0.0",
      description: "API documentation for AI Car application",
    },
    servers: [
      {
        url: BASE_URL,
      },
    ],
    tags: [],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => next(HttpError(404, "Not found")));
app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});


export default app;
