import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useApiKeys = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les clés API
    const loadApiKeys = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getAllApiKeys();
            setApiKeys(response.data || []);
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement des clés API:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sauvegarder une clé API
    const saveApiKey = async (provider, apiKey) => {
        try {
            setError(null);
            const response = await apiService.saveApiKey(provider, apiKey);
            
            if (response.success) {
                await loadApiKeys(); // Recharger la liste
                return { success: true, message: response.message };
            } else {
                throw new Error(response.error || 'Erreur lors de la sauvegarde');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Supprimer une clé API
    const deleteApiKey = async (provider) => {
        try {
            setError(null);
            const response = await apiService.deleteApiKey(provider);
            
            if (response.success) {
                await loadApiKeys(); // Recharger la liste
                return { success: true, message: response.message };
            } else {
                throw new Error(response.error || 'Erreur lors de la suppression');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Activer/désactiver une clé API
    const toggleApiKey = async (provider, isActive) => {
        try {
            setError(null);
            const response = await apiService.toggleApiKey(provider, isActive);
            
            if (response.success) {
                await loadApiKeys(); // Recharger la liste
                return { success: true, message: response.message };
            } else {
                throw new Error(response.error || 'Erreur lors de la modification');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Tester une clé API
    const testApiKey = async (provider) => {
        try {
            setError(null);
            const response = await apiService.testApiKey(provider);
            
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                throw new Error(response.error || 'Erreur lors du test');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Obtenir une clé API spécifique
    const getApiKey = (provider) => {
        return apiKeys.find(key => key.provider === provider);
    };

    // Vérifier si une clé API existe et est active
    const hasActiveApiKey = (provider) => {
        const key = getApiKey(provider);
        return key && key.isActive && key.hasKey;
    };

    // Charger les clés API au montage du composant
    useEffect(() => {
        loadApiKeys();
    }, []);

    return {
        apiKeys,
        loading,
        error,
        loadApiKeys,
        saveApiKey,
        deleteApiKey,
        toggleApiKey,
        testApiKey,
        getApiKey,
        hasActiveApiKey,
    };
}; 