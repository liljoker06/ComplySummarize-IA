import { Ollama } from 'ollama';

class OllamaService {
    constructor() {
        this.ollama = new Ollama({ 
            host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' 
        });
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
        try {
            const fullMessages = [...messages];
            
            if (jsonFormat && fullMessages.length > 0) {
                const lastMessage = fullMessages[fullMessages.length - 1];
                if (lastMessage.role === 'user') {
                    lastMessage.content += `\n\nIMPORTANT: Réponds UNIQUEMENT avec un JSON valide suivant cette structure exacte :\n${JSON.stringify(jsonFormat, null, 2)}\n\nNe pas ajouter d'explication, juste le JSON.`;
                }
            }

            const options = { format: 'json' };
            const response = await this.chat(modelName, fullMessages, options);
            
            return this.parseJsonResponse(response?.message?.content || '');
        } catch (error) {
            return {
                success: false,
                error: error.message,
                raw: error.message
            };
        }
    }

    parseJsonResponse(rawContent) {
        if (!rawContent || rawContent.trim() === '') {
            return {
                success: false,
                error: 'Réponse vide',
                raw: rawContent || ''
            };
        }

        let cleanedContent = rawContent.trim();
        
        const jsonMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanedContent = jsonMatch[1].trim();
        }

        const jsonObjectMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
            cleanedContent = jsonObjectMatch[0];
        }

        try {
            const parsed = JSON.parse(cleanedContent);
            return {
                success: true,
                data: parsed,
                raw: rawContent
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                raw: rawContent
            };
        }
    }

    async summarizeDocument(documentText, modelName = 'gemma3:1b') {
        const messages = [
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

    async processInstructions(documentText, instructions, modelName = 'gemma3:1b') {
        const messages = [
            {
                role: 'user',
                content: `Contenu du document :\n\n${documentText.substring(0, 4000)}...\n\nInstructions :\n${instructions}`
            }
        ];

        const jsonFormat = {
            "Réponse": "Réponse détaillée aux instructions"
        };

        let result = await this.chatWithJsonResponse(modelName, messages, jsonFormat);
        
        if (!result.success || !result.data || Object.keys(result.data).length === 0) {
            const fallbackMessages = [
                {
                    role: 'user',
                    content: `Contenu du document :\n\n${documentText.substring(0, 4000)}...\n\nInstructions :\n${instructions}\n\nRéponds de manière détaillée et structurée.`
                }
            ];
            
            const fallbackResponse = await this.chat(modelName, fallbackMessages);
            const content = fallbackResponse?.message?.content || '';
            
            if (content.trim()) {
                return {
                    success: true,
                    data: { "Réponse": content.trim() },
                    raw: content
                };
            }
        }

        return result;
    }

    async continueConversation(conversationHistory, newMessage, modelName = 'gemma3:1b') {
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