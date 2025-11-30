// models/CarBrand.js
import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CarBrand = sequelize.define(
    "CarBrand",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        // API brand ID: e.g. "ABARTH"
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        cyrillic_name: {
            type: DataTypes.STRING(255),
        },

        country: {
            type: DataTypes.STRING(255),
        },

        numeric_id: {
            type: DataTypes.INTEGER,
        },

        year_from: {
            type: DataTypes.INTEGER,
        },

        year_to: {
            type: DataTypes.INTEGER,
        },

        popular: {
            type: DataTypes.BOOLEAN,
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
        tableName: "car_brands",
        timestamps: true,
        underscored: true,
    }
);

export default CarBrand;
