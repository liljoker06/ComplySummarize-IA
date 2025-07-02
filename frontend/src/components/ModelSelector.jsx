import React, { useState, useEffect } from 'react'
import { IoChevronDown, IoCheckmark, IoRefresh } from 'react-icons/io5'
import { FiCloud, FiCpu } from 'react-icons/fi'
import { SiOpenai, SiOllama } from 'react-icons/si'
import { useModels } from '../hooks/useModels'

export default function ModelSelector({ onModelChange, selectedModel = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    models, 
    defaultModel, 
    selectedModel: hookSelectedModel, 
    isLoading, 
    selectModel, 
    getAllActiveModels,
    loadModels 
  } = useModels()

  const availableModels = getAllActiveModels()
  const currentSelected = selectedModel || hookSelectedModel || defaultModel?.name || 'gemma3:1b'

  useEffect(() => {
    if (onModelChange && currentSelected) {
      onModelChange(currentSelected)
    }
  }, [currentSelected, onModelChange])

  const handleModelSelect = (modelName) => {
    selectModel(modelName)
    if (onModelChange) {
      onModelChange(modelName)
    }
    setIsOpen(false)
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'openai':
        return <SiOpenai className="text-green-600" size={16} />
      case 'mistral':
        return <FiCloud className="text-orange-600" size={16} />
      case 'ollama':
        return <SiOllama className="text-gray-800 dark:text-white" size={16} />
      case 'anthropic':
        return <FiCloud className="text-blue-600" size={16} />
      case 'google':
        return <FiCloud className="text-red-600" size={16} />
      case 'huggingface':
        return <FiCloud className="text-yellow-600" size={16} />
      default:
        return <FiCpu className="text-gray-600" size={16} />
    }
  }

  const getProviderName = (provider) => {
    const names = {
      openai: 'OpenAI',
      mistral: 'Mistral',
      ollama: 'Ollama',
      anthropic: 'Anthropic',
      google: 'Google',
      huggingface: 'HF'
    }
    return names[provider] || provider
  }

  const currentModel = availableModels.find(m => m.name === currentSelected)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      >
        <div className="flex items-center gap-2">
          {currentModel && getProviderIcon(currentModel.provider)}
          <span className="truncate">
            {currentModel ? currentModel.displayName : currentSelected}
          </span>
          {currentModel?.isDefault && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded">
              Défaut
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isLoading && <IoRefresh className="animate-spin text-gray-400" size={14} />}
          <IoChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Modèles disponibles ({availableModels.length})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  loadModels()
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Actualiser"
              >
                <IoRefresh size={14} />
              </button>
            </div>
            
            {availableModels.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Aucun modèle actif détecté</p>
                <p className="text-xs mt-1">Vérifiez la configuration dans les paramètres</p>
              </div>
            ) : (
              <div className="space-y-1">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => handleModelSelect(model.name)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
                      currentSelected === model.name ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getProviderIcon(model.provider)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {model.displayName}
                          </p>
                          {model.isDefault && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded flex-shrink-0">
                              Défaut
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getProviderName(model.provider)}
                          </span>
                          {model.description && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {model.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {currentSelected === model.name && (
                      <IoCheckmark className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
