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

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

const sequelize = new Sequelize(config.url, {
    dialect: 'postgres',
    dialectOptions: config.dialectOptions || {},
    logging: false,
});

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
