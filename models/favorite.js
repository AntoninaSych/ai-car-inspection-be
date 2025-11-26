"use strict";
import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Favorite = sequelize.define(
  "Favorite", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
  }
);

export default Favorite;
