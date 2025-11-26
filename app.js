import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import areasRouter from "./routes/areas.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import ingredientsRouter from "./routes/ingredients.routes.js";
import usersRouter from "./routes/users.routes.js";
import recipesRouter from "./routes/recipes.routes.js";
import testimonialsRouter from "./routes/testimonials.routes.js";
import HttpError from "./helpers/HttpError.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  "/avatars",
  express.static(path.join(__dirname, "public/images/avatars"))
);
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("public/images/recipies"));
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

app.use("/api/areas", areasRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/ingredients", ingredientsRouter);
app.use("/api/users", usersRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/testimonials", testimonialsRouter);

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
      title: "Foodies API",
      version: "1.0.0",
      description: "API documentation for Foodies application",
    },
    servers: [
      {
        url: BASE_URL,
      },
    ],
    tags: [
      {
        name: "Areas",
        description: "Manage areas",
      },
      {
        name: "Categories",
        description: "Manage categories",
      },
      {
        name: "Ingredients",
        description: "Manage ingredients",
      },
      {
        name: "Users",
        description: "Manage users",
      },
      {
        name: "Recipes",
        description: "Manage recipes",
      },
      {
        name: "Testimonials",
        description: "Manage testimonials",
      },
    ],
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
