# Car RepAIr - Backend

AI-powered car damage inspection and repair cost estimation service.

## Features

- 🚗 **Car Image Analysis** - Upload car damage photos for AI-powered inspection
- 🤖 **Google Gemini AI** - Uses Gemini 2.5 Flash for image analysis and damage detection
- 💰 **Repair Cost Estimation** - Get localized repair cost estimates based on region
- 💳 **Stripe Payments** - Integrated payment processing for inspection reports
- 📧 **Email Notifications** - Automatic email when report is ready
- 🌍 **Localization** - Reports generated in user's preferred language and currency
- 📊 **Queue Processing** - BullMQ for async task processing with Redis

## Tech Stack

- **Runtime:** Node.js 18+ with ES Modules
- **Framework:** Express.js
- **Database:** PostgreSQL 14 with Sequelize ORM
- **Queue:** BullMQ with Redis
- **AI:** Google Gemini API
- **Payments:** Stripe
- **Email:** Nodemailer
- **Docs:** Swagger/OpenAPI

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/)
- Node.js 18+

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `HOST` | Application host (default: localhost) |
| `PORT` | Application port (default: 5001) |
| `POSTGRES_HOST` | PostgreSQL host (default: 127.0.0.1) |
| `POSTGRES_PORT` | PostgreSQL port (default: 5433) |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | PostgreSQL database name |
| `REDIS_PASSWORD` | Redis password |
| `JWT_SECRET` | Secret for JWT tokens |
| `GEMINI_API_KEY` | [Google AI API key](https://aistudio.google.com/apikey) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `SMTP_*` | Email configuration |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Bull Board dashboard credentials |

### 3. Start development

```bash
# Start Docker (PostgreSQL + Redis)
npm run docker:up

# Run server (wait till DB is ready)
npm run dev

# Initialize database
npm run db:reset
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Docker + dev server with hot reload |
| `npm start` | Start production server |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:destroy` | Remove containers and volumes |
| `npm run db:reset` | Reset database (migrate + seed) |
| `npm test` | Run tests |

## API Documentation

Swagger UI: **http://localhost:5001/api-docs/**

## Queue Dashboard

Bull Board: **http://localhost:5001/admin/queues**

Protected with `ADMIN_USER` / `ADMIN_PASSWORD` credentials.

## Stripe Webhooks

For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

Copy the `whsec_...` secret to `.env` as `STRIPE_WEBHOOK_SECRET`.

Test card: `4242 4242 4242 4242`

## Project Structure

```
├── controllers/     # Request handlers
├── services/        # Business logic (AI, email, queue)
├── models/          # Sequelize models
├── routes/          # API routes with Swagger docs
├── middlewares/     # Auth, rate limiting, file upload
├── migrations/      # Database migrations
├── seeders/         # Database seeders
├── prompts/         # AI prompt templates
├── helpers/         # Utility functions
├── config/          # App configuration
├── docker/          # Docker-related files
└── public/          # Static files
```

## Email Testing

Use [Ethereal Email](https://ethereal.email) for development:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
SMTP_FROM=your_ethereal_user
```

View captured emails at https://ethereal.email/messages