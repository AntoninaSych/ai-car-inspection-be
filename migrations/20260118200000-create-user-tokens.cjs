"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_tokens", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            token: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true,
            },

            type: {
                type: Sequelize.ENUM("password_reset", "direct_access", "email_verify"),
                allowNull: false,
            },

            // Additional data (e.g., reportId for direct_access)
            data: {
                type: Sequelize.JSONB,
                allowNull: true,
            },

            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            used_at: {
                type: Sequelize.DATE,
                allowNull: true,
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

        // Index for faster token lookups
        await queryInterface.addIndex("user_tokens", ["token"]);
        await queryInterface.addIndex("user_tokens", ["user_id", "type"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("user_tokens");
    },
};

