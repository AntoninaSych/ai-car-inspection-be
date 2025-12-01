import sequelize from "../db/sequelize.js";

import User from "./User.js";
import CarBrand from "./CarBrand.js";
import CarModel from "./CarModel.js";

import TaskStatus from "./TaskStatus.js";
import TaskStatusHistory from "./TaskStatusHistory.js";
import Image from "./Image.js";
import ImageType from "./ImageType.js";

import Task from "./Task.js";
import Report from "./Report.js";



// Associations -----------------------------------

// Cars
CarBrand.hasMany(CarModel, { foreignKey: "brand_id" });
CarModel.belongsTo(CarBrand, { foreignKey: "brand_id" });


// Tasks
User.hasMany(Task, { foreignKey: "owner_id" });
Task.belongsTo(User, { foreignKey: "owner_id" });

Task.belongsTo(TaskStatus, { foreignKey: "current_status_id" });

// Images
Image.belongsTo(ImageType, { foreignKey: "image_type_id" });
ImageType.hasMany(Image, { foreignKey: "image_type_id" });

Image.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(Image, { foreignKey: "task_id" });

// Status history
TaskStatusHistory.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(TaskStatusHistory, { foreignKey: "task_id" });

TaskStatusHistory.belongsTo(TaskStatus, { foreignKey: "status_id" });

// Reports
Report.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(Report, { foreignKey: "task_id" });


export {
    sequelize,
    User,
    CarBrand,
    CarModel,
    Image,
    ImageType,
    Task,
    TaskStatus,
    TaskStatusHistory,
    Report
};
