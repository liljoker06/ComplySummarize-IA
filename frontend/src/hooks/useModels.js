import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useModels = () => {
    const [models, setModels] = useState({
        database: {
            all: [],
            active: [],
            byProvider: {
                ollama: [],
                mistral: [],
                openai: [],
                anthropic: [],
                google: [],
                huggingface: []
            }
        },
        ollama: []
    });
    const [defaultModel, setDefaultModel] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadModels = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.getAvailableModels();
            setModels(response.models || {
                database: { all: [], active: [], byProvider: {} },
                ollama: []
            });
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement des modèles:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const syncModels = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.syncModels();
            console.log('Synchronisation terminée:', response.message);
            // Recharger les modèles après synchronisation
            await loadModels();
            return response;
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la synchronisation des modèles:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadModels]);

    const loadDefaultModel = useCallback(async () => {
        try {
            const response = await apiService.getDefaultModel();
            setDefaultModel(response.defaultModel);
            
            if (!selectedModel) {
                setSelectedModel(response.defaultModel?.name || response.fallback);
            }
        } catch (err) {
            console.error('Erreur lors du chargement du modèle par défaut:', err);
            if (!selectedModel) {
                setSelectedModel('gemma3:1b');
            }
        }
    }, [selectedModel]);

    const setNewDefaultModel = useCallback(async (modelName) => {
        try {
            setIsLoading(true);
            const response = await apiService.setDefaultModel(modelName);
            setDefaultModel(response.model);
            setSelectedModel(modelName);
            // Recharger les modèles pour mettre à jour les statuts
            await loadModels();
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la définition du modèle par défaut:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadModels]);

    const toggleModelStatus = useCallback(async (modelId, isActive) => {
        try {
            setIsLoading(true);
            const response = await apiService.toggleModelStatus(modelId, isActive);
            console.log(response.message);
            // Recharger les modèles pour mettre à jour les statuts
            await loadModels();
            return response;
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du changement de statut du modèle:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadModels]);

    const checkModelAvailability = useCallback(async (modelName) => {
        try {
            const response = await apiService.checkModel(modelName);
            return response.isAvailable;
        } catch (err) {
            console.error('Erreur lors de la vérification du modèle:', err);
            return false;
        }
    }, []);

    const getAvailableOllamaModels = useCallback(() => {
        return models.ollama.map(model => ({
            name: model.name,
            label: model.name,
            size: model.size,
            modified_at: model.modified_at
        }));
    }, [models.ollama]);

    const getAllActiveModels = useCallback(() => {
        return models.database.active.map(model => ({
            id: model.id,
            name: model.name,
            displayName: model.displayName,
            provider: model.provider,
            isDefault: model.isDefault,
            description: model.description
        }));
    }, [models.database.active]);

    const getModelsByProvider = useCallback((provider) => {
        return models.database.byProvider[provider] || [];
    }, [models.database.byProvider]);

    const selectModel = useCallback((modelName) => {
        setSelectedModel(modelName);
    }, []);

    useEffect(() => {
        loadModels();
        loadDefaultModel();
    }, [loadModels, loadDefaultModel]);

    return {
        models,
        defaultModel,
        selectedModel,
        isLoading,
        error,
        
        loadModels,
        syncModels,
        loadDefaultModel,
        setNewDefaultModel,
        toggleModelStatus,
        checkModelAvailability,
        selectModel,
        
        getAvailableOllamaModels,
        getAllActiveModels,
        getModelsByProvider,
        
        clearError: () => setError(null),
    };
}; 