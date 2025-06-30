import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Modèle File - Représente les documents PDF uploadés
 * Stocke les métadonnées et le chemin vers le fichier
 */
const File = sequelize.define('File', {
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
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'application/pdf',
    validate: {
      isIn: [['application/pdf']]
    }
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 50 * 1024 * 1024 // 50MB max
    }
  },
  status: {
    type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'error'),
    defaultValue: 'uploaded',
    allowNull: false,
  },
  extractedText: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  summary: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  keyPoints: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  actionSuggestions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  processingError: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'files',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['fileName']
    }
  ]
});

export default File; 