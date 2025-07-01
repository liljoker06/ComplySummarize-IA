import ollamaService from '../services/ollamaService.js';
import { Model } from '../models/index.js';

class ModelController {
    // Récupérer tous les modèles disponibles sur Ollama
    async getAvailableModels(req, res) {
        try {
            const ollamaModels = await ollamaService.getAvailableModels();
            const dbModels = await Model.findAll({
                where: { isActive: true }
            });

            const models = {
                ollama: ollamaModels.map(model => ({
                    name: model.name,
                    size: model.size,
                    modified_at: model.modified_at,
                    digest: model.digest
                })),
                database: dbModels.map(model => ({
                    id: model.id,
                    name: model.name,
                    provider: model.provider,
                    isDefault: model.isDefault,
                    isActive: model.isActive
                }))
            };

            res.json({ models });
        } catch (error) {
            console.error('Erreur lors de la récupération des modèles:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Vérifier si un modèle est disponible
    async checkModel(req, res) {
        try {
            const { modelName } = req.params;
            const isAvailable = await ollamaService.isModelAvailable(modelName);
            
            res.json({ 
                modelName,
                isAvailable,
                provider: 'ollama'
            });
        } catch (error) {
            console.error('Erreur lors de la vérification du modèle:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Définir un modèle par défaut
    async setDefaultModel(req, res) {
        try {
            const { modelName } = req.body;

            if (!modelName) {
                return res.status(400).json({ error: "Le nom du modèle est requis." });
            }

            // Vérifier que le modèle existe sur Ollama
            const isAvailable = await ollamaService.isModelAvailable(modelName);
            if (!isAvailable) {
                return res.status(404).json({ 
                    error: `Le modèle ${modelName} n'est pas disponible sur Ollama.` 
                });
            }

            // Désactiver tous les modèles par défaut actuels
            await Model.update(
                { isDefault: false },
                { where: { isDefault: true } }
            );

            // Créer ou mettre à jour le modèle dans la base de données
            const [model, created] = await Model.findOrCreate({
                where: { name: modelName },
                defaults: {
                    name: modelName,
                    provider: 'ollama',
                    isDefault: true,
                    isActive: true,
                    configuration: {}
                }
            });

            if (!created) {
                await model.update({ 
                    isDefault: true,
                    isActive: true 
                });
            }

            res.json({ 
                message: `Modèle ${modelName} défini comme modèle par défaut.`,
                model: {
                    id: model.id,
                    name: model.name,
                    provider: model.provider,
                    isDefault: model.isDefault
                }
            });
        } catch (error) {
            console.error('Erreur lors de la définition du modèle par défaut:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Récupérer le modèle par défaut
    async getDefaultModel(req, res) {
        try {
            const defaultModel = await Model.findOne({ 
                where: { isDefault: true } 
            });

            if (!defaultModel) {
                return res.json({ 
                    message: "Aucun modèle par défaut défini.",
                    defaultModel: null,
                    fallback: 'gemma3:1b'
                });
            }

            res.json({ 
                defaultModel: {
                    id: defaultModel.id,
                    name: defaultModel.name,
                    provider: defaultModel.provider,
                    isDefault: defaultModel.isDefault
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du modèle par défaut:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ModelController(); 