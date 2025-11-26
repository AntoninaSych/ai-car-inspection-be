import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    testimonial: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    owner: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    timestamps: false,
    tableName: 'testimonials',
});

export default Testimonial;
