import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Report = sequelize.define(
    "Report",
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

        data: {
            type: DataTypes.JSONB,
            allowNull: false,
        },

        url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "reports",
        timestamps: false,
        underscored: true,
    }
);

export default Report;
