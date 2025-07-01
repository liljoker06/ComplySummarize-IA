import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useModels = () => {
    const [models, setModels] = useState({
        ollama: [],
        database: []
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
            setModels(response.models || { ollama: [], database: [] });
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement des modèles:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                setSelectedModel('gemma3:12b');
            }
        }
    }, [selectedModel]);

    const setNewDefaultModel = useCallback(async (modelName) => {
        try {
            setIsLoading(true);
            const response = await apiService.setDefaultModel(modelName);
            setDefaultModel(response.model);
            setSelectedModel(modelName);
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la définition du modèle par défaut:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

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
        loadDefaultModel,
        setNewDefaultModel,
        checkModelAvailability,
        selectModel,
        
        getAvailableOllamaModels,
        clearError: () => setError(null),
    };
}; 