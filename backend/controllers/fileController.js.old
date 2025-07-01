import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Chat, File, Message, Model } from '../models/index.js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { Mistral } from '@mistralai/mistralai';

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

            const defaultModel = await Model.findOne({ where: { isDefault: true } });

            const model = await Model.findOne({ 
                where: { 
                    name: defaultModel ? defaultModel.name : 'mistral-large-latest',
                    isActive: true 
                } 
            }) || await Model.findOne({ where: { isDefault: true } });

            const prompt = `
Document : 
---
${extractedText}
---

Génère un JSON structuré :
{
    "Résumé": "...",
    "PointsClés": ["..."],
    "SuggestionsActions": ["..."]
}
            `;

            const rawContent = await this.fetchLLM(prompt, model.name);

            let parsed;
            try {
                parsed = JSON.parse(rawContent);
            } catch (e) {
                await doc.update({ 
                    status: 'error',
                    processingError: 'JSON invalide retourné par l\'IA'
                });
                return res.status(500).json({ error: "JSON invalide retourné par l'IA.", rawContent });
            }

            await doc.update({
                extractedText: extractedText,
                summary: parsed["Résumé"],
                keyPoints: JSON.stringify(parsed["PointsClés"]),
                actionSuggestions: JSON.stringify(parsed["SuggestionsActions"]),
                status: 'processed',
                processedAt: new Date(),
                modelUsed: model ? model.name : null
            });

            const chat = await Chat.create({
                userId: req.user.userId,
                fileId: doc.id,
                title: "Résumé de " + file.originalname,
                status: 'active',
            });

            await Message.create({
                chatId: chat.id,
                modelId: model ? model.id : null,
                content: parsed["Résumé"],
                type: 'assistant',
                metadata: {
                    model: model ? model.name : null,
                    tokens: rawContent.length,
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

            let chat = await Chat.findOne({ where: { id: req.params.chatId ?? null } });
            if(!chat) {
                chat = await Chat.create({
                    userId: req.user.userId,
                    fileId: doc.id,
                    title: "Résumé de " + file.originalname,
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
                    name: modelName || 'mistral-large-latest',
                    isActive: true 
                } 
            }) || await Model.findOne({ where: { isDefault: true } });

            const prompt = `
Contenu du document :
---
${extractedText}
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

            const rawContent = await this.fetchLLM(prompt, model.name);

            let parsed;
            try {
                parsed = JSON.parse(rawContent);
            } catch (e) {
                await doc.update({ 
                    status: 'error',
                    processingError: 'JSON invalide retourné par l\'IA'
                });
                return res.status(500).json({ error: "JSON invalide retourné par l'IA.", rawContent });
            }

            await doc.update({
                extractedText: extractedText,
                summary: parsed["Réponse"],
                status: 'processed',
                processedAt: new Date(),
                modelUsed: model.name
            });

            await Message.create({
                chatId: chat.id,
                modelId: model ? model.id : null,
                content: parsed["Réponse"],
                type: 'assistant',
                metadata: {
                    model: model.name,
                    tokens: rawContent.length,
                }
            });

            res.json({ document: doc, chatId: chat.id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    async fetchLLM(prompt, modelName) {
        const modelData = await Model.findOne({ 
            where: { 
                name: modelName,
                isActive: true 
            } 
        });

        let completion;
        if (modelData) {
            switch (modelData.provider) {
                case "openai":
                    completion = await this.openai.chat.completions.create({
                        model: modelData.name,
                        messages: [{ role: "user", content: prompt }],
                        ...modelData.configuration
                    });
                    break;
                case "anthropic":
                    throw new Error('Provider Anthropic non encore implémenté');
                case "mistral":
                    completion = await this.mistral.chat.complete({
                        model: modelData.name,
                        messages: [{ role: "user", content: prompt }]
                    });
                    break;
                default:
                    throw new Error(`Provider ${modelData.provider} non supporté`);
            }
        } else {
            completion = await this.mistral.chat.complete({
                model: 'mistral-large-latest',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });
            console.log(completion.choices[0].message.content);
        }
        
        let rawContent = completion.choices[0].message.content;
        
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            rawContent = jsonMatch[1].trim();
        }
        
        rawContent = rawContent.trim();
        
        try {
            const parsed = JSON.parse(rawContent);
            return JSON.stringify(parsed);
        } catch (e) {
            console.warn('Contenu JSON potentiellement invalide:', e.message);
            return rawContent;
        }
    }
}

export default new FileController();
