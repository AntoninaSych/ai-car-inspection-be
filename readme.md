# Car RepAIr Estimator - Backend

AI-powered car damage inspection and repair cost estimation service.

## Features

- 🚗 **Car Image Analysis** - Upload car damage photos for AI-powered inspection
- 🤖 **Google Gemini AI** - Uses Gemini 2.0 Flash for image analysis and damage detection
- 💰 **Repair Cost Estimation** - Get localized repair cost estimates based on region
- 💳 **Stripe Payments** - Integrated payment processing for inspection reports
- 📧 **Email Notifications** - Automatic email when report is ready
- 🌍 **Localization** - Reports generated in user's local language and currency
- 📊 **Queue Processing** - BullMQ for async task processing with Redis

## Tech Stack

- **Runtime:** Node.js with ES Modules
- **Framework:** Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Queue:** BullMQ with Redis
- **AI:** Google Gemini API
- **Payments:** Stripe
- **Email:** Nodemailer

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/)
- Node.js 18+
- npm

## Setup

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Key environment variables:
- `GEMINI_API_KEY` - Google AI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `JWT_SECRET` - Secret for JWT tokens
- `DB_*` - Database credentials
- `SMTP_*` - Email configuration

### 3. Start development

```bash
# Start Docker containers (PostgreSQL + Redis) and run server
npm run dev

# Reset database (run migrations and seeds)
npm run db:reset
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Docker + development server with nodemon |
| `npm start` | Start production server |
| `npm run docker:up` | Start Docker containers in background |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:destroy` | Remove Docker containers and volumes |
| `npm run db:reset` | Reset database (undo migrations, migrate, seed) |
| `npm test` | Run Jest tests |

## Database Commands

```bash
# Run migrations
npx sequelize-cli db:migrate

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Run all seeds
npx sequelize-cli db:seed:all

# Undo all seeds
npx sequelize-cli db:seed:undo:all
```

## API Documentation

Swagger UI available at: **http://localhost:5001/api-docs/**

## Queue Dashboard

Bull Board available at: **http://localhost:5001/admin/queues**

## Stripe Integration

### Setup Stripe CLI for local webhook testing:

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://ai-car.localhost:5001/api/stripe/webhook
```

Copy the `whsec_...` secret to `.env` as `STRIPE_WEBHOOK_SECRET`.

### Test Payment

Use test card: `4242 4242 4242 4242`

After successful payment, Stripe webhook updates `tasks.is_paid = true`.

## Project Structure

```
├── controllers/     # Route handlers
├── models/          # Sequelize models
├── routes/          # API routes with Swagger docs
├── services/        # Business logic
│   ├── emailService.js      # Email notifications
│   ├── geminiService.js     # AI image analysis
│   └── taskQueueService.js  # BullMQ queue
├── middlewares/     # Auth, upload middlewares
├── migrations/      # Database migrations
├── seeders/         # Database seeders
├── prompts/         # AI prompt templates
└── public/          # Static files
```

## Email Testing

For development, use [Ethereal Email](https://ethereal.email):

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
```

Emails are captured but never delivered - view them at https://ethereal.email/messages