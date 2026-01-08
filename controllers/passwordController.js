import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json({
                message: "If user exists, reset email was sent",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        await user.update({
            resetPasswordToken: token,
            resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetLink);

        res.json({ message: "Reset link sent" });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
            },
        });

        if (
            !user ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};
