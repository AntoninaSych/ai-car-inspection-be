import HttpError from "../helpers/HttpError.js";
import { Task, Image, CarBrand, CarModel, TaskStatus } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a task
 */
export const createTask = async (req, res, next) => {
    try {
        const { brand_id, model_id, description, image_ids } = req.body;

        if (!image_ids || !Array.isArray(image_ids) || image_ids.length === 0) {
            return next(HttpError(400, "image_ids must be a non-empty array"));
        }

        const brand = await CarBrand.findByPk(brand_id);
        const model = await CarModel.findByPk(model_id);

        if (!brand) return next(HttpError(404, "Brand not found"));
        if (!model) return next(HttpError(404, "Model not found"));

        const defaultStatus = await TaskStatus.findOne({
            where: { name: "image_uploaded" },
        });

        if (!defaultStatus) {
            return next(HttpError(500, "Default task status not found"));
        }


        const task = await Task.create({
            id: uuidv4(),
            brand_id,
            model_id,
            description: description || null,
            owner_id: req.user.id,
            current_status_id: defaultStatus.id,
            is_paid: false,
        });


        await Image.update(
            { task_id: task.id },
            { where: { id: image_ids } }
        );

        return res.status(201).json({
            ok: true,
            task_id: task.id,
            message: "Task created successfully",
        });

    } catch (err) {
        next(err);
    }
};
