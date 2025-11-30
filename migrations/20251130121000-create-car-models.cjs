'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('car_models', {
            id: {
                type: Sequelize.STRING(50),
                primaryKey: true,
            },
            brand_id: {
                type: Sequelize.STRING(50),
                references: {
                    model: 'car_brands',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            name: Sequelize.STRING(255),
            cyrillic_name: Sequelize.STRING(255),
            class: Sequelize.STRING(100),
            year_from: Sequelize.SMALLINT,
            year_to: Sequelize.SMALLINT,
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
        await queryInterface.dropTable('car_models');
    }
};
