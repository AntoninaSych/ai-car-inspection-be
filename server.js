import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from './app.js';
import { connectDB } from './db/sequelize.js';
import { startWorker, stopWorker, startMaintenanceWorker, stopMaintenanceWorker } from './services/taskQueueService.js';
import { verifyEmailConnection } from './services/emailService.js';



const PORT = process.env.PORT || 5001;


const start = async () => {
    try {
        console.log("PORT:", PORT);
        console.log("APP_URL:", process.env.APP_URL);

        console.log("DATABASE_URL:", process.env.DATABASE_URL);
        console.log("DB_USER:", process.env.DB_USER);
        console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
        console.log("DB_HOST:", process.env.DB_HOST);

        await connectDB();

        // Start background task queue worker
        startWorker();
        console.log("📋 Task queue worker started");

        // Start maintenance worker for scheduled cleanup tasks
        await startMaintenanceWorker();

        // Verify email connection (non-blocking)
        verifyEmailConnection();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🚀 Swagger running at ${process.env.APP_URL}/api-docs/`);
        });
    } catch (err) {
        console.error('🚀❌ Failed to start server:', err.message);
        process.exit(1);
    }
};


process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await stopWorker();
    await stopMaintenanceWorker();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await stopWorker();
    await stopMaintenanceWorker();
    process.exit(0);
});

start();
