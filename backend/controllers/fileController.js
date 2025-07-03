import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Chat, File, Message, Model } from '../models/index.js';
import ollamaService from '../services/ollamaService.js';
import systemPromptService from '../services/systemPromptService.js';
import piiService from '../services/piiService.js';
import apiKeyService from '../services/apiKeyService.js';
import { OpenAI } from 'openai';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

class FileController {
    constructor() {
        // Les clients seront initialisés dynamiquement avec les clés de la BDD
        this.openai = null;
        this.mistral = null;
    }

    async getOpenAIClient() {
        if (!this.openai) {
            const apiKey = await apiKeyService.getApiKey('openai');
            if (!apiKey) {
                throw new Error('Clé API OpenAI non configurée');
            }
            this.openai = new OpenAI({ apiKey });
        }
        return this.openai;
    }

    async getMistralClient() {
        if (!this.mistral) {
            const apiKey = await apiKeyService.getApiKey('mistral');
            if (!apiKey) {
                throw new Error('Clé API Mistral non configurée');
            }
            this.mistral = new Mistral({ apiKey });
        }
        return this.mistral;
    }

    // Méthode pour convertir un objet en texte lisible
    formatObjectToText(obj, indent = 0) {
        if (typeof obj === 'string') {
            return obj;
        }
        
        if (typeof obj !== 'object' || obj === null) {
            return String(obj);
        }
        
        const spaces = '  '.repeat(indent);
        let result = '';
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.formatObjectToText(item, indent)).join('\n');
        }
        
        for (const [key, value] of Object.entries(obj)) {
            result += `${spaces}${key}: `;
            if (typeof value === 'object' && value !== null) {
                result += '\n' + this.formatObjectToText(value, indent + 1);
            } else {
                result += this.formatObjectToText(value, indent);
            }
            result += '\n';
        }
        
        return result.trim();
    }

    async extractTextFromPDF(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Le fichier ${filePath} n'existe pas`);
            }

            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            // Vérifier que le texte extrait est valide
            let extractedText = pdfData.text || '';
            
            // Nettoyer le texte des caractères de contrôle et métadonnées PDF
            extractedText = extractedText
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
                .replace(/\d{10}\s+\d{5}\s+n\s*/g, '') // Supprimer les références PDF (xref table)
                .replace(/startxref[\s\S]*?%%EOF/g, '') // Supprimer les métadonnées de fin PDF
                .replace(/trailer[\s\S]*?%%EOF/g, '') // Supprimer le trailer PDF
                .replace(/<<[^>]*>>/g, '') // Supprimer les objets PDF
                .replace(/\s+/g, ' ') // Normaliser les espaces
                .trim();
            
            // Vérifier que le texte contient du contenu lisible
            if (!extractedText || extractedText.length < 10) {
                throw new Error('Le PDF ne contient pas de texte lisible ou le texte est trop court');
            }
            
            // Vérifier que ce n'est pas que des métadonnées PDF
            const pdfMetadataRegex = /^[\d\s\n\r%<>\/\[\]()]+$/;
            if (pdfMetadataRegex.test(extractedText)) {
                throw new Error('Le PDF semble contenir uniquement des métadonnées, pas de texte lisible');
            }
            
            return extractedText;
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

            const messageContent = parsed["Résumé"] || 'Résumé non disponible';
            if (!messageContent || messageContent.trim() === '') {
                throw new Error('Le contenu du message généré est vide');
            }

            await Message.create({
                chatId: chat.id,
                modelId: model.id,
                content: messageContent.trim(),
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
            console.log(parsed);

            // Convertir la réponse en texte lisible si c'est un objet
            let summaryText;
            const responseData = parsed["Réponse"];
            if (typeof responseData === 'object' && responseData !== null) {
                summaryText = this.formatObjectToText(responseData);
            } else {
                summaryText = responseData ? responseData.toString() : 'Réponse non disponible';
            }

            await doc.update({
                extractedText: anonymizationResult.anonymizedText,
                summary: summaryText,
                status: 'processed',
                processedAt: new Date(),
                modelUsed: model.name,
                piiDetected: anonymizationResult.piiDetected,
                piiStats: JSON.stringify({ detectedCount: anonymizationResult.detectedCount })
            });


            // Utiliser le même texte formaté pour le message
            const messageContent = summaryText || 'Réponse non disponible';
            if (!messageContent || messageContent.trim() === '') {
                throw new Error('Le contenu de la réponse généré est vide');
            }
            
            await Message.create({
                chatId: chat.id,
                modelId: model.id,
                content: messageContent.trim(),
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
            const systemPrompt = systemPromptService.getSystemPrompt();
            
            switch (model.provider) {
                case "ollama":
                    const messages = [
                        { role: "user", content: prompt }
                    ];
                    return await ollamaService.chatWithJsonResponse(model.name, messages);

                case "openai":
                    const openaiClient = await this.getOpenAIClient();
                    completion = await openaiClient.chat.completions.create({
                        model: model.name,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: prompt }
                        ],
                        ...model.configuration
                    });
                    break;

                case "mistral":
                    const mistralClient = await this.getMistralClient();
                    completion = await mistralClient.chat.complete({
                        model: model.name,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: prompt }
                        ]
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
            
            let rawContent = completion?.choices?.[0]?.message?.content || '';
            
            if (!rawContent || rawContent.trim() === '') {
                return {
                    success: false,
                    error: 'Réponse vide du modèle',
                    raw: 'Aucune réponse générée'
                };
            }
            
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
