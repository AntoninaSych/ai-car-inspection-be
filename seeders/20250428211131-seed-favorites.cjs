'use strict';

const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    const dataPath = path.join(__dirname, "../db/source/users.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);

    const { relationships } = parsed;

    const now = new Date();

    // Insert favorites (user-recipe)
    const favorites = [];
    for (const [userId, recipeIds] of Object.entries(relationships.favorites)) {
      recipeIds.forEach((recipeId) => {
        favorites.push({
          id: uuidv4(),
          userId,
          recipeId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }
    if (favorites.length > 0) {
      await queryInterface.bulkInsert("favorites", favorites);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("favorites", null, {});
  },
};
