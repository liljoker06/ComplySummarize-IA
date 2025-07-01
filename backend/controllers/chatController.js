import { Chat, Message, File, Model } from '../models/index.js';
import ollamaService from '../services/ollamaService.js';
import dotenv from 'dotenv';

dotenv.config();

class ChatController {

    // Créer un nouveau chat
    async createChat(req, res) {
        try {
            const { fileId, title } = req.body;
            
            // Vérifier que le fichier existe et appartient à l'utilisateur
            const file = await File.findOne({
                where: { 
                    id: fileId, 
                    userId: req.user.userId 
                }
            });
            
            if (!file) {
                return res.status(404).json({ error: "Fichier non trouvé." });
            }

            const chat = await Chat.create({
                userId: req.user.userId,
                fileId: fileId,
                title: title || `Chat sur ${file.originalName}`,
                status: 'active'
            });

            res.json({ chat });
        } catch (error) {
            console.error('Erreur lors de la création du chat:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Récupérer tous les chats d'un utilisateur
    async getUserChats(req, res) {
        try {
            const chats = await Chat.findAll({
                where: { 
                    userId: req.user.userId,
                    status: 'active'
                },
                include: [
                    {
                        model: File,
                        as: 'file',
                        attributes: ['originalName', 'fileName']
                    }
                ],
                order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']]
            });

            res.json({ chats });
        } catch (error) {
            console.error('Erreur lors de la récupération des chats:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Récupérer un chat avec ses messages
    async getChatWithMessages(req, res) {
        try {
            const { chatId } = req.params;
            
            const chat = await Chat.findOne({
                where: { 
                    id: chatId, 
                    userId: req.user.userId 
                },
                include: [
                    {
                        model: File,
                        as: 'file',
                        attributes: ['originalName', 'fileName', 'extractedText']
                    }
                ]
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat non trouvé." });
            }

            const messages = await Message.findAll({
                where: { 
                    chatId: chatId,
                    isDeleted: false
                },
                order: [['createdAt', 'ASC']]
            });

            res.json({ chat, messages });
        } catch (error) {
            console.error('Erreur lors de la récupération du chat:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async sendMessage(req, res) {
        try {
            const { chatId } = req.params;
            const { content, modelName } = req.body;

            if (!content || content.trim() === '') {
                return res.status(400).json({ error: "Le contenu du message est requis." });
            }

            const chat = await Chat.findOne({
                where: { 
                    id: chatId, 
                    userId: req.user.userId 
                },
                include: [
                    {
                        model: File,
                        as: 'file',
                        attributes: ['extractedText']
                    }
                ]
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat non trouvé." });
            }

            const previousMessages = await Message.findAll({
                where: { 
                    chatId: chatId,
                    isDeleted: false
                },
                order: [['createdAt', 'ASC']],
                limit: 20
            });

            const userMessage = await Message.create({
                chatId: chatId,
                userId: req.user.userId,
                content: content,
                type: 'user'
            });

            const defaultModel = await Model.findOne({ where: { isDefault: true } });
            const finalModelName = modelName || (defaultModel ? defaultModel.name : 'gemma3:1b');

            const conversationHistory = ollamaService.buildConversationHistory(
                previousMessages, 
                chat.file.extractedText
            );

            const response = await ollamaService.continueConversation(
                conversationHistory,
                content,
                finalModelName
            );

            let aiResponse = response.message.content;

            const assistantMessage = await Message.create({
                chatId: chatId,
                modelId: defaultModel ? defaultModel.id : null,
                content: aiResponse,
                type: 'assistant',
                metadata: {
                    model: finalModelName,
                    tokens: response.message.content.length,
                    conversationLength: conversationHistory.length + 1
                }
            });

            await chat.update({
                lastMessageAt: new Date(),
                messageCount: chat.messageCount + 2
            });

            res.json({ 
                userMessage, 
                assistantMessage,
                chat: {
                    id: chat.id,
                    messageCount: chat.messageCount + 2
                }
            });

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            res.status(500).json({ error: error.message });
        }
    }



    async deleteChat(req, res) {
        try {
            const { chatId } = req.params;
            
            const chat = await Chat.findOne({
                where: { 
                    id: chatId, 
                    userId: req.user.userId 
                }
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat non trouvé." });
            }

            await chat.update({ status: 'deleted' });
            
            res.json({ message: "Chat supprimé avec succès." });
        } catch (error) {
            console.error('Erreur lors de la suppression du chat:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async archiveChat(req, res) {
        try {
            const { chatId } = req.params;
            
            const chat = await Chat.findOne({
                where: { 
                    id: chatId, 
                    userId: req.user.userId 
                }
            });

            if (!chat) {
                return res.status(404).json({ error: "Chat non trouvé." });
            }

            await chat.update({ status: 'archived' });
            
            res.json({ message: "Chat archivé avec succès." });
        } catch (error) {
            console.error('Erreur lors de l\'archivage du chat:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ChatController();