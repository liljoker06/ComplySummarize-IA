import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from 'react-icons/io5'
import SettingGeneral from '../components/settings/SettingGeneral'
import ApiPage from '../components/settings/ApiPage'
import ModelsPage from '../components/settings/ModelsPage'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const navigate = useNavigate()

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'models', label: 'Modèles' },
    { id: 'api', label: 'API' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Retour */}
        <button
          onClick={() => navigate('/conversation')}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          <IoChevronBackOutline size={20} />
          <span>Retour à la conversation</span>
        </button>

        {/* Onglets */}
        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div>
          {activeTab === 'general' && <SettingGeneral />}
          {activeTab === 'models' && <ModelsPage />}
          {activeTab === 'api' && <ApiPage />}
        </div>
      </div>
    </div>
  )
}
