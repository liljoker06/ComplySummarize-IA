import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Chat, File, Message, Model } from '../models/index.js';
import ollamaService from '../services/ollamaService.js';
import dotenv from 'dotenv';

dotenv.config();

class FileController {

    async extractTextFromPDF(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Le fichier ${filePath} n'existe pas`);
            }

            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            return pdfData.text;
        } catch (error) {
            console.error('Erreur lors de l\'extraction du texte PDF:', error);
            throw new Error(`Impossible d'extraire le texte du PDF: ${error.message}`);
        }
    }

    // Upload des documents sans instructions
    async uploadDocument(req, res) {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({ error: "Aucun fichier téléversé." });

            const doc = await File.create({
                userId: req.user.userId,
                fileName: file.filename,
                originalName: file.originalname,
                filePath: path.join('uploads', file.filename),
                mimeType: file.mimetype,
                fileSize: file.size,
                status: 'processing'
            });

            const filePath = path.join(process.cwd(), "uploads", file.filename);
            const extractedText = await this.extractTextFromPDF(filePath);

            const defaultModel = await Model.findOne({ where: { isDefault: true } });
            const modelName = defaultModel ? defaultModel.name : 'gemma3:1b';

            // Utiliser le service Ollama pour résumer le document
            const result = await ollamaService.summarizeDocument(extractedText, modelName);

            if (!result.success) {
                await doc.update({ 
                    status: 'error',
                    processingError: 'JSON invalide retourné par l\'IA'
                });
                return res.status(500).json({ 
                    error: "JSON invalide retourné par l'IA.", 
                    rawContent: result.raw 
                });
            }

            const parsed = result.data;

            await doc.update({
                extractedText: extractedText,
                summary: parsed["Résumé"],
                keyPoints: JSON.stringify(parsed["PointsClés"]),
                actionSuggestions: JSON.stringify(parsed["SuggestionsActions"]),
                status: 'processed',
                processedAt: new Date(),
                modelUsed: modelName
            });

            const chat = await Chat.create({
                userId: req.user.userId,
                fileId: doc.id,
                title: "Résumé de " + file.originalname,
                status: 'active',
            });

            await Message.create({
                chatId: chat.id,
                modelId: defaultModel ? defaultModel.id : null,
                content: parsed["Résumé"],
                type: 'assistant',
                metadata: {
                    model: modelName,
                    tokens: result.raw.length,
                }
            });

            res.json({ document: doc, chatId: chat.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    // Upload des documents avec instructions
    async uploadDocumentWithInstructions(req, res) {
        try {

            const file = req.file;
            const instructions = req.body.instructions;
            const modelName = req.body.model;

            if (!file) return res.status(400).json({ error: "Aucun fichier téléversé." });
            if (!instructions) return res.status(400).json({ error: "Des instructions sont requises." });

            const doc = await File.create({
                userId: req.user.userId,
                fileName: file.filename,
                originalName: file.originalname,
                filePath: path.join('uploads', file.filename),
                mimeType: file.mimetype,
                fileSize: file.size,
                status: 'processing'
            });

            const filePath = path.join(process.cwd(), "uploads", file.filename);
            const extractedText = await this.extractTextFromPDF(filePath);

            // Créer un nouveau chat pour cette conversation
            const chat = await Chat.create({
                userId: req.user.userId,
                fileId: doc.id,
                title: "Chat sur " + file.originalname,
                status: 'active',
            });

            // Créer le message utilisateur avec les instructions
            await Message.create({
                chatId: chat.id,
                userId: req.user.userId,
                content: instructions,
                type: 'user',
            });

            const defaultModel = await Model.findOne({ where: { isDefault: true } });
            const finalModelName = modelName || (defaultModel ? defaultModel.name : 'gemma3:1b');

            // Utiliser le service Ollama pour traiter les instructions
            const result = await ollamaService.processInstructions(extractedText, instructions, finalModelName);

            if (!result.success) {
                await doc.update({ 
                    status: 'error',
                    processingError: 'JSON invalide retourné par l\'IA'
                });
                return res.status(500).json({ 
                    error: "JSON invalide retourné par l'IA.", 
                    rawContent: result.raw 
                });
            }

            const parsed = result.data;

            await doc.update({
                extractedText: extractedText,
                summary: parsed["Réponse"],
                status: 'processed',
                processedAt: new Date(),
                modelUsed: finalModelName
            });

            await Message.create({
                chatId: chat.id,
                modelId: defaultModel ? defaultModel.id : null,
                content: parsed["Réponse"],
                type: 'assistant',
                metadata: {
                    model: finalModelName,
                    tokens: result.raw.length,
                }
            });

            res.json({ document: doc, chatId: chat.id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }


}

export default new FileController();
