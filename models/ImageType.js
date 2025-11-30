import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const ImageType = sequelize.define(
    "ImageType",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(50),
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
        tableName: "image_types",
        timestamps: true,
        underscored: true,
    }
);

export default ImageType;
