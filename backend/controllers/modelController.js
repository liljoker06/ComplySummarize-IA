import ollamaService from '../services/ollamaService.js';
import modelSyncService from '../services/modelSyncService.js';
import { Model } from '../models/index.js';
import { Op } from 'sequelize';

class ModelController {
    // Récupérer tous les modèles disponibles (BDD + Ollama pour comparaison)
    async getAvailableModels(req, res) {
        try {
            // Récupérer les modèles de la base de données
            const dbModels = await modelSyncService.getAllModels();
            
            // Récupérer les modèles Ollama pour comparaison
            const ollamaModels = await ollamaService.getAvailableModels();

            const response = {
                database: {
                    all: dbModels.all.map(model => ({
                        id: model.id,
                        name: model.name,
                        displayName: model.displayName,
                        provider: model.provider,
                        description: model.description,
                        isDefault: model.isDefault,
                        isActive: model.isActive,
                        createdAt: model.createdAt,
                        updatedAt: model.updatedAt
                    })),
                    active: dbModels.active.map(model => ({
                        id: model.id,
                        name: model.name,
                        displayName: model.displayName,
                        provider: model.provider,
                        description: model.description,
                        isDefault: model.isDefault
                    })),
                    byProvider: {
                        ollama: dbModels.byProvider.ollama.map(model => ({
                            id: model.id,
                            name: model.name,
                            displayName: model.displayName,
                            isActive: model.isActive,
                            isDefault: model.isDefault
                        })),
                        mistral: dbModels.byProvider.mistral.map(model => ({
                            id: model.id,
                            name: model.name,
                            displayName: model.displayName,
                            isActive: model.isActive,
                            isDefault: model.isDefault
                        })),
                        openai: dbModels.byProvider.openai.map(model => ({
                            id: model.id,
                            name: model.name,
                            displayName: model.displayName,
                            isActive: model.isActive,
                            isDefault: model.isDefault
                        }))
                    }
                },
                ollama: ollamaModels.map(model => ({
                    name: model.name,
                    size: model.size,
                    modified_at: model.modified_at,
                    digest: model.digest
                }))
            };

            res.json({ models: response });
        } catch (error) {
            console.error('Erreur lors de la récupération des modèles:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Synchroniser les modèles avec les providers
    async syncModels(req, res) {
        try {
            await modelSyncService.syncModelsToDatabase();
            
            // Récupérer les modèles mis à jour
            const updatedModels = await modelSyncService.getAllModels();
            
            res.json({ 
                message: 'Synchronisation des modèles terminée',
                models: updatedModels.all.map(model => ({
                    id: model.id,
                    name: model.name,
                    displayName: model.displayName,
                    provider: model.provider,
                    isActive: model.isActive,
                    isDefault: model.isDefault
                }))
            });
        } catch (error) {
            console.error('Erreur lors de la synchronisation des modèles:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Vérifier si un modèle est disponible
    async checkModel(req, res) {
        try {
            const { modelName } = req.params;
            
            // Vérifier dans la base de données
            const dbModel = await Model.findOne({ 
                where: { name: modelName } 
            });
            
            if (!dbModel) {
                return res.status(404).json({ 
                    error: `Modèle ${modelName} non trouvé en base de données.`
                });
            }

            // Si c'est un modèle Ollama, vérifier sa disponibilité en temps réel
            if (dbModel.provider === 'ollama') {
                const isAvailable = await ollamaService.isModelAvailable(modelName);
                
                // Mettre à jour le statut si nécessaire
                if (dbModel.isActive !== isAvailable) {
                    await dbModel.update({ isActive: isAvailable });
                }
                
                return res.json({ 
                    modelName,
                    provider: dbModel.provider,
                    isAvailable,
                    isInDatabase: true,
                    model: {
                        id: dbModel.id,
                        name: dbModel.name,
                        displayName: dbModel.displayName,
                        provider: dbModel.provider,
                        isActive: isAvailable
                    }
                });
            }
            
            // Pour les autres providers, utiliser le statut de la base de données
            res.json({ 
                modelName,
                provider: dbModel.provider,
                isAvailable: dbModel.isActive,
                isInDatabase: true,
                model: {
                    id: dbModel.id,
                    name: dbModel.name,
                    displayName: dbModel.displayName,
                    provider: dbModel.provider,
                    isActive: dbModel.isActive
                }
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

            // Vérifier que le modèle existe et est actif
            const model = await Model.findOne({ 
                where: { 
                    name: modelName,
                    isActive: true 
                } 
            });

            if (!model) {
                return res.status(404).json({ 
                    error: `Le modèle ${modelName} n'est pas disponible ou n'est pas actif.` 
                });
            }

            // Désactiver tous les modèles par défaut actuels
            await Model.update(
                { isDefault: false },
                { where: { isDefault: true } }
            );

            // Définir le nouveau modèle par défaut
            await model.update({ isDefault: true });

            res.json({ 
                message: `Modèle ${modelName} défini comme modèle par défaut.`,
                model: {
                    id: model.id,
                    name: model.name,
                    displayName: model.displayName,
                    provider: model.provider,
                    isDefault: true
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
                where: { 
                    isDefault: true,
                    isActive: true 
                } 
            });

            if (!defaultModel) {
                return res.json({ 
                    message: "Aucun modèle par défaut actif défini.",
                    defaultModel: null,
                    fallback: 'gemma3:1b'
                });
            }

            res.json({ 
                defaultModel: {
                    id: defaultModel.id,
                    name: defaultModel.name,
                    displayName: defaultModel.displayName,
                    provider: defaultModel.provider,
                    isDefault: defaultModel.isDefault,
                    description: defaultModel.description
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du modèle par défaut:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Activer/désactiver un modèle
    async toggleModelStatus(req, res) {
        try {
            const { modelId } = req.params;
            const { isActive } = req.body;

            const model = await Model.findByPk(modelId);
            if (!model) {
                return res.status(404).json({ error: "Modèle non trouvé." });
            }

            await model.update({ isActive: Boolean(isActive) });

            // Si on désactive le modèle par défaut, en choisir un autre
            if (!isActive && model.isDefault) {
                const newDefault = await Model.findOne({
                    where: { 
                        isActive: true,
                        id: { [Op.ne]: model.id }
                    }
                });

                if (newDefault) {
                    await model.update({ isDefault: false });
                    await newDefault.update({ isDefault: true });
                }
            }

            res.json({ 
                message: `Modèle ${model.name} ${isActive ? 'activé' : 'désactivé'}.`,
                model: {
                    id: model.id,
                    name: model.name,
                    isActive: Boolean(isActive)
                }
            });
        } catch (error) {
            console.error('Erreur lors du changement de statut du modèle:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ModelController(); 