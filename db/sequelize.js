import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import configFile from '../config/config.js'; // путь проверь по проекту

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];

let sequelize;

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        {
            host: config.host,
            port: config.port,
            dialect: config.dialect,
            dialectOptions: config.dialectOptions,
        }
    );
}

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

export default sequelize;
