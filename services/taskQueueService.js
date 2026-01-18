import { Queue, Worker } from "bullmq";
import { Task, Image, ImageType, CarBrand, CarModel, Report, TaskStatus, User } from "../models/index.js";
import { analyzeCarImages } from "./geminiService.js";
import { sendReportReadyEmail } from "./emailService.js";
import { createDirectAccessToken } from "./tokenService.js";
import { v4 as uuidv4 } from "uuid";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};

// Create the task processing queue
export const taskQueue = new Queue("task-processing", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 60000, // Start with 1 minute delay, then 2 min, 4 min
        },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

// Add a task to the queue
export const addTaskToQueue = async (taskId) => {
    const job = await taskQueue.add(
        "process-task",
        { taskId },
        {
            priority: 1,
        }
    );
    console.log(`Task ${taskId} added to queue with job ID: ${job.id}`);
    return job;
};

/**
 * Process a task: analyze images with AI and create report
 * @param {string} taskId - Task UUID
 * @returns {Promise<{success: boolean, reportId?: string, skipped?: boolean, reason?: string}>}
 */
export const processTask = async (taskId) => {
    console.log(`[Queue] Processing task: ${taskId}`);

    const task = await Task.findByPk(taskId, {
        include: [
            { model: Image, include: [ImageType] },
            { model: CarBrand },
            { model: CarModel },
            { model: Report },
            { model: User, as: "owner" },
        ],
    });

    if (!task) {
        throw new Error(`Task not found: ${taskId}`);
    }

    if (!task.is_paid) {
        throw new Error(`Task not paid: ${taskId}`);
    }

    // Check if already processed (has report)
    if (task.Report) {
        console.log(`[Queue] Task ${taskId} already has a report, skipping`);
        return { skipped: true, reason: "already_processed" };
    }

    // Get images
    const images = task.Images.map((img) => ({
        path: img.local_path,
        type: img.ImageType?.name || "unknown",
    }));

    if (images.length === 0) {
        throw new Error(`No images found for task: ${taskId}`);
    }

    // Build car info with user preferences for currency and language
    const carInfo = {
        brand: task.CarBrand?.name || "Unknown",
        model: task.CarModel?.name || "Unknown",
        year: task.year,
        mileage: task.mileage,
        description: task.description,
        country_code: task.country_code,
        // User preferences for currency and language (override defaults)
        user_currency: task.owner?.currency || null,
        user_language: task.owner?.language || null,
    };

    console.log(`[Queue] Analyzing ${images.length} images for ${carInfo.brand} ${carInfo.model}`);

    // Update status to "processing"
    const processingStatus = await TaskStatus.findOne({ where: { name: "processing" } });
    if (processingStatus) {
        await task.update({ current_status_id: processingStatus.id });
    }

    // Call Gemini API with error handling
    let analysisResult;
    try {
        analysisResult = await analyzeCarImages(images, carInfo);
    } catch (geminiError) {
        console.error(`📋❌ Gemini API error for task ${taskId}:`, geminiError.message);
        // Re-throw to trigger BullMQ retry mechanism
        throw new Error(`Gemini analysis failed: ${geminiError.message}`);
    }

    // Validate analysis result
    if (!analysisResult || !analysisResult.success) {
        const errorMsg = analysisResult?.analysis?.error || "Invalid analysis result";
        console.error(`📋❌ Invalid Gemini response for task ${taskId}:`, errorMsg);
        throw new Error(`Invalid analysis result: ${errorMsg}`);
    }

    // Create report only if analysis was successful
    let report;
    try {
        report = await Report.create({
            id: uuidv4(),
            task_id: task.id,
            data: analysisResult,
        });
    } catch (dbError) {
        console.error(`📋❌ Failed to create report for task ${taskId}:`, dbError.message);
        throw new Error(`Failed to create report: ${dbError.message}`);
    }

    // Update task status to "completed" only after successful report creation
    const completedStatus = await TaskStatus.findOne({ where: { name: "completed" } });
    if (completedStatus) {
        await task.update({ current_status_id: completedStatus.id });
    }

    console.log(`📋 Task ${taskId} processed successfully, report: ${report.id}`);

    // Send email notification to task owner with direct access link
    if (task.owner?.email) {
        try {
            // Create direct access token and build URL
            let reportUrl = `${FRONTEND_URL}/reports/${report.id}`;
            try {
                const { token } = await createDirectAccessToken(task.owner.id, report.id);
                reportUrl = `${FRONTEND_URL}/direct-access?token=${token}`;
            } catch (tokenError) {
                console.error(`📋⚠️ Failed to create direct access token:`, tokenError.message);
                // Fall back to regular URL without auto-login
            }

            await sendReportReadyEmail(task.owner.email, task.owner.name, reportUrl);
            console.log(`📋 Email sent to ${task.owner.email}`);
        } catch (emailError) {
            console.error(`📋❌ Failed to send email:`, emailError.message);
            // Don't throw - email failure shouldn't fail the job
        }
    }

    return { success: true, reportId: report.id };
};

// Create the worker
let worker = null;

export const startWorker = () => {
    if (worker) {
        console.log("📋 Worker already running");
        return worker;
    }

    worker = new Worker(
        "task-processing",
        async (job) => {
            const { taskId } = job.data;
            return await processTask(taskId);
        },
        {
            connection,
            concurrency: 1, // Process one task at a time to avoid rate limits
            limiter: {
                max: 1,
                duration: 5000, // Max 1 job per 5 seconds
            },
        }
    );

    worker.on("completed", (job, result) => {
        console.log(`📋 Job ${job.id} completed:`, result);
    });

    worker.on("failed", async (job, err) => {
        console.error(`📋❌ Job ${job?.id} failed:`, err.message);

        // Update task status to "failed" if this was the final attempt
        if (job?.attemptsMade >= job?.opts?.attempts) {
            const { taskId } = job.data;
            try {
                const failedStatus = await TaskStatus.findOne({ where: { name: "failed" } });
                if (failedStatus) {
                    await Task.update(
                        { current_status_id: failedStatus.id },
                        { where: { id: taskId } }
                    );
                    console.log(`📋 Task ${taskId} marked as failed`);
                }
            } catch (updateErr) {
                console.error(`📋❌ Failed to update task status:`, updateErr.message);
            }
        }
    });

    worker.on("error", (err) => {
        console.error("📋❌ Worker error:", err);
    });

    return worker;
};

export const stopWorker = async () => {
    if (worker) {
        await worker.close();
        worker = null;
        console.log("📋 Worker stopped");
    }
};
