import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CarModel = sequelize.define(
    "CarModel",
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        brand_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: DataTypes.STRING(255),
        cyrillic_name: DataTypes.STRING(255),
        class: DataTypes.STRING(100),
        year_from: DataTypes.SMALLINT,
        year_to: DataTypes.SMALLINT,
    },
    {
        tableName: "car_models",
        timestamps: true,
        underscored: true,
    }
);

export default CarModel;
