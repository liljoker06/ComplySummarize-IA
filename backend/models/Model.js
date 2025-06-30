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
    type: DataTypes.ENUM('openai', 'anthropic', 'google', 'ollama', 'huggingface'),
    allowNull: false,
  },
  modelVersion: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  capabilities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Capacités du modèle (summarization, qa, analysis, etc.)'
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Informations de tarification (input/output tokens)'
  },
  maxTokens: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1000
    }
  },
  contextWindow: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1000
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  configuration: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuration spécifique au modèle (température, top_p, etc.)'
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