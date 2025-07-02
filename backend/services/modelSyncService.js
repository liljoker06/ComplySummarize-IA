import { OpenAI } from 'openai';
import { Mistral } from '@mistralai/mistralai';
import ollamaService from './ollamaService.js';
import { Model } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

class ModelSyncService {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        }) : null;
        
        this.mistral = process.env.MISTRAL_API_KEY ? new Mistral({
            apiKey: process.env.MISTRAL_API_KEY,
        }) : null;

        this.expectedModels = {
            mistral: [
                {
                    name: 'mistral-8b-2410',
                    displayName: 'Mistral 8B (2410)',
                    description: 'Modèle Mistral 8B optimisé pour les tâches générales'
                },
                {
                    name: 'mistral-small-2501',
                    displayName: 'Mistral Small (2501)',
                    description: 'Modèle Mistral Small dernière version'
                },
                {
                    name: 'mistral-small-2506',
                    displayName: 'Mistral Small (2506)',
                    description: 'Modèle Mistral Small version avancée'
                }
            ],
            openai: [
                {
                    name: 'o3-mini',
                    displayName: 'GPT-o3 Mini',
                    description: 'Modèle OpenAI o3 Mini optimisé pour la rapidité'
                },
                {
                    name: 'o4-mini',
                    displayName: 'GPT-o4 Mini',
                    description: 'Modèle OpenAI o4 Mini dernière génération'
                }
            ]
        };
    }

    async checkMistralAvailability() {
        if (!this.mistral) {
            console.log('Clé API Mistral non configurée');
            return [];
        }

        const availableModels = [];
        
        for (const model of this.expectedModels.mistral) {
            try {
                await this.mistral.chat.complete({
                    model: model.name,
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1
                });
                availableModels.push(model.name);
                console.log(`✓ Modèle Mistral ${model.name} disponible`);
            } catch (error) {
                console.log(`✗ Modèle Mistral ${model.name} non disponible:`, error.message);
            }
        }

        return availableModels;
    }

    async checkOpenAIAvailability() {
        if (!this.openai) {
            console.log('Clé API OpenAI non configurée');
            return [];
        }

        const availableModels = [];
        
        for (const model of this.expectedModels.openai) {
            try {
                const models = await this.openai.models.list();
                const modelExists = models.data.some(m => m.id === model.name);
                
                if (modelExists) {
                    availableModels.push(model.name);
                    console.log(`✓ Modèle OpenAI ${model.name} disponible`);
                } else {
                    console.log(`✗ Modèle OpenAI ${model.name} non disponible`);
                }
            } catch (error) {
                console.log(`✗ Erreur lors de la vérification du modèle OpenAI ${model.name}:`, error.message);
            }
        }

        return availableModels;
    }

    async checkOllamaAvailability() {
        try {
            const ollamaModels = await ollamaService.getAvailableModels();
            console.log(`✓ ${ollamaModels.length} modèles Ollama disponibles`);
            return ollamaModels.map(model => model.name);
        } catch (error) {
            console.log('✗ Erreur lors de la vérification des modèles Ollama:', error.message);
            return [];
        }
    }

    async syncModelsToDatabase() {
        console.log('🔄 Début de la synchronisation des modèles...');

        try {
            const [mistralModels, openaiModels, ollamaModels] = await Promise.all([
                this.checkMistralAvailability(),
                this.checkOpenAIAvailability(),
                this.checkOllamaAvailability()
            ]);

            await this.syncProviderModels('mistral', mistralModels, this.expectedModels.mistral);

            await this.syncProviderModels('openai', openaiModels, this.expectedModels.openai);

            const ollamaModelData = await ollamaService.getAvailableModels();
            const ollamaExpectedModels = ollamaModelData.map(model => ({
                name: model.name,
                displayName: model.name,
                description: `Modèle Ollama local - Taille: ${this.formatSize(model.size)}`
            }));
            await this.syncProviderModels('ollama', ollamaModels, ollamaExpectedModels);

            await this.ensureDefaultModel();

            console.log('✅ Synchronisation des modèles terminée');

        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation des modèles:', error);
        }
    }

    async syncProviderModels(provider, availableModels, expectedModels) {
        for (const modelData of expectedModels) {
            const isAvailable = availableModels.includes(modelData.name);

            try {
                const [model, created] = await Model.findOrCreate({
                    where: { 
                        name: modelData.name,
                        provider: provider 
                    },
                    defaults: {
                        name: modelData.name,
                        displayName: modelData.displayName,
                        provider: provider,
                        description: modelData.description,
                        isActive: isAvailable,
                        isDefault: false
                    }
                });

                if (!created) {
                    await model.update({ 
                        isActive: isAvailable,
                        displayName: modelData.displayName,
                        description: modelData.description
                    });
                }

                console.log(`${isAvailable ? '✅' : '❌'} ${provider}/${modelData.name} - ${isAvailable ? 'activé' : 'désactivé'}`);

            } catch (error) {
                console.error(`Erreur lors de la synchronisation du modèle ${modelData.name}:`, error);
            }
        }
    }

    async ensureDefaultModel() {
        const defaultModel = await Model.findOne({ where: { isDefault: true } });
        
        if (!defaultModel) {
            const firstActiveModel = await Model.findOne({ 
                where: { isActive: true },
                order: [
                    ['provider', 'ASC'], // Préférer ollama, puis mistral, puis openai
                    ['name', 'ASC']
                ]
            });

            if (firstActiveModel) {
                await firstActiveModel.update({ isDefault: true });
                console.log(`✅ Modèle par défaut défini: ${firstActiveModel.name}`);
            } else {
                console.log('⚠️ Aucun modèle actif trouvé pour définir par défaut');
            }
        }
    }

    formatSize(bytes) {
        if (!bytes) return 'Taille inconnue';
        const gb = (bytes / (1024 * 1024 * 1024)).toFixed(1);
        return `${gb} GB`;
    }
    
    async getAllModels() {
        try {
            const models = await Model.findAll({
                order: [
                    ['provider', 'ASC'],
                    ['name', 'ASC']
                ]
            });

            return {
                all: models,
                active: models.filter(m => m.isActive),
                byProvider: {
                    ollama: models.filter(m => m.provider === 'ollama'),
                    mistral: models.filter(m => m.provider === 'mistral'),
                    openai: models.filter(m => m.provider === 'openai'),
                    anthropic: models.filter(m => m.provider === 'anthropic'),
                    google: models.filter(m => m.provider === 'google'),
                    huggingface: models.filter(m => m.provider === 'huggingface')
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des modèles:', error);
            throw error;
        }
    }
}

export default new ModelSyncService(); 