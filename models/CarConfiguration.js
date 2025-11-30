import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CarConfiguration = sequelize.define(
    "CarConfiguration",
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        generation_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        doors_count: DataTypes.INTEGER,
        body_type: DataTypes.STRING(255),
        notice: DataTypes.STRING(255),
    },
    {
        tableName: "car_configurations",
        timestamps: true,
        underscored: true,
    }
);

export default CarConfiguration;
