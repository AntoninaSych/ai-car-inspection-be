'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'language', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'en',
    });

    await queryInterface.addColumn('users', 'currency', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'USD',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'language');
    await queryInterface.removeColumn('users', 'currency');
  }
};

