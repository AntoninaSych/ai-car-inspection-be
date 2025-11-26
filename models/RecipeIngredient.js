import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Recipe from "./Recipe.js";
import Ingredient from "./Ingredient.js";

const RecipeIngredient = sequelize.define('RecipeIngredient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    recipeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'recipes',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    ingredientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ingredients',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    measure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'recipe_ingredients',
});

export default RecipeIngredient;
