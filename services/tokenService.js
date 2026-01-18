import crypto from "crypto";
import { Op } from "sequelize";
import UserToken, { TOKEN_TYPES } from "../models/UserToken.js";

/**
 * Generate a secure random token
 * @returns {string} 64-character hex token
 */
const generateToken = () => crypto.randomBytes(32).toString("hex");

/**
 * Create a new user token
 * @param {Object} options
 * @param {string} options.userId - User ID
 * @param {string} options.type - Token type (from TOKEN_TYPES)
 * @param {Object} options.data - Additional data (e.g., { reportId })
 * @param {number} options.expiresInMs - Expiration time in milliseconds
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export const createToken = async ({ userId, type, data = null, expiresInMs }) => {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + expiresInMs);

    await UserToken.create({
        user_id: userId,
        token,
        type,
        data,
        expires_at: expiresAt,
    });

    return { token, expiresAt };
};

/**
 * Validate a token and return its data
 * @param {string} token - The token to validate
 * @param {string} type - Expected token type
 * @param {boolean} markAsUsed - Whether to mark the token as used
 * @returns {Promise<{valid: boolean, reason?: string, userId?: string, data?: Object}>}
 */
export const validateToken = async (token, type, markAsUsed = false) => {
    if (!token) {
        return { valid: false, reason: "missing" };
    }

    const userToken = await UserToken.findOne({
        where: { token, type },
    });

    if (!userToken) {
        return { valid: false, reason: "invalid" };
    }

    if (userToken.used_at) {
        return { valid: false, reason: "used" };
    }

    if (new Date() > userToken.expires_at) {
        return { valid: false, reason: "expired" };
    }

    if (markAsUsed) {
        await userToken.update({ used_at: new Date() });
    }

    return {
        valid: true,
        userId: userToken.user_id,
        data: userToken.data,
    };
};

/**
 * Invalidate all tokens of a specific type for a user
 * @param {string} userId - User ID
 * @param {string} type - Token type
 */
export const invalidateUserTokens = async (userId, type) => {
    await UserToken.update(
        { used_at: new Date() },
        { where: { user_id: userId, type, used_at: null } }
    );
};

/**
 * Clean up expired tokens (can be run periodically)
 */
export const cleanupExpiredTokens = async () => {
    const deleted = await UserToken.destroy({
        where: {
            expires_at: { [Op.lt]: new Date() },
        },
    });
    return deleted;
};

/**
 * Create a direct access token for viewing a report
 * @param {string} userId - User ID
 * @param {string} reportId - Report ID
 * @param {number} expiresInDays - Expiration in days (default: 7)
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export const createDirectAccessToken = async (userId, reportId, expiresInDays = 7) => {
    return createToken({
        userId,
        type: TOKEN_TYPES.DIRECT_ACCESS,
        data: { reportId },
        expiresInMs: expiresInDays * 24 * 60 * 60 * 1000,
    });
};

/**
 * Create a password reset token
 * @param {string} userId - User ID
 * @param {number} expiresInMinutes - Expiration in minutes (default: 30)
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export const createPasswordResetToken = async (userId, expiresInMinutes = 30) => {
    // Invalidate any existing password reset tokens
    await invalidateUserTokens(userId, TOKEN_TYPES.PASSWORD_RESET);

    return createToken({
        userId,
        type: TOKEN_TYPES.PASSWORD_RESET,
        expiresInMs: expiresInMinutes * 60 * 1000,
    });
};

/**
 * Create an email verification token
 * @param {string} userId - User ID
 * @param {number} expiresInDays - Expiration in days (default: 7)
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export const createEmailVerifyToken = async (userId, expiresInDays = 7) => {
    // Invalidate any existing email verify tokens
    await invalidateUserTokens(userId, TOKEN_TYPES.EMAIL_VERIFY);

    return createToken({
        userId,
        type: TOKEN_TYPES.EMAIL_VERIFY,
        expiresInMs: expiresInDays * 24 * 60 * 60 * 1000,
    });
};

export { TOKEN_TYPES };
