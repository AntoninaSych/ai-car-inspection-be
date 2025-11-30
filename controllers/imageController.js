import HttpError from "../helpers/HttpError.js";
import { Image, ImageType, Task } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export const uploadImageWithType = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(HttpError(400, "Image file is required"));
        }

        const { type, task_id } = req.body;

        if (!type) {
            return next(HttpError(400, "Image type is required"));
        }

        // Validate type
        const allowed = await ImageType.findOne({ where: { name: type } });
        if (!allowed) {
            return next(HttpError(400, `Invalid image type: ${type}`));
        }

        // Validate task_id (optional)
        let task = null;

        if (task_id) {
            task = await Task.findByPk(task_id);

            if (!task) {
                return next(HttpError(404, `Task with id ${task_id} not found`));
            }

            if (task.owner_id !== req.user.id) {
                return next(HttpError(403, "You are not the owner of this task"));
            }
        }

        // -------------------------------
        // Build correct storage path
        // -------------------------------

        const imageId = uuidv4();
        const ext = path.extname(req.file.originalname) || ".jpg";

        const baseDir = task
            ? `images/tasks/${task.id}`
            : `images/unassigned`;

        const fullDir = path.join(process.cwd(), baseDir);

        await fs.mkdir(fullDir, { recursive: true });

        const finalPath = path.join(fullDir, `${imageId}${ext}`);
        const relativePath = `${baseDir}/${imageId}${ext}`;

        // Move uploaded file
        await fs.rename(req.file.path, finalPath);

        // -------------------------------
        // Save image into the database
        // -------------------------------
        const image = await Image.create({
            id: imageId,
            local_path: relativePath,
            verified: true,
            image_type_id: allowed.id,
            task_id: task ? task.id : null,
        });

        res.status(201).json({
            ok: true,
            image: {
                id: image.id,
                path: image.local_path,
                type,
                task_id: task ? task.id : null,
                verified: true,
            }
        });

    } catch (err) {
        next(err);
    }
};
