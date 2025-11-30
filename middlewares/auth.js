import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';

const auth = async (req, res, next) => {
    try {
        // Debug вывод — можно убрать позже
        console.log("AUTH HEADERS:", req.headers);

        const authHeader = req.headers.authorization || '';

        if (!authHeader) {
            return res.status(401).json({ message: 'Not authorized: missing header' });
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Not authorized: invalid format' });
        }

        let payload;

        try {
            payload = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized: invalid token' });
        }

        const user = await User.findByPk(payload.id);

        if (!user) {
            return res.status(401).json({ message: 'Not authorized: no user' });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Not authorized: outdated token' });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);
        return res.status(401).json({ message: 'Not authorized' });
    }
};

export default auth;
