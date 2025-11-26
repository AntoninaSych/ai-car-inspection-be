import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Area = sequelize.define('Area', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'areas',
});

export default Area;
