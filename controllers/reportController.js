import { Report, Task } from "../models/index.js";

export const getCurrentUserReports = async (req, res, next) => {
    try {
        const reports = await Report.findAll({
            include: [{
                model: Task,
                where: { owner_id: req.user.id },
                attributes: ["id", "year", "mileage", "description"]
            }],
            order: [["created_at", "DESC"]]
        });

        return res.status(200).json({
            ok: true,
            reports: reports.map(report => ({
                id: report.id,
                task_id: report.task_id,
                data: report.data,
                url: report.url,
                created_at: report.created_at
            }))
        });

    } catch (err) {
        next(err);
    }
};

