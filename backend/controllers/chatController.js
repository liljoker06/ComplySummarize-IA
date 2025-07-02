import { Chat, Message, File, Model } from '../models/index.js';
import ollamaService from '../services/ollamaService.js';
import systemPromptService from '../services/systemPromptService.js';
import { OpenAI } from 'openai';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

class ChatController {
    constructor() {
        // Initialiser les clients API pour les providers externes
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.mistral = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY,
        });
    }

    async sendMessageToLLM(messages, model) {
        try {
            let completion;
            
            switch (model.provider) {
                case "ollama":
                    // Pour Ollama, utiliser le service existant mais avec nos messages
                    const response = await ollamaService.chat(model.name, messages);
                    const content = response?.message?.content || '';
                    return {
                        success: true,
                        content: content,
                        raw: content
                    };

                case "openai":
                    completion = await this.openai.chat.completions.create({
                        model: model.name,
                        messages: messages,
                        ...model.configuration
                    });
                    const openaiContent = completion?.choices?.[0]?.message?.content || '';
                    return {
                        success: true,
                        content: openaiContent,
                        raw: openaiContent
                    };

                case "mistral":
                    completion = await this.mistral.chat.complete({
                        model: model.name,
                        messages: messages
                    });
                    const mistralContent = completion?.choices?.[0]?.message?.content || '';
                    return {
                        success: true,
                        content: mistralContent,
                        raw: mistralContent
                    };

                case "anthropic":
                    throw new Error('Provider Anthropic non encore implémenté');

                case "google":
                    throw new Error('Provider Google non encore implémenté');

                case "huggingface":
                    throw new Error('Provider HuggingFace non encore implémenté');

                default:
                    throw new Error(`Provider ${model.provider} non supporté`);
            }

        } catch (error) {
            console.error('Erreur lors de l\'appel au LLM:', error);
            return {
                success: false,
                error: error.message,
                content: `Erreur: ${error.message}`,
                raw: error.message
            };
        }
    }

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

            // Trouver le modèle à utiliser
            const model = await Model.findOne({ 
                where: { 
                    name: modelName || undefined,
                    isActive: true 
                } 
            }) || await Model.findOne({ where: { isDefault: true } });

            if (!model) {
                throw new Error('Aucun modèle actif trouvé');
            }

            // Construire l'historique de conversation avec le system prompt
            const conversationHistory = systemPromptService.buildConversationHistory(
                previousMessages, 
                chat.file.extractedText
            );

            // Ajouter le nouveau message utilisateur
            conversationHistory.push({
                role: 'user',
                content: content
            });

            // Envoyer au LLM approprié
            const response = await this.sendMessageToLLM(conversationHistory, model);

            if (!response.success) {
                throw new Error(response.error || 'Erreur lors de la génération de la réponse');
            }

            // Vérifier que le contenu n'est pas null ou vide
            const responseContent = response.content || response.raw || 'Désolé, je n\'ai pas pu générer une réponse.';
            
            if (!responseContent || responseContent.trim() === '') {
                throw new Error('La réponse générée est vide');
            }

            const assistantMessage = await Message.create({
                chatId: chatId,
                modelId: model.id,
                content: responseContent.trim(),
                type: 'assistant',
                metadata: {
                    model: model.name,
                    provider: model.provider,
                    tokens: responseContent.length,
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