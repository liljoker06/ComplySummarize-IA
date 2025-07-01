import { Ollama } from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

class OllamaService {
    constructor() {
        this.ollama = new Ollama({ 
            host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' 
        });
    }

    getSystemPrompt() {
        return `Tu es un assistant IA spécialisé dans l'analyse et la discussion de documents. 

Tes caractéristiques :
- Tu es précis, analytique et pédagogique
- Tu réponds toujours en français
- Tu peux faire référence au contenu du document et aux échanges précédents
- Tu structures tes réponses de manière claire et organisée
- Tu peux extraire des informations, résumer, expliquer et répondre aux questions
- Si on te demande du JSON, tu respectes le format demandé

Instructions spéciales :
- Quand tu reçois un document, tu l'analyses en profondeur
- Tu peux faire des liens entre différentes parties du document
- Tu adaptes ton niveau de détail selon la question posée
- Tu peux proposer des actions ou des suggestions pertinentes

Reste toujours professionnel et utile dans tes réponses.`;
    }

    buildConversationHistory(messages, documentText, customSystemPrompt = null) {
        const history = [];
        
        const systemPrompt = customSystemPrompt || this.getSystemPrompt();
        history.push({
            role: 'system',
            content: systemPrompt
        });

        if (documentText) {
            const truncatedText = documentText.length > 4000 
                ? documentText.substring(0, 4000) + '...[document tronqué]'
                : documentText;
                
            history.push({
                role: 'system',
                content: `CONTENU DU DOCUMENT À ANALYSER :\n\n${truncatedText}`
            });
        }

        for (const message of messages) {
            history.push({
                role: message.type === 'user' ? 'user' : 'assistant',
                content: message.content
            });
        }

        return history;
    }

    async chat(modelName, messages, options = {}) {
        try {
            const chatOptions = {
                model: modelName,
                messages: messages,
                ...options
            };

            const response = await this.ollama.chat(chatOptions);
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'appel à Ollama:', error);
            throw new Error(`Erreur lors de l'appel au modèle ${modelName}: ${error.message}`);
        }
    }

    async chatWithJsonResponse(modelName, messages, jsonFormat = null) {
        const options = { format: 'json' };
        
        // Ajouter des instructions JSON au dernier message si un format est spécifié
        if (jsonFormat && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user') {
                lastMessage.content += `\n\nRéponds UNIQUEMENT avec un JSON valide suivant cette structure :\n${JSON.stringify(jsonFormat, null, 2)}`;
            }
        }

        const response = await this.chat(modelName, messages, options);
        return this.parseJsonResponse(response.message.content);
    }

    parseJsonResponse(rawContent) {
        let cleanedContent = rawContent.trim();
        
        // Extraire le JSON des balises markdown si présentes
        const jsonMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanedContent = jsonMatch[1].trim();
        }

        try {
            const parsed = JSON.parse(cleanedContent);
            return {
                success: true,
                data: parsed,
                raw: rawContent
            };
        } catch (error) {
            console.warn('Contenu JSON invalide:', error.message);
            return {
                success: false,
                error: error.message,
                raw: rawContent
            };
        }
    }

    async summarizeDocument(documentText, modelName = 'gemma3:12b') {
        const messages = [
            {
                role: 'system',
                content: this.getSystemPrompt()
            },
            {
                role: 'user',
                content: `Analyse ce document et génère un résumé structuré :\n\n${documentText}`
            }
        ];

        const jsonFormat = {
            "Résumé": "Résumé détaillé du document",
            "PointsClés": ["Point 1", "Point 2", "Point 3"],
            "SuggestionsActions": ["Action 1", "Action 2", "Action 3"]
        };

        return await this.chatWithJsonResponse(modelName, messages, jsonFormat);
    }

    async processInstructions(documentText, instructions, modelName = 'gemma3:12b') {
        const messages = [
            {
                role: 'system',
                content: this.getSystemPrompt()
            },
            {
                role: 'system',
                content: `CONTENU DU DOCUMENT :\n\n${documentText.substring(0, 4000)}...`
            },
            {
                role: 'user',
                content: instructions
            }
        ];

        const jsonFormat = {
            "Réponse": "Réponse détaillée aux instructions"
        };

        return await this.chatWithJsonResponse(modelName, messages, jsonFormat);
    }

    async continueConversation(conversationHistory, newMessage, modelName = 'gemma3:12b') {
        const messages = [...conversationHistory];
        messages.push({
            role: 'user',
            content: newMessage
        });

        return await this.chat(modelName, messages);
    }

    async getAvailableModels() {
        try {
            const models = await this.ollama.list();
            return models.models || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des modèles:', error);
            return [];
        }
    }

    async isModelAvailable(modelName) {
        try {
            const models = await this.getAvailableModels();
            return models.some(model => model.name === modelName);
        } catch (error) {
            console.error('Erreur lors de la vérification du modèle:', error);
            return false;
        }
    }
}

export default new OllamaService(); 