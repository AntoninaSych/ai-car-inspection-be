'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('car_configurations', {
            id: {
                type: Sequelize.STRING(50),
                primaryKey: true,
            },
            generation_id: {
                type: Sequelize.STRING(50),
                references: {
                    model: 'car_generations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            doors_count: Sequelize.INTEGER,
            body_type: Sequelize.STRING(255),
            notice: Sequelize.STRING(255),
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
        await queryInterface.dropTable('car_configurations');
    }
};
