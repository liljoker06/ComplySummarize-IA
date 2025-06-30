
import Sidebar from '../components/Sidebar'
import Chat from '../components/chat'
import { useState } from 'react'

export default function Conversation() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Chat toggleSidebar={toggleSidebar} />
    </div>
  )
}
