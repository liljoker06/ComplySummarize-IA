import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { FiPlus, FiTrash2, FiArchive, FiLoader, FiPaperclip, FiLogOut, FiUser } from 'react-icons/fi'
import { PiChatCircleTextLight } from 'react-icons/pi'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import FileIndicator from './FileIndicator'

export default function Sidebar({ isOpen, toggleSidebar, chatHook }) {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { user, logout } = useAuth()
  const { chats, isLoading, deleteChat, archiveChat, selectChat } = chatHook

  const handleNewConversation = () => {
    // Réinitialiser l'état du chat actuel
    selectChat(null)
    navigate('/conversation')
  }

  const handleChatSelect = (chat) => {
    navigate(`/conversation/${chat.id}`)
    selectChat(chat)
    if (window.innerWidth < 768) {
      toggleSidebar()
    }
  }

  const handleDeleteChat = async (e, chatIdToDelete) => {
    e.stopPropagation()
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      await deleteChat(chatIdToDelete)
      if (chatId === chatIdToDelete.toString()) {
        navigate('/conversation')
      }
    }
  }

  const handleLogout = () => {
      logout()
      navigate('/login')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now - date) / 36e5

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
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
      <div className="flex-1 flex flex-col">
        {/* Header avec utilisateur et toggle */}
        <div className="flex justify-between items-center mb-4">
          {isOpen && user && (
            <div className="flex items-center gap-2 text-sm">
              <FiUser className="text-gray-500 dark:text-gray-400" size={16} />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          
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
            onClick={handleNewConversation}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white font-medium px-4 py-2 mb-4 rounded-xl shadow-md transition-all"
          >
            <FiPlus />
            Nouvelle conversation
          </button>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-400/30 dark:scrollbar-thumb-gray-600/40">
          {isLoading && chats.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="animate-spin text-gray-400" size={24} />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {isOpen ? (
                <div>
                  <PiChatCircleTextLight size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune conversation</p>
                  <p className="text-xs mt-1">Uploadez un document pour commencer</p>
                </div>
              ) : (
                <PiChatCircleTextLight size={24} className="opacity-50" />
              )}
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer 
                  ${chatId === chat.id.toString() 
                    ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700' 
                    : 'bg-white/70 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-600'
                  } transition-all shadow-sm`}
              >
                <PiChatCircleTextLight 
                  className={chatId === chat.id.toString() ? 'text-blue-600' : 'text-blue-500'} 
                  size={20} 
                />
                {isOpen && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {chat.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatDate(chat.lastMessageAt || chat.createdAt)}
                        </span>
                      </div>
                      {chat.file && (
                        <div className="mt-1">
                          <FileIndicator 
                            fileName={chat.file.originalName} 
                            isCompact={true}
                          />
                        </div>
                      )}
                      {chat.messageCount > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {chat.messageCount} message{chat.messageCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Supprimer"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer: Profil + Déconnexion */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition px-2 py-1 rounded"
            >
              <FiUser size={16} />
              <span>Mon Profil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition px-2 py-1 rounded"
            >
              <FiLogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
