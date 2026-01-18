import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { validateToken, TOKEN_TYPES } from "../services/tokenService.js";

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

/**
 * Validate direct access token and return session + report info
 * GET /api/auth/direct-access?token=xxx
 */
export const directAccessLogin = async (req, res, next) => {
    try {
        const token = (req.query?.token || "").toString().trim();

        const result = await validateToken(token, TOKEN_TYPES.DIRECT_ACCESS, false);

        if (!result.valid) {
            return res.status(200).json({
                valid: false,
                reason: result.reason,
            });
        }

        const user = await User.findByPk(result.userId);

        if (!user) {
            return res.status(200).json({
                valid: false,
                reason: "user_not_found",
            });
        }

        // Generate a session token for the user
        const sessionToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });
        await user.update({ token: sessionToken });

        return res.status(200).json({
            valid: true,
            token: sessionToken,
            reportId: result.data?.reportId,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarURL: user.avatarURL,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Validate direct access token without logging in
 * GET /api/auth/direct-access/validate?token=xxx
 */
export const validateDirectAccessToken = async (req, res, next) => {
    try {
        const token = (req.query?.token || "").toString().trim();

        const result = await validateToken(token, TOKEN_TYPES.DIRECT_ACCESS, false);

        if (!result.valid) {
            return res.status(200).json({
                valid: false,
                reason: result.reason,
            });
        }

        return res.status(200).json({
            valid: true,
            reportId: result.data?.reportId,
        });
    } catch (err) {
        next(err);
    }
};

