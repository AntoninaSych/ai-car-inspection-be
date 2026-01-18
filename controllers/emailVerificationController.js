import { User } from "../models/index.js";
import { createEmailVerifyToken, validateToken, TOKEN_TYPES } from "../services/tokenService.js";
import { sendVerificationEmail } from "../services/emailService.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Verify email with token
 * GET /api/auth/verify-email?token=xxx
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const result = await validateToken(token, TOKEN_TYPES.EMAIL_VERIFY, true);

        if (!result.valid) {
            const messages = {
                missing: "Token is required",
                invalid: "Invalid verification token",
                used: "This verification link has already been used",
                expired: "Verification link has expired",
            };
            return res.status(400).json({
                message: messages[result.reason] || "Invalid token",
            });
        }

        const user = await User.findByPk(result.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                message: "Email is already verified",
                verified: true,
            });
        }

        await user.update({ emailVerified: true });

        res.json({
            message: "Email verified successfully",
            verified: true,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email } });

        // Don't reveal if user exists
        if (!user) {
            return res.status(200).json({
                message: "If the email exists and is not verified, a verification link will be sent",
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                message: "Email is already verified",
            });
        }

        const { token } = await createEmailVerifyToken(user.id);
        const verifyLink = `${FRONTEND_URL}/verify-email?token=${token}`;

        await sendVerificationEmail(user.email, user.name, verifyLink);

        res.json({
            message: "If the email exists and is not verified, a verification link will be sent",
        });
    } catch (err) {
        next(err);
    }
};

