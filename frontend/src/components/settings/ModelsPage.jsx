import { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheck, FiX, FiStar, FiDatabase, FiCloud, FiCpu } from 'react-icons/fi';
import { SiOpenai, SiOllama } from 'react-icons/si';
import { useModels } from '../../hooks/useModels';

export default function ModelsPage() {
    const {
        models,
        defaultModel,
        isLoading,
        error,
        syncModels,
        setNewDefaultModel,
        toggleModelStatus,
        getAllActiveModels,
        getModelsByProvider,
        clearError
    } = useModels();

    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        try {
            setSyncing(true);
            await syncModels();
        } catch (err) {
            console.error('Erreur lors de la synchronisation:', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleSetDefault = async (modelName) => {
        try {
            await setNewDefaultModel(modelName);
        } catch (err) {
            console.error('Erreur lors de la définition du modèle par défaut:', err);
        }
    };

    const handleToggleStatus = async (modelId, currentStatus) => {
        try {
            await toggleModelStatus(modelId, !currentStatus);
        } catch (err) {
            console.error('Erreur lors du changement de statut:', err);
        }
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'openai':
                return <SiOpenai className="text-green-600" size={20} />;
            case 'mistral':
                return <FiCloud className="text-orange-600" size={20} />;
            case 'ollama':
                return <SiOllama className="text-gray-800 dark:text-white" size={20} />;
            case 'anthropic':
                return <FiCloud className="text-blue-600" size={20} />;
            case 'google':
                return <FiCloud className="text-red-600" size={20} />;
            case 'huggingface':
                return <FiCloud className="text-yellow-600" size={20} />;
            default:
                return <FiCpu className="text-gray-600" size={20} />;
        }
    };

    const getProviderName = (provider) => {
        const names = {
            openai: 'OpenAI',
            mistral: 'Mistral AI',
            ollama: 'Ollama (Local)',
            anthropic: 'Anthropic',
            google: 'Google',
            huggingface: 'Hugging Face'
        };
        return names[provider] || provider;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des modèles IA</h2>
                <button
                    onClick={handleSync}
                    disabled={syncing || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all"
                >
                    <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Synchronisation...' : 'Synchroniser'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2">
                        <FiDatabase className="text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold">{models.database.all.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2">
                        <FiCheck className="text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Actifs</span>
                    </div>
                    <p className="text-2xl font-bold">{models.database.active.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2">
                        <SiOllama className="text-gray-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ollama</span>
                    </div>
                    <p className="text-2xl font-bold">{models.ollama.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Par défaut</span>
                    </div>
                    <p className="text-sm font-medium">{defaultModel?.displayName || 'Aucun'}</p>
                </div>
            </div>

            {/* Liste des modèles par provider */}
            <div className="space-y-6">
                {Object.entries(models.database.byProvider).map(([provider, providerModels]) => {
                    if (providerModels.length === 0) return null;

                    return (
                        <div key={provider} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    {getProviderIcon(provider)}
                                    <h3 className="text-lg font-semibold">{getProviderName(provider)}</h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        ({providerModels.length} modèle{providerModels.length > 1 ? 's' : ''})
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {providerModels.map((model) => (
                                        <div
                                            key={model.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-medium">{model.displayName}</h4>
                                                    {model.isDefault && (
                                                        <span className="flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">
                                                            <FiStar size={12} />
                                                            Par défaut
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        model.isActive 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {model.isActive ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {model.description || 'Aucune description'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    ID: {model.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!model.isDefault && model.isActive && (
                                                    <button
                                                        onClick={() => handleSetDefault(model.name)}
                                                        className="text-sm px-3 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded transition-all"
                                                    >
                                                        Définir par défaut
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleToggleStatus(model.id, model.isActive)}
                                                    className={`text-sm px-3 py-1 rounded transition-all ${
                                                        model.isActive
                                                            ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400'
                                                            : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400'
                                                    }`}
                                                >
                                                    {model.isActive ? 'Désactiver' : 'Activer'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Informations Ollama */}
            {models.ollama.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <SiOllama className="text-gray-800 dark:text-white" size={20} />
                            <h3 className="text-lg font-semibold">Modèles Ollama détectés</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({models.ollama.length} modèle{models.ollama.length > 1 ? 's' : ''})
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {models.ollama.map((model) => (
                                <div
                                    key={model.name}
                                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <h4 className="font-medium">{model.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Taille: {((model.size || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB
                                    </p>
                                    {model.modified_at && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Modifié: {formatDate(model.modified_at)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 