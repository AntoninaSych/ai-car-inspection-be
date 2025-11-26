import { Ingredient } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllIngredients = async (req, res, next) => {
    try {
        const ingredients = await Ingredient.findAll();

        res.json(ingredients);
    } catch (error) {
        next(HttpError(500, error.message));
    }
};
