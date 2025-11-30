'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('car_brands', {
            id: {
                type: Sequelize.STRING(50),
                primaryKey: true,
            },
            name: Sequelize.STRING(255),
            cyrillic_name: Sequelize.STRING(255),
            country: Sequelize.STRING(255),
            popular: Sequelize.BOOLEAN,
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('car_brands');
    }
};
