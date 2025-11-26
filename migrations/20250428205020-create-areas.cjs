'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('areas', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // 🔥 Название области должно быть уникальным
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), // 🔥 по умолчанию текущая дата
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'), // 🔥 по умолчанию текущая дата
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('areas');
  }
};