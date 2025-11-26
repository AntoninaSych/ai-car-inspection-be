// models/Recipe.js
import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Area from './Area.js';
import User from "./User.js"; // 🔥 подключаем модель областей

const Recipe = sequelize.define('Recipe', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    thumb: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    areaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'areas',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'recipes',
});




export default Recipe;
