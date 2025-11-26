import { Testimonial, User } from '../models/index.js';
import HttpError from '../helpers/HttpError.js';

export const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.findAll({
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'avatarURL'],
            },
        });
        res.json(testimonials);
    } catch (err) {
        next(HttpError(500, error.message));    }
};
