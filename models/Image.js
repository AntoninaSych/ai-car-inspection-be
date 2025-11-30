import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Image = sequelize.define(
    "Image",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        local_path: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        task_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        image_type_id: {
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
        tableName: "images",
        timestamps: true,
        underscored: true,
    }
);

export default Image;
