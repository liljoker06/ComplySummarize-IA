import React, { useState } from 'react'
import { IoChevronDown, IoCheckmark } from 'react-icons/io5'

const models = [
  { name: 'GPT-4o', desc: 'Idéal pour la plupart des tâches' },
  { name: 'o3', desc: 'Utilisation du raisonnement avancé' },
  { name: 'o4-mini', desc: 'Le plus rapide en matière de raisonnement avancé' },
  { name: 'o4-mini-high', desc: 'Idéal pour le codage et le raisonnement visuel' }
]

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(models[0])

  return (
    <div className="relative w-64 text-sm">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        <span className="font-medium text-gray-800 dark:text-white">{selected.name}</span>
        <IoChevronDown className="text-gray-500 dark:text-gray-300" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="p-2">
            {models.map((model) => (
              <div
                key={model.name}
                onClick={() => {
                  setSelected(model)
                  setIsOpen(false)
                }}
                className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
                  selected.name === model.name ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{model.desc}</p>
                </div>
                {selected.name === model.name && (
                  <IoCheckmark className="text-blue-600 dark:text-blue-400 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
