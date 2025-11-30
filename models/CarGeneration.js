import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CarGeneration = sequelize.define(
    "CarGeneration",
    {
        id: {
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        model_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: DataTypes.STRING(255),
        year_start: DataTypes.SMALLINT,
        year_stop: DataTypes.SMALLINT,
        is_restyle: DataTypes.BOOLEAN,
    },
    {
        tableName: "car_generations",
        timestamps: true,
        underscored: true,
    }
);

export default CarGeneration;
