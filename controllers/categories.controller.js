import { Category } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        const baseUrl = `${req.protocol}://${req.get('host')}/public`;

        const mapped = categories.map(category => ({
            id: category.id,
            name: category.name,
            thumb: category.thumb ? `${baseUrl}/${category.thumb}` : null,
        }));
        res.json(mapped);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
