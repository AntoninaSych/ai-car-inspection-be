import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CarBrand = sequelize.define(
    "CarBrand",
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        name: DataTypes.STRING(255),
        cyrillic_name: DataTypes.STRING(255),
        country: DataTypes.STRING(255),
        popular: DataTypes.BOOLEAN,
    },
    {
        tableName: "car_brands",
        timestamps: true,
        underscored: true,
    }
);

export default CarBrand;
