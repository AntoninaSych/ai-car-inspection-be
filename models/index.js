import sequelize from '../db/sequelize.js';

import User from './User.js';
import CarBrand from "./CarBrand.js";
import CarModel from "./CarModel.js";
import CarGeneration from "./CarGeneration.js";
import CarConfiguration from "./CarConfiguration.js";


CarBrand.hasMany(CarModel, { foreignKey: "brand_id" });
CarModel.belongsTo(CarBrand, { foreignKey: "brand_id" });

CarModel.hasMany(CarGeneration, { foreignKey: "model_id" });
CarGeneration.belongsTo(CarModel, { foreignKey: "model_id" });

CarGeneration.hasMany(CarConfiguration, { foreignKey: "generation_id" });
CarConfiguration.belongsTo(CarGeneration, { foreignKey: "generation_id" });

export function applyAssociations() {}

export {
    sequelize,
    User,
    CarBrand,
    CarModel,
    CarGeneration,
    CarConfiguration,
};
