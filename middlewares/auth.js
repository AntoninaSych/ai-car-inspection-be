import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { id } = jwt.verify(token, SECRET_KEY);
        const user = await User.findByPk(id);

        if (!user || user.token !== token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized' });
    }
};

export default auth;
