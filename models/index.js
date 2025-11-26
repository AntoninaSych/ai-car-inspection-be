import sequelize from '../db/sequelize.js';

import User from './User.js';
import Area from './Area.js';
import Category from './Category.js';
import Ingredient from './Ingredient.js';
import Recipe from './Recipe.js';
import Testimonial from './Testimonial.js';
import RecipeIngredient from './RecipeIngredient.js';
import Follow from "./follow.js";
import Favorite from "./favorite.js";

// User ↔ Recipe
User.hasMany(Recipe, { foreignKey: 'ownerId', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Recipe ↔ Category
Recipe.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Recipe, { foreignKey: 'categoryId', as: 'recipes' });

// Recipe ↔ Area
Recipe.belongsTo(Area, { foreignKey: 'areaId', as: 'area' });
Area.hasMany(Recipe, { foreignKey: 'areaId', as: 'recipes' });

// Recipe ↔ Ingredient (many-to-many)
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredient,
  as: "ingredients",
  foreignKey: "recipeId",
  otherKey: "ingredientId",
});
Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredient,
  as: "recipes",
  foreignKey: "ingredientId",
  otherKey: "recipeId",
});

// User ↔ User (followers/followings)
User.belongsToMany(User, {
  through: Follow,
  as: "followings",
  foreignKey: "followerId",
  otherKey: "followingId",
});
User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "followingId",
  otherKey: "followerId",
});

// User ↔ Recipe (favorites)
User.belongsToMany(Recipe, {
  through: Favorite,
  as: "favorites",
  foreignKey: "userId",
  otherKey: "recipeId",
});
Recipe.belongsToMany(User, {
  through: Favorite,
  as: "favorited",
  foreignKey: "recipeId",
  otherKey: "userId",
});
User.hasMany(Testimonial, { foreignKey: 'owner', as: 'testimonials' });
Testimonial.belongsTo(User, { foreignKey: 'owner', as: 'user' });

export {
  sequelize,
  User,
  Area,
  Category,
  Ingredient,
  Recipe,
  Testimonial,
  RecipeIngredient,
  Follow,
  Favorite,
};
