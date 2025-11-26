import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Ingredient = sequelize.define('Ingredient', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    thumb: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'ingredients',
});

export default Ingredient;
