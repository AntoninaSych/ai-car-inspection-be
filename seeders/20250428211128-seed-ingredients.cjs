'use strict';

const ingredients = require('../db/source/ingredients.json');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface) {
    const ingredientsMap = [];
    const ingredientsData = ingredients.map(ingredient => {
      const newId = uuidv4();
      ingredientsMap.push({ oldId: ingredient._id, newId });
      return {
        id: newId,
        name: ingredient.name,
        thumb: ingredient.img,
        desc: ingredient.desc,
      };
    });

    await queryInterface.bulkInsert('ingredients', ingredientsData);

    const tempDir = path.resolve(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    fs.writeFileSync(
        path.join(tempDir, 'ingredients-map.json'),
        JSON.stringify(ingredientsMap, null, 2)
    );
    console.log('📝 Saved temp/ingredients-map.json');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ingredients', null, {});
  }
};