import { Task, Image, CarBrand, CarModel, TaskStatus, ImageType, Report } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { v4 as uuidv4 } from "uuid";

export const createTask = async (req, res, next) => {
    try {
        const { brand_id, model_id, description, year, mileage } = req.body;

        const brand = await CarBrand.findByPk(brand_id);
        const model = await CarModel.findByPk(model_id);

        if (!brand) return next(HttpError(404, "Brand not found"));
        if (!model) return next(HttpError(404, "Model not found"));

        const parsedYear = year ? parseInt(year, 10) : null;

        if (parsedYear) {
            if (model.year_from && parsedYear < model.year_from) {
                return next(HttpError(400, `Year must be >= ${model.year_from}`));
            }
            if (model.year_to && parsedYear > model.year_to) {
                return next(HttpError(400, `Year must be <= ${model.year_to}`));
            }
        }

        const uploadedImages = {
            front: req.files?.front?.[0],
            back: req.files?.back?.[0],
            left: req.files?.left?.[0],
            right: req.files?.right?.[0],
            issue: req.files?.issue?.[0],
        };

        const uploadedKeys = Object.keys(uploadedImages).filter(
            key => uploadedImages[key]
        );

        if (uploadedKeys.length === 0) {
            return next(HttpError(400, "At least one image is required"));
        }

        const defaultStatus = await TaskStatus.findOne({
            where: { name: "image_uploaded" }
        });

        if (!defaultStatus) {
            return next(HttpError(500, "Default task status not found"));
        }

        const task = await Task.create({
            id: uuidv4(),
            brand_id,
            model_id,
            description: description || null,
            year: parsedYear,
            mileage: mileage ? Number(mileage) : null,
            owner_id: req.user.id,
            current_status_id: defaultStatus.id,
            is_paid: false,
        });

        const imageTypes = await ImageType.findAll();
        const typeMap = {};
        imageTypes.forEach(t => { typeMap[t.name] = t.id });

        for (const field of uploadedKeys) {
            const img = uploadedImages[field];

            await Image.create({
                id: uuidv4(),
                task_id: task.id,
                local_path: img.path,
                verified: false,
                image_type_id: typeMap[field],
            });
        }

        return res.status(201).json({
            ok: true,
            task_id: task.id,
            message: "Task created successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const getCurrentUserTasks = async (req, res, next) => {
    try {
        const tasks = await Task.findAll({
            where: { owner_id: req.user.id },
            include: [
                { model: CarBrand },
                { model: CarModel },
                { model: TaskStatus }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).json({
            ok: true,
            tasks: tasks.map(task => ({
                id: task.id,
                brand: task.CarBrand?.name,
                model: task.CarModel?.name,
                year: task.year,
                mileage: task.mileage,
                description: task.description,
                status: task.TaskStatus?.name,
                is_paid: task.is_paid,
                created_at: task.created_at,
                updated_at: task.updated_at
            }))
        });

    } catch (err) {
        next(err);
    }
};
