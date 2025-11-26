import { Area } from '../models/index.js';

export const getAllAreas = async (req, res, next) => {
    try {
        const areas = await Area.findAll();
        res.json(areas);
    } catch (error) {
        next(error);
    }
};
