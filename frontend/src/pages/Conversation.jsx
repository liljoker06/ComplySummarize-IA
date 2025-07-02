import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { useChat } from '../hooks/useChat'

export default function Conversation() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { chatId } = useParams()
  
  // Utiliser le hook useChat au niveau du composant parent
  const chatHook = useChat(chatId)

  // Fermer la sidebar par défaut en mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setSidebarOpen(!isMobile)
  }, [])

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  return (
    <div className="relative h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex h-full">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          chatHook={chatHook}
        />
        <Chat 
          toggleSidebar={toggleSidebar} 
          chatHook={chatHook}
        />
      </div>
    </div>
  )
}
