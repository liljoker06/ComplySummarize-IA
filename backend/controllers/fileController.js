import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Chat, File, Message, Model } from '../models/index.js';
import ollamaService from '../services/ollamaService.js';
import piiService from '../services/piiService.js';
import { OpenAI } from 'openai';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

class FileController {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.mistral = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY,
        });
    }

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

            const anonymizationResult = piiService.anonymizeText(extractedText);

            const defaultModel = await Model.findOne({ where: { isDefault: true } });
            const model = defaultModel || await Model.findOne({ where: { isActive: true } });
            
            if (!model) {
                throw new Error('Aucun modèle actif trouvé');
            }

            const prompt = `
Document : 
---
${anonymizationResult.anonymizedText}
---

Génère un JSON structuré :
{
    "Résumé": "...",
    "PointsClés": ["..."],
    "SuggestionsActions": ["..."]
}
            `;

            const result = await this.fetchLLM(prompt, model);

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
                extractedText: anonymizationResult.anonymizedText,
                summary: parsed["Résumé"],
                keyPoints: JSON.stringify(parsed["PointsClés"]),
                actionSuggestions: JSON.stringify(parsed["SuggestionsActions"]),
                status: 'processed',
                processedAt: new Date(),
                modelUsed: model.name,
                piiDetected: anonymizationResult.piiDetected,
                piiStats: JSON.stringify({ detectedCount: anonymizationResult.detectedCount })
            });

            const chat = await Chat.create({
                userId: req.user.userId,
                fileId: doc.id,
                title: "Résumé de " + file.originalname,
                status: 'active',
            });

            await Message.create({
                chatId: chat.id,
                modelId: model.id,
                content: parsed["Résumé"],
                type: 'assistant',
                metadata: {
                    model: model.name,
                    tokens: result.raw.length,
                }
            });

            res.json({ document: doc, chatId: chat.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

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

            const anonymizationResult = piiService.anonymizeText(extractedText);

            let chat = await Chat.findOne({ where: { id: req.params.chatId ?? null } });
            if (!chat) {
                chat = await Chat.create({
                    userId: req.user.userId,
                    fileId: doc.id,
                    title: "Chat sur " + file.originalname,
                    status: 'active',
                });
            }

            await Message.create({
                chatId: chat.id,
                userId: req.user.userId,
                content: instructions,
                type: 'user',
            });

            const model = await Model.findOne({ 
                where: { 
                    name: modelName || undefined,
                    isActive: true 
                } 
            }) || await Model.findOne({ where: { isDefault: true } });

            if (!model) {
                throw new Error('Aucun modèle actif trouvé');
            }

            const prompt = `
Contenu du document :
---
${anonymizationResult.anonymizedText}
---

Instructions :
---
${instructions}
---

Génère un JSON structuré :
{
    "Réponse": "..."
}
            `;

            const result = await this.fetchLLM(prompt, model);

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
                extractedText: anonymizationResult.anonymizedText,
                summary: parsed["Réponse"],
                status: 'processed',
                processedAt: new Date(),
                modelUsed: model.name,
                piiDetected: anonymizationResult.piiDetected,
                piiStats: JSON.stringify({ detectedCount: anonymizationResult.detectedCount })
            });

            await Message.create({
                chatId: chat.id,
                modelId: model.id,
                content: parsed["Réponse"],
                type: 'assistant',
                metadata: {
                    model: model.name,
                    tokens: result.raw.length,
                }
            });

            res.json({ document: doc, chatId: chat.id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async fetchLLM(prompt, model) {
        try {
            let completion;
            
            switch (model.provider) {
                case "ollama":
                    const messages = [
                        { role: "user", content: prompt }
                    ];
                    return await ollamaService.chatWithJsonResponse(model.name, messages);

                case "openai":
                    completion = await this.openai.chat.completions.create({
                        model: model.name,
                        messages: [{ role: "user", content: prompt }],
                        ...model.configuration
                    });
                    break;

                case "mistral":
                    completion = await this.mistral.chat.complete({
                        model: model.name,
                        messages: [{ role: "user", content: prompt }]
                    });
                    break;

                case "anthropic":
                    throw new Error('Provider Anthropic non encore implémenté');

                case "google":
                    throw new Error('Provider Google non encore implémenté');

                case "huggingface":
                    throw new Error('Provider HuggingFace non encore implémenté');

                default:
                    throw new Error(`Provider ${model.provider} non supporté`);
            }
            
            let rawContent = completion.choices[0].message.content;
            
            const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                rawContent = jsonMatch[1].trim();
            }
            
            rawContent = rawContent.trim();
            
            try {
                const parsed = JSON.parse(rawContent);
                return {
                    success: true,
                    data: parsed,
                    raw: rawContent
                };
            } catch (e) {
                console.warn('Contenu JSON potentiellement invalide:', e.message);
                return {
                    success: false,
                    error: e.message,
                    raw: rawContent
                };
            }

        } catch (error) {
            console.error('Erreur lors de l\'appel au LLM:', error);
            return {
                success: false,
                error: error.message,
                raw: error.message
            };
        }
    }
}

export default new FileController();
