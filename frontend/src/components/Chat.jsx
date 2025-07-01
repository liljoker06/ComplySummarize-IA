import { useState, useRef } from 'react'
import { FiSend, FiUpload, FiPaperclip, FiX } from 'react-icons/fi'
import { PiChatCircleTextLight } from 'react-icons/pi'
import { useEffect } from 'react'
import ModelSelector from './ModelSelector'
import { IoChevronForward } from 'react-icons/io5'
import { RxDotFilled } from 'react-icons/rx'




export default function Chat({ toggleSidebar }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isTyping, setIsTyping] = useState(false)



    useEffect(() => {
        const handleDragEnter = (e) => {
            e.preventDefault()
            setIsDragging(true)
        }

        const handleDragLeave = (e) => {
            if (e.relatedTarget === null) setIsDragging(false)
        }

        const handleDragOver = (e) => {
            e.preventDefault()
        }

        const handleDrop = (e) => {
            e.preventDefault()
            const newFiles = [...files, ...Array.from(e.dataTransfer.files)]
            setFiles(newFiles)
            setIsDragging(false)
        }

        document.addEventListener('dragenter', handleDragEnter)
        document.addEventListener('dragleave', handleDragLeave)
        document.addEventListener('dragover', handleDragOver)
        document.addEventListener('drop', handleDrop)

        return () => {
            document.removeEventListener('dragenter', handleDragEnter)
            document.removeEventListener('dragleave', handleDragLeave)
            document.removeEventListener('dragover', handleDragOver)
            document.removeEventListener('drop', handleDrop)
        }
    }, [files])

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    }





    const handleSend = () => {
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        // Simuler réponse IA
        setTimeout(() => {
            const assistantMessage = {
                role: 'assistant',
                content: `"${userMessage.content}"`
            }
            setMessages(prev => [...prev, assistantMessage])
            setIsTyping(false)
        }, 1000)
    }


    const handleFiles = (e) => {
        const newFiles = [...files, ...Array.from(e.target.files)]
        setFiles(newFiles)
    }

    return (
        <>
            {isDragging && (
                <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center text-white text-center p-4 pointer-events-none">
                    <div className="text-2xl font-semibold mb-2"><FiPaperclip size={14} /> Ajouter un document</div>
                    <div className="text-sm opacity-80">Déposez-le ici pour l'envoyer</div>
                </div>
            )}

            <div className="flex-1 flex flex-col px-6 py-4 ">

                {/* Bouton pour ouvrir la sidebar (visible en mobile uniquement) */}
                {/* Chevron + Sélecteur dans la même ligne */}
                <div className="md:hidden mb-4 flex items-center gap-2">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 shadow"
                    >
                        <IoChevronForward size={20} />
                    </button>
                    <div className="flex-1">
                        <ModelSelector />
                    </div>
                </div>

                {/* Desktop : Select seul */}
                <div className="hidden md:block mb-4">
                    <ModelSelector />
                </div>




                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 mt-4">
                    <div className="max-w-2xl mx-auto flex flex-col space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-400 mt-24">
                                <PiChatCircleTextLight size={48} className="mb-4 text-blue-500" />
                                <p className="text-lg font-medium">Bienvenue dans votre assistant IA</p>
                                <p className="text-sm mt-2">Choisissez un modèle et posez votre première question.</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`w-fit max-w-full p-3 rounded-xl ${msg.role === 'user'
                                            ? 'self-end bg-blue-100 dark:bg-blue-800 text-right'
                                            : 'self-start bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                ))}

                                {/* Typing animation */}
                                {isTyping && (
                                    <div className="self-start bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-2 rounded-xl w-fit flex items-center gap-1">
                                        <span className="flex gap-1 ml-1">
                                            <span className="animate-bounce [animation-delay:0ms]"><RxDotFilled size={10} /></span>
                                            <span className="animate-bounce [animation-delay:150ms]"><RxDotFilled size={10} /></span>
                                            <span className="animate-bounce [animation-delay:300ms]"><RxDotFilled size={10} /></span>
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>


                {/* Drop zone + preview */}
                {files.length > 0 && (
                    <div className="mt-4 flex justify-center">
                        <div className="flex flex-wrap gap-2 max-w-2xl w-full justify-center">
                            {files.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 pr-8 rounded-full text-sm text-gray-700 dark:text-white gap-1"
                                >
                                    <FiPaperclip size={14} />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                                        title="Supprimer ce fichier"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {/* Zone de saisie */}
                <div className="mt-4 flex justify-center">
                    <div
                        className="w-full max-w-2xl border rounded-xl p-2 flex items-center gap-2 dark:border-gray-600 bg-white dark:bg-gray-800"
                        onDrop={(e) => {
                            e.preventDefault()
                            const newFiles = [...files, ...Array.from(e.dataTransfer.files)]
                            setFiles(newFiles)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {/* Upload */}
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
                            title="Ajouter un fichier"
                        >
                            <FiUpload size={18} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={handleFiles}
                        />

                        {/* Texte */}
                        <textarea
                            rows={1}
                            className="flex-1 resize-none bg-transparent outline-none text-sm px-2 text-gray-800 dark:text-white"
                            placeholder="Posez votre question ici..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        />

                        {/* Envoyer */}
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                            title="Envoyer"
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}
