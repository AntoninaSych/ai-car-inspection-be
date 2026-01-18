"use strict";

module.exports = {
    async up(queryInterface) {
        await queryInterface.removeColumn("users", "resetPasswordToken");
        await queryInterface.removeColumn("users", "resetPasswordExpires");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("users", "resetPasswordToken", {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
        });
        await queryInterface.addColumn("users", "resetPasswordExpires", {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
        });
    },
};

