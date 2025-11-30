import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const TaskStatusHistory = sequelize.define(
    "TaskStatusHistory",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        task_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        status_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "task_status_history",
        timestamps: true,
        underscored: true,
    }
);

export default TaskStatusHistory;
