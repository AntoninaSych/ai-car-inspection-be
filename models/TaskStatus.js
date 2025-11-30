import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const TaskStatus = sequelize.define(
    "TaskStatus",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
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
        tableName: "task_statuses",
        timestamps: true,
        underscored: true,
    }
);

export default TaskStatus;
