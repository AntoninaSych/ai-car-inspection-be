'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('car_generations', {
            id: {
                type: Sequelize.STRING(50),
                primaryKey: true,
            },
            model_id: {
                type: Sequelize.STRING(50),
                references: {
                    model: 'car_models',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            name: Sequelize.STRING(255),
            year_start: Sequelize.SMALLINT,
            year_stop: Sequelize.SMALLINT,
            is_restyle: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('car_generations');
    }
};
