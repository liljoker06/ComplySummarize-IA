import { useState, useEffect } from 'react';
import { SiOpenai, SiAnthropic, SiOllama } from 'react-icons/si';
import { useApiKeys } from '../../hooks/useApiKeys';

export default function ApiPage() {
  const { 
    apiKeys, 
    loading, 
    error, 
    saveApiKey, 
    deleteApiKey, 
    toggleApiKey, 
    testApiKey, 
    hasActiveApiKey 
  } = useApiKeys();

  const [formData, setFormData] = useState({
    openai: '',
    anthropic: '',
    mistral: ''
  });
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState(null);

  const models = [
    {
      name: 'anthropic',
      displayName: 'Claude (Anthropic)',
      provider: 'anthropic',
      icon: <SiAnthropic size={28} className="text-blue-600" />,
      description: 'API puissante pour la rédaction de textes complexes et les résumés juridiques.',
      docUrl: 'https://docs.anthropic.com/claude',
      requiresKey: true,
    },
    {
      name: 'openai',
      displayName: 'ChatGPT (OpenAI)',
      provider: 'openai',
      icon: <SiOpenai size={28} className="text-green-600" />,
      description: "Modèle d'OpenAI performant pour la génération de texte, questions/réponses, etc.",
      docUrl: 'https://platform.openai.com/docs',
      requiresKey: true,
    },
    {
      name: 'mistral',
      displayName: 'Mistral AI',
      provider: 'mistral',
      icon: <SiOpenai size={28} className="text-orange-600" />,
      description: 'Modèles français performants pour diverses tâches de traitement du langage.',
      docUrl: 'https://docs.mistral.ai/',
      requiresKey: true,
    },
    {
      name: 'ollama',
      displayName: 'Ollama',
      provider: 'ollama',
      icon: <SiOllama size={28} className="text-gray-800 dark:text-white" />,
      description: 'Fonctionne en local sans configuration — idéal pour les tests hors-ligne.',
      docUrl: 'https://ollama.com/library',
      requiresKey: false,
    },
  ];

  const handleInputChange = (provider, value) => {
    setFormData(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleSaveKey = async (provider) => {
    const apiKey = formData[provider];
    if (!apiKey || !apiKey.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une clé API valide.' });
      return;
    }

    setSaving(provider);
    setMessage(null);

    try {
      const result = await saveApiKey(provider, apiKey.trim());
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData(prev => ({ ...prev, [provider]: '' })); // Vider le champ
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (provider) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la clé API ${provider} ?`)) {
      return;
    }

    setSaving(provider);
    setMessage(null);

    try {
      const result = await deleteApiKey(provider);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    } finally {
      setSaving(null);
    }
  };

  const handleToggleKey = async (provider, isActive) => {
    setSaving(provider);
    setMessage(null);

    try {
      const result = await toggleApiKey(provider, isActive);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la modification.' });
    } finally {
      setSaving(null);
    }
  };

  const handleTestKey = async (provider) => {
    setSaving(provider);
    setMessage(null);

    try {
      const result = await testApiKey(provider);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du test.' });
    } finally {
      setSaving(null);
    }
  };

  // Effacer le message après 5 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold">Configuration des modèles IA</h2>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Message de succès/erreur */}
      {message && (
        <div className={`px-4 py-3 rounded border ${
          message.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {models.map((model) => {
        const hasKey = hasActiveApiKey(model.provider);
        const isProcessing = saving === model.provider;
        
        return (
          <div
            key={model.name}
            className="border dark:border-gray-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex flex-col gap-4">
              {/* En-tête */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0">{model.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-semibold text-lg">{model.displayName}</p>
                    <div className="flex items-center gap-2">
                      {hasKey && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-700 dark:text-white rounded-full text-xs font-medium">
                          Configuré
                        </span>
                      )}
                      <a
                        href={model.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Documentation
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-3">
                {model.requiresKey ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      placeholder={`Clé API ${model.displayName}`}
                      value={formData[model.provider] || ''}
                      onChange={(e) => handleInputChange(model.provider, e.target.value)}
                      className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      disabled={isProcessing}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveKey(model.provider)}
                        disabled={isProcessing || !formData[model.provider]?.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {isProcessing ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      {hasKey && (
                        <>
                          <button
                            onClick={() => handleTestKey(model.provider)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isProcessing ? 'Test...' : 'Tester'}
                          </button>
                          <button
                            onClick={() => handleDeleteKey(model.provider)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isProcessing ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="inline-block px-4 py-2 bg-green-100 text-green-800 dark:bg-green-700 dark:text-white rounded-full text-sm font-medium">
                    Intégré localement
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
