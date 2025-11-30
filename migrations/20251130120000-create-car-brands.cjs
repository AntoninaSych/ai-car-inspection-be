"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("car_brands", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            // code from API, example: "ABARTH"
            code: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },

            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            cyrillic_name: {
                type: Sequelize.STRING(255),
            },

            country: {
                type: Sequelize.STRING(255),
            },

            numeric_id: {
                type: Sequelize.INTEGER,
            },

            year_from: {
                type: Sequelize.INTEGER,
            },

            year_to: {
                type: Sequelize.INTEGER,
            },

            popular: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
        await queryInterface.dropTable("car_brands");
    }
};
