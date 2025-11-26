'use strict';

const areas = require('../db/source/areas.json');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const areasData = areas.map(area => ({
      id: uuidv4(),
      name: area.name,
    }));

    await queryInterface.bulkInsert('areas', areasData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('areas', null, {});
  }
};
