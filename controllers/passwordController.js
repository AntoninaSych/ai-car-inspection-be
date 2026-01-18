import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import {
    createPasswordResetToken,
    validateToken,
    TOKEN_TYPES,
} from "../services/tokenService.js";

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json({
                message: "If user exists, reset email was sent",
            });
        }

        const { token } = await createPasswordResetToken(user.id);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetLink);

        res.json({ message: "Reset link sent" });
    } catch (err) {
        next(err);
    }
};

export const validateResetPasswordToken = async (req, res, next) => {
    try {
        const token = (req.query?.token || "").toString().trim();

        const result = await validateToken(token, TOKEN_TYPES.PASSWORD_RESET, false);

        if (!result.valid) {
            return res.status(200).json({ valid: false, reason: result.reason });
        }

        return res.status(200).json({ valid: true });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Validate and mark token as used
        const result = await validateToken(token, TOKEN_TYPES.PASSWORD_RESET, true);

        if (!result.valid) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = await User.findByPk(result.userId);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({ password: hashedPassword });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};
