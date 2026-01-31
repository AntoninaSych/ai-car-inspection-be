import dotenv from 'dotenv';
dotenv.config();

const {
    POSTGRES_HOST = '127.0.0.1',
    POSTGRES_PORT = '5433',
    POSTGRES_USER = 'ai_car',
    POSTGRES_PASSWORD = '',
    POSTGRES_DB = 'ai_car',
} = process.env;

const DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

export default {
    development: {
        url: DATABASE_URL,
        dialect: "postgres",
        dialectOptions: {
            ssl: false,
        },
    },
    test: {
        url: DATABASE_URL,
        dialect: "postgres",
        dialectOptions: {
            ssl: false,
        },
    },
    production: {
        url: DATABASE_URL,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    }
};
