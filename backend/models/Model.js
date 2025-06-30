import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modèle Model - Représente les modèles IA disponibles
 * Gère les différents LLM et leurs configurations
 */
const Model = sequelize.define('Model', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  provider: {
    type: DataTypes.ENUM('openai', 'anthropic', 'google', 'ollama', 'huggingface', 'mistral'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'models',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['provider']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isDefault']
    }
  ]
});

export default Model; 