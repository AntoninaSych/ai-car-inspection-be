import { Task, Image, CarBrand, CarModel, TaskStatus, ImageType, Report } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { v4 as uuidv4 } from "uuid";
import { analyzeCarImages } from "../services/geminiService.js";

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

export const processTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        // Find task with all related data
        const task = await Task.findByPk(taskId, {
            include: [
                {
                    model: Image,
                    include: [ImageType]
                },
                { model: CarBrand },
                { model: CarModel },
                { model: Report }
            ]
        });

        if (!task) {
            return next(HttpError(404, "Task not found"));
        }

        // Check if user owns this task
        if (task.owner_id !== req.user.id) {
            return next(HttpError(403, "You don't have permission to process this task"));
        }

        // Check if task is paid
        if (!task.is_paid) {
            return next(HttpError(402, "Payment required. Task must be paid before processing."));
        }

        // Check if task already has a report
        const existingReport = task.Reports?.[0];
        if (existingReport) {
            return res.status(200).json({
                ok: true,
                message: "Task already processed",
                task_id: task.id,
                report_id: existingReport.id
            });
        }

        // Prepare images object
        const images = {};
        task.Images.forEach(img => {
            const typeName = img.ImageType?.name;
            if (typeName) {
                images[typeName] = img.local_path;
            }
        });

        if (Object.keys(images).length === 0) {
            return next(HttpError(400, "No images found for this task"));
        }

        // Prepare car info
        const carInfo = {
            brand: task.CarBrand?.name || 'Unknown',
            model: task.CarModel?.name || 'Unknown',
            year: task.year,
            mileage: task.mileage,
            description: task.description
        };

        // Call Gemini API
        const analysisResult = await analyzeCarImages(images, carInfo);

        // Create report with analysis
        const report = await Report.create({
            id: uuidv4(),
            task_id: task.id,
            data: analysisResult,
        });

        // Update task status
        const processedStatus = await TaskStatus.findOne({ where: { name: "processed" } });
        if (processedStatus) {
            await task.update({ current_status_id: processedStatus.id });
        }

        return res.status(200).json({
            ok: true,
            message: "Task processed successfully",
            task_id: task.id,
            report_id: report.id
        });

    } catch (err) {
        console.error("Process task error:", err);
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

        // Get first report (AI analysis)
        const aiReport = task.Reports?.[0];

        return res.status(200).json({
            ok: true,
            task: {
                id: task.id,
                brand: task.CarBrand?.name,
                model: task.CarModel?.name,
                year: task.year,
                mileage: task.mileage,
                description: task.description,
                status: task.TaskStatus?.name,
                is_paid: task.is_paid,
                images: task.Images.map(img => ({
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
                ai_analysis: aiReport?.data || null,
                created_at: task.created_at,
                updated_at: task.updated_at
            }
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

        if (task.is_paid) {
            return res.status(200).json({
                ok: true,
                message: "Task is already paid",
                task_id: task.id
            });
        }

        await task.update({ is_paid: true });

        // Automatically process the task after successful payment
        return processTask(req, res, next);

    } catch (err) {
        next(err);
    }
};
