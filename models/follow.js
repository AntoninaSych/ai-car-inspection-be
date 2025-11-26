import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "follows",
    timestamps: true,
  }
);

export default Follow;
