import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Task = sequelize.define(
    "Task",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        brand_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        model_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        mileage: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        owner_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        current_status_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        is_paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: "tasks",
        timestamps: true,
        underscored: true,
    }
);

export default Task;
