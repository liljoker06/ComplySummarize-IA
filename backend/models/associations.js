import User from './User.js';
import File from './File.js';
import Chat from './Chat.js';
import Message from './Message.js';
import Model from './Model.js';

/**
 * Définition des associations entre les modèles
 * Établit les relations de clés étrangères et les méthodes d'association
 */

// User associations
User.hasMany(File, {
  foreignKey: 'userId',
  as: 'files',
  onDelete: 'CASCADE'
});

User.hasMany(Chat, {
  foreignKey: 'userId',
  as: 'chats',
  onDelete: 'CASCADE'
});

User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages',
  onDelete: 'SET NULL'
});

// File associations
File.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

File.hasMany(Chat, {
  foreignKey: 'fileId',
  as: 'chats',
  onDelete: 'CASCADE'
});

// Chat associations
Chat.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Chat.belongsTo(File, {
  foreignKey: 'fileId',
  as: 'file'
});

Chat.hasMany(Message, {
  foreignKey: 'chatId',
  as: 'messages',
  onDelete: 'CASCADE'
});

// Message associations
Message.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chat'
});

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Message.belongsTo(Model, {
  foreignKey: 'modelId',
  as: 'model'
});

// Auto-référence pour les messages threadés
Message.belongsTo(Message, {
  foreignKey: 'parentMessageId',
  as: 'parentMessage'
});

Message.hasMany(Message, {
  foreignKey: 'parentMessageId',
  as: 'replies'
});

// Model associations
Model.hasMany(Message, {
  foreignKey: 'modelId',
  as: 'messages',
  onDelete: 'SET NULL'
});

export {
  User,
  File,
  Chat,
  Message,
  Model
}; 