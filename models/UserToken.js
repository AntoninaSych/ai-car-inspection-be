import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

export const TOKEN_TYPES = {
    PASSWORD_RESET: "password_reset",
    DIRECT_ACCESS: "direct_access",
    EMAIL_VERIFY: "email_verify",
};

const UserToken = sequelize.define(
    "UserToken",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        token: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },

        type: {
            type: DataTypes.ENUM("password_reset", "direct_access", "email_verify"),
            allowNull: false,
        },

        data: {
            type: DataTypes.JSONB,
            allowNull: true,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        used_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "user_tokens",
        timestamps: true,
        underscored: true,
    }
);

export default UserToken;

