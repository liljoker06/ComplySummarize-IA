import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/chat'

export default function Conversation() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <Chat toggleSidebar={toggleSidebar} />
      </div>
    </div>
  )
}
