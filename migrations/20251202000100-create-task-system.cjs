"use strict";

const { v4: uuidv4 } = require("uuid");
const {INTEGER} = require("sequelize");

module.exports = {
    async up(queryInterface, Sequelize) {

        //
        // IMAGE TYPES
        //
        await queryInterface.createTable("image_types", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            }
        });

        await queryInterface.bulkInsert("image_types", [
            { id: uuidv4(), name: "left", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "right", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "front", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "back", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "issue", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "other", created_at: new Date(), updated_at: new Date() },
        ]);


        //
        // TASK STATUSES
        //
        await queryInterface.createTable("task_statuses", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            }
        });

        await queryInterface.bulkInsert("task_statuses", [
            { id: uuidv4(), name: "image_uploaded", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "email_sent", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "report_generated", created_at: new Date(), updated_at: new Date() },
        ]);


        //
        // TASKS
        //
        await queryInterface.createTable("tasks", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            // FK must be UUID
            brand_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: "car_brands", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            // FK must be UUID
            model_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: "car_models", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            year: {
                type: INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            mileage: {
                type: INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            owner_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            current_status_id: {
                type: Sequelize.UUID, // fixed INTEGER → UUID
                allowNull: true,
                references: { model: "task_statuses", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            is_paid: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
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



        //
        // TASK STATUS HISTORY
        //
        await queryInterface.createTable("task_status_history", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            task_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "tasks",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            status_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "task_statuses",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
                allowNull: false,
            },

            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
                allowNull: false,
            }
        });



        //
        // IMAGES
        //
        await queryInterface.createTable("images", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            local_path: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            task_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: "tasks", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            image_type_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "image_types", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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


        //
        // REPORTS
        //
        await queryInterface.createTable("reports", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            task_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "tasks", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            data: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
            url: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("reports");
        await queryInterface.dropTable("images");
        await queryInterface.dropTable("task_status_history");
        await queryInterface.dropTable("tasks");
        await queryInterface.dropTable("task_statuses");
        await queryInterface.dropTable("image_types");
    }
};
