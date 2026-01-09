import { Task, Image, CarBrand, CarModel, TaskStatus, ImageType, Report } from "../models/index.js";
import { addTaskToQueue } from "../services/taskQueueService.js";
import HttpError from "../helpers/HttpError.js";
import { v4 as uuidv4 } from "uuid";

const formatTask = (task) => ({
    id: task.id,
    brand: task.CarBrand?.name,
    model: task.CarModel?.name,
    year: task.year,
    mileage: task.mileage,
    description: task.description,
    country_code: task.country_code,
    status: task.TaskStatus?.name,
    is_paid: task.is_paid,
    images: task.Images?.map(img => ({
        id: img.id,
        type: img.ImageType?.name,
        path: img.local_path,
        verified: img.verified
    })),
    reports: task.Reports?.map(r => ({
        id: r.id,
        data: r.data,
        url: r.url,
        created_at: r.created_at
    })),
    created_at: task.created_at,
    updated_at: task.updated_at
});

export const createTask = async (req, res, next) => {
    try {
        const { brand_id, model_id, description, year, mileage, country_code } = req.body;

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
            country_code: country_code || null,
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

export const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findByPk(taskId, {
            include: [
                { model: Image },
                { model: Report },
            ],
        });

        if (!task) {
            return next(HttpError(404, "Task not found"));
        }

        if (task.owner_id !== req.user.id) {
            return next(HttpError(403, "You don't have permission to delete this task"));
        }

        const filePaths = (task.Images || [])
            .map((img) => img.local_path)
            .filter(Boolean);

        const transaction = await Task.sequelize.transaction();
        try {
            await Report.destroy({ where: { task_id: task.id }, transaction });
            await Image.destroy({ where: { task_id: task.id }, transaction });
            await Task.destroy({ where: { id: task.id }, transaction });
            await transaction.commit();
        } catch (dbErr) {
            await transaction.rollback();
            throw dbErr;
        }

        for (const p of filePaths) {
            try {
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                }
            } catch (fileErr) {
                console.warn("Failed to delete file:", p, fileErr.message);
            }
        }

        return res.status(200).json({
            ok: true,
            message: "Task deleted successfully",
            task_id: taskId,
        });
    } catch (err) {
        next(err);
    }
};
export const getTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findByPk(taskId, {
            include: [
                {
                    model: Image,
                    include: [ImageType]
                },
                { model: CarBrand },
                { model: CarModel },
                { model: TaskStatus },
                { model: Report }
            ]
        });

        if (!task) {
            return next(HttpError(404, "Task not found"));
        }

        // Check if user owns this task
        if (task.owner_id !== req.user.id) {
            return next(HttpError(403, "You don't have permission to view this task"));
        }

        return res.status(200).json({
            ok: true,
            task: formatTask(task)
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
                {
                    model: Image,
                    include: [ImageType]
                },
                { model: CarBrand },
                { model: CarModel },
                { model: TaskStatus },
                { model: Report }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).json({
            ok: true,
            tasks: tasks.map(formatTask)
        });

    } catch (err) {
        next(err);
    }
};

export const payTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findByPk(taskId);

        if (!task) {
            return next(HttpError(404, "Task not found"));
        }

        if (task.owner_id !== req.user.id) {
            return next(HttpError(403, "You don't have permission to pay for this task"));
        }

        await task.update({ is_paid: true });

        // Add task to processing queue
        try {
            await addTaskToQueue(task.id);
            console.log("Task added to processing queue:", task.id);
        } catch (queueError) {
            console.error("Failed to add task to queue:", queueError.message);
            // Queue can be retried manually or task can be reprocessed
        }

        return res.status(200).json({
            ok: true,
            message: "Success",
            task_id: task.id
        });

    } catch (err) {
        next(err);
    }
};
