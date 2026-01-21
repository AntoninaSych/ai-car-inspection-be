import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import ErrorCodes from '../helpers/errorCodes.js';

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';

        if (!authHeader) {
            return res.status(401).json({ message: 'Not authorized: missing header', internalCode: ErrorCodes.AUTH_NOT_AUTHORIZED });
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Not authorized: invalid format', internalCode: ErrorCodes.AUTH_INVALID_TOKEN });
        }

        let payload;

        try {
            payload = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized: invalid token', internalCode: ErrorCodes.AUTH_INVALID_TOKEN });
        }

        const user = await User.findByPk(payload.id);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized: no user', internalCode: ErrorCodes.AUTH_NOT_AUTHORIZED });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Not authorized: outdated token', internalCode: ErrorCodes.AUTH_OUTDATED_TOKEN });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);
        return res.status(401).json({ message: 'Not authorized', internalCode: ErrorCodes.AUTH_NOT_AUTHORIZED });
    }
};

export default auth;
