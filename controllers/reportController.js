import HttpError from "../helpers/HttpError.js";
import ErrorCodes from "../helpers/errorCodes.js";
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

export const getReportById = async (req, res, next) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findByPk(reportId, {
            include: [{
                model: Task,
                attributes: ["id", "owner_id", "year", "mileage", "description"]
            }]
        });

        if (!report) {
            return next(HttpError(404, "Report not found", ErrorCodes.RESOURCE_REPORT_NOT_FOUND));
        }

        // Check if user owns the task associated with this report
        if (report.Task.owner_id !== req.user.id) {
            return next(HttpError(403, "You don't have permission to view this report", ErrorCodes.RESOURCE_ACCESS_DENIED));
        }

        return res.status(200).json({
            ok: true,
            report: {
                id: report.id,
                task_id: report.task_id,
                data: report.data,
                url: report.url,
                created_at: report.created_at
            }
        });

    } catch (err) {
        next(err);
    }
};
