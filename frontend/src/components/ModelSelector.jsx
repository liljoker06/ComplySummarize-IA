import React, { useState, useEffect } from 'react'
import { IoChevronDown, IoCheckmark, IoRefresh } from 'react-icons/io5'
import { useModels } from '../hooks/useModels'

export default function ModelSelector({ onModelChange, selectedModel = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    models, 
    defaultModel, 
    selectedModel: hookSelectedModel, 
    isLoading, 
    selectModel, 
    getAvailableOllamaModels,
    loadModels 
  } = useModels()

  const availableModels = getAvailableOllamaModels()
  const currentSelected = selectedModel || hookSelectedModel || defaultModel?.name || 'gemma3:12b'

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

  const formatModelSize = (size) => {
    if (!size) return ''
    const gb = (size / (1024 * 1024 * 1024)).toFixed(1)
    return `${gb} GB`
  }

  return (
    <div className="relative w-64 text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 dark:text-white">
            {currentSelected}
          </span>
          {defaultModel?.name === currentSelected && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
              Par défaut
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isLoading && <IoRefresh className="animate-spin text-gray-500 dark:text-gray-300" size={14} />}
          <IoChevronDown className="text-gray-500 dark:text-gray-300" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-2 max-h-64 overflow-y-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                loadModels()
              }}
              className="w-full flex items-center gap-2 p-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
            >
              <IoRefresh className={isLoading ? 'animate-spin' : ''} />
              Actualiser les modèles
            </button>

            {availableModels.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Aucun modèle Ollama détecté</p>
                <p className="text-xs mt-1">Vérifiez qu'Ollama est démarré</p>
              </div>
            ) : (
              availableModels.map((model) => (
                <div
                  key={model.name}
                  onClick={() => handleModelSelect(model.name)}
                  className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
                    currentSelected === model.name ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                      {defaultModel?.name === model.name && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                          Défaut
                        </span>
                      )}
                    </div>
                    {model.size && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Taille: {formatModelSize(model.size)}
                      </p>
                    )}
                  </div>
                  {currentSelected === model.name && (
                    <IoCheckmark className="text-blue-600 dark:text-blue-400 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
