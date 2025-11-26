'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const recipesDataRaw = require('../db/source/recipes.json');

module.exports = {
  async up(queryInterface) {
    const tempDir = path.resolve(__dirname, '../temp');
    const ingredientsMapPath = path.join(tempDir, 'ingredients-map.json');
    const recipesMapPath = path.join(tempDir, 'recipes-map.json');

    if (!fs.existsSync(ingredientsMapPath) || !fs.existsSync(recipesMapPath)) {
      throw new Error('❌ Mapping files not found in /temp. Please seed ingredients and recipes first.');
    }

    const ingredientsMapRaw = JSON.parse(fs.readFileSync(ingredientsMapPath));
    const recipesMapRaw = JSON.parse(fs.readFileSync(recipesMapPath));

    const ingredientMap = Object.fromEntries(ingredientsMapRaw.map(i => [i.oldId, i.newId]));
    const recipeMap = Object.fromEntries(recipesMapRaw.map(r => [r.title.trim().toLowerCase(), r.newId]));

    const recipeIngredients = [];

    for (const recipe of recipesDataRaw) {
      const recipeId = recipeMap[recipe.title.trim().toLowerCase()];
      if (!recipeId || !Array.isArray(recipe.ingredients)) continue;

      for (const ing of recipe.ingredients) {
        const ingredientId = ingredientMap[ing.id];
        if (!ingredientId) {
          console.warn(`⚠️ Ingredient not found: ${ing.id} in recipe "${recipe.title}"`);
          continue;
        }

        recipeIngredients.push({
          id: uuidv4(),
          recipeId,
          ingredientId,
          measure: ing.measure || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (!recipeIngredients.length) {
      console.warn('⚠️ No recipe ingredients to insert');
      return;
    }

    await queryInterface.bulkInsert('recipe_ingredients', recipeIngredients);
    console.log(`✅ Inserted ${recipeIngredients.length} recipe_ingredients`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('recipe_ingredients', null, {});
    console.log('🗑️ Deleted all recipe_ingredients');
  }
};
