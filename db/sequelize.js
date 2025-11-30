// db/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import configFile from '../config/config.js';

// Resolve absolute project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..');

// Load .env from project root
dotenv.config({ path: path.join(rootPath, '.env') });

// Debug
console.log("Sequelize ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

let sequelize;

// Case 1: DATABASE_URL provided
if (config.use_env_variable) {
    const url = process.env[config.use_env_variable];

    if (!url) {
        console.error(
            `❌ ERROR: Environment variable ${config.use_env_variable} is missing.`
        );
        process.exit(1);
    }

    sequelize = new Sequelize(url, {
        dialect: 'postgres',
        dialectOptions: config.dialectOptions || {},
        logging: false,
    });

// Case 2: fallback to manual config
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        {
            host: config.host,
            port: config.port,
            dialect: config.dialect,
            dialectOptions: config.dialectOptions || {},
            logging: false,
        }
    );
}

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection successful");
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        process.exit(1);
    }
};

export default sequelize;
