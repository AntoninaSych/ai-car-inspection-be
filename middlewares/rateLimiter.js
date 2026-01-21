import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import ErrorCodes from "../helpers/errorCodes.js";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

let redisClient = null;

const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = createClient({
            socket: {
                host: REDIS_HOST,
                port: REDIS_PORT,
            },
        });

        redisClient.on("error", (err) => {
            console.error("Redis rate limiter error:", err.message);
        });

        await redisClient.connect();
    }
    return redisClient;
};

/**
 * Create a rate limiter with Redis store
 * @param {Object} options - Rate limiter options
 * @param {string} options.prefix - Redis key prefix (passed to RedisStore)
 * @returns {Function} Express middleware
 */
const createRateLimiter = ({ prefix, ...options }) => {
    return rateLimit({
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: async (...args) => {
                const client = await getRedisClient();
                return client.sendCommand(args);
            },
            prefix: prefix || "rl:",
        }),
        validate: { xForwardedForHeader: false },
        ...options,
    });
};

/**
 * Rate limiter for forgot-password endpoint
 * Limits to 3 requests per day per IP/email
 */
export const forgotPasswordLimiter = createRateLimiter({
    prefix: "rl:forgot-password:",
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3,
    message: { message: "Too many password reset requests. Please try again tomorrow.", internalCode: ErrorCodes.RATE_LIMIT_PASSWORD_RESET },
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase()?.trim();
        return email || "unknown";
    },
});

/**
 * Rate limiter for task retry endpoint
 * Limits to 3 requests per task per day
 */
export const retryTaskLimiter = createRateLimiter({
    prefix: "rl:retry-task:",
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3,
    message: { message: "Too many retry requests for this task. Please try again tomorrow.", internalCode: ErrorCodes.RATE_LIMIT_TASK_RETRY },
    keyGenerator: (req) => {
        // Use task ID from URL params
        return req.params?.taskId || "unknown";
    },
});

/**
 * Rate limiter for resend verification email endpoint
 * Limits to 3 requests per email per day
 */
export const resendVerificationLimiter = createRateLimiter({
    prefix: "rl:resend-verification:",
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3,
    message: { message: "Too many verification requests. Please try again tomorrow.", internalCode: ErrorCodes.RATE_LIMIT_EMAIL_VERIFICATION },
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase()?.trim();
        return email || "unknown";
    },
});
