import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modèle Chat - Représente une conversation sur un document
 * Chaque chat est lié à un utilisateur et un fichier spécifique
 */
const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'files',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active',
    allowNull: false,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
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
  tableName: 'chats',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['fileId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['lastMessageAt']
    }
  ]
});

export default Chat; 