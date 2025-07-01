import DarkModeToggle from "../ui/DarkModeToggle"

export default function SettingGeneral() {
    const handleClearCache = () => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Paramètres Généraux
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
                Configurez les paramètres généraux de l'application, y compris le thème, la langue et les informations de contact.
            </p>

            <hr className="border-gray-300 dark:border-gray-700 my-4" />

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Vous pouvez modifier ces paramètres à tout moment. Les changements prendront effet immédiatement.
            </p>

            <hr className="border-gray-300 dark:border-gray-700 my-4" />

            {/* Thème */}
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 inline-block">Thème</label>
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Activer le mode sombre ou clair</span>
                    <DarkModeToggle />
                </div>
            </div>

            {/* Vider le cache */}
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 inline-block">Cache</label>
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Supprimer les données locales stockées</span>
                    <button
                        onClick={handleClearCache}
                        className="px-3 py-1 md:px-4 md:py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm rounded-lg"
                    >
                        Vider le cache
                    </button>
                </div>
            </div>


            {/* Infos générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Nom de l'application</label>
                    <div className="mt-1 font-medium">ComplySummarize IA</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Version</label>
                    <div className="mt-1 font-medium">1.0.0</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Langue par défaut</label>
                    <div className="mt-1 font-medium">Français</div>
                </div>
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Mode maintenance</label>
                    <div className="mt-1 font-medium">Désactivé</div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email support</label>
                    <div className="mt-1 font-medium">support@complysummarize.fr</div>
                </div>
            </div>
        </div>
    )
}
