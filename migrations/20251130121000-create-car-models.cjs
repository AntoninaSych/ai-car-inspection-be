"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("car_models", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            // API id: e.g. "ABARTH_500"
            code: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            // foreign key to brands
            brand_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "car_brands",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            cyrillic_name: {
                type: Sequelize.STRING(255),
            },

            class: {
                type: Sequelize.STRING(100),
            },

            year_from: {
                type: Sequelize.INTEGER,
            },

            year_to: {
                type: Sequelize.INTEGER,
            },

            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },

            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("car_models");
    }
};
