import { SiOpenai, SiAnthropic, SiOllama } from 'react-icons/si'

export default function ApiPage() {
  const models = [
    {
      name: 'claude',
      displayName: 'Claude',
      provider: 'anthropic',
      icon: <SiAnthropic size={28} className="text-blue-600" />,
      description: 'API puissante pour la rédaction de textes complexes et les résumés juridiques.',
      docUrl: 'https://docs.anthropic.com/claude',
      requiresKey: true,
    },
    {
      name: 'chatgpt',
      displayName: 'ChatGPT',
      provider: 'openai',
      icon: <SiOpenai size={28} className="text-green-600" />,
      description: "Modèle d'OpenAI performant pour la génération de texte, questions/réponses, etc.",
      docUrl: 'https://platform.openai.com/docs',
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
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold">Configuration des modèles IA</h2>

      {models.map((model) => (
        <div
          key={model.name}
          className="border dark:border-gray-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-gray-800 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex gap-4 flex-1">
            <div className="shrink-0">{model.icon}</div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="font-semibold text-lg">{model.displayName}</p>
                <a
                  href={model.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Documentation
                </a>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto mt-2 sm:mt-0">
            {model.requiresKey ? (
              <input
                type="password"
                placeholder={`Clé API ${model.displayName}`}
                className="w-full sm:w-80 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            ) : (
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 dark:bg-green-700 dark:text-white rounded-full text-sm font-medium">
                Intégré localement
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="w-full flex justify-center sm:justify-end">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
          Sauvegarder
        </button>
      </div>

    </div>
  )
}
