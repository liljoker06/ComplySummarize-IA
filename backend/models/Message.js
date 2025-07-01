import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modèle Message - Représente un message dans une conversation
 * Peut provenir d'un utilisateur ou d'un modèle IA
 */
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chats',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null si c'est un message de l'IA
    references: {
      model: 'users',
      key: 'id'
    }
  },
  modelId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null si c'est un message utilisateur
    references: {
      model: 'models',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  type: {
    type: DataTypes.ENUM('user', 'assistant', 'system'),
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées additionnelles (tokens utilisés, temps de traitement, etc.)'
  },
  parentMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    },
    comment: 'Pour les conversations threadées'
  },
  isDeleted: {
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
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['chatId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['modelId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['parentMessageId']
    }
  ]
});

export default Message; 