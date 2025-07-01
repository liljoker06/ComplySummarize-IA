import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { FiPlus, FiLogOut, FiUser } from 'react-icons/fi'
import { PiChatCircleTextLight } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Ajoute ta logique de déconnexion ici (ex: suppression token, redirection)
    console.log('Déconnexion')
    navigate('/login')
  }

  return (
    <div
      className={`
        fixed md:relative top-0 left-0 z-50
        h-full bg-white/70 dark:bg-gray-800/50
        backdrop-blur-md border-r border-gray-200 dark:border-gray-700 shadow-sm
        p-3 flex flex-col justify-between
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-full md:w-72' : '-translate-x-full w-full md:w-16'}
        md:translate-x-0
      `}
    >
      <div>
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-700 hover:bg-white hover:scale-110 dark:hover:bg-gray-600 shadow transition-all"
          >
            {isOpen ? <IoChevronBack size={18} /> : <IoChevronForward size={18} />}
          </button>
        </div>

        {/* New conversation */}
        {isOpen && (
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white font-medium px-4 py-2 mb-4 rounded-xl shadow-md transition-all"
          >
            <FiPlus />
            Nouvelle conversation
          </button>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-400/30 dark:scrollbar-thumb-gray-600/40">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer 
                bg-white/70 dark:bg-gray-700/60 
                hover:bg-gray-100 dark:hover:bg-gray-600 transition-all shadow-sm`}
            >
              <PiChatCircleTextLight className="text-blue-500" size={20} />
              {isOpen && (
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  Conversation {i}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Profil + Déconnexion */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 transition"
        >
          <FiUser size={16} />
          {isOpen && <span>Mon Profil</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition"
        >
          <FiLogOut size={16} />
          {isOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}
