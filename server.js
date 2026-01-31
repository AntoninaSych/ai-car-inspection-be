import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from './app.js';
import { connectDB } from './db/sequelize.js';
import { startWorker, stopWorker, startMaintenanceWorker, stopMaintenanceWorker } from './services/taskQueueService.js';
import { verifyEmailConnection } from './services/emailService.js';
import { getBaseUrl } from './helpers/getBaseUrl.js';

const PORT = process.env.PORT || 5001;
const BASE_URL = getBaseUrl();

const start = async () => {
    try {
        await connectDB();

        // Start background task queue worker
        startWorker();
        console.log("📋 Task queue worker started");

        // Start maintenance worker for scheduled cleanup tasks
        await startMaintenanceWorker();

        // Verify email connection (non-blocking)
        verifyEmailConnection();

        app.listen(PORT, () => {
            console.log(`🚀 Server running at ${BASE_URL}`);
            console.log(`🚀 Swagger running at ${BASE_URL}/api-docs/`);
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
