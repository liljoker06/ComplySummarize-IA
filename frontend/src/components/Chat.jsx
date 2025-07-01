import { useState, useRef, useEffect } from 'react'
import { FiSend, FiUpload, FiPaperclip, FiX, FiAlertCircle } from 'react-icons/fi'
import { PiChatCircleTextLight } from 'react-icons/pi'
import ModelSelector from './ModelSelector'
import { IoChevronForward } from 'react-icons/io5'
import { RxDotFilled } from 'react-icons/rx'
import { useChat } from '../hooks/useChat'
import { useParams } from 'react-router-dom'
import FileIndicator from './FileIndicator'

export default function Chat({ toggleSidebar }) {
    const { chatId } = useParams()
    const [input, setInput] = useState('')
    const [files, setFiles] = useState([])
    const [selectedModel, setSelectedModel] = useState(null)
    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const messagesEndRef = useRef(null)

    const {
        currentChat,
        messages,
        isLoading,
        isTyping,
        error,
        sendMessage,
        uploadDocumentWithInstructions,
        clearError
    } = useChat(chatId)



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

    // Scroll automatique vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const removeFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    }

    const handleSend = async () => {
        if (!input.trim()) return

        // Si pas de chat actuel et des fichiers, upload avec instructions
        if (!currentChat && files.length > 0) {
            try {
                await uploadDocumentWithInstructions(
                    files[0], 
                    input.trim(), 
                    selectedModel
                )
        setInput('')
                setFiles([])
            } catch (err) {
                console.error('Erreur upload:', err)
            }
            return
        }

        // Sinon, envoyer un message normal
        if (currentChat) {
            await sendMessage(input.trim(), selectedModel)
            setInput('')
        }
    }

    const handleFiles = (e) => {
        const newFiles = [...files, ...Array.from(e.target.files)]
        setFiles(newFiles)
    }

    const handleModelChange = (modelName) => {
        setSelectedModel(modelName)
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
                        <ModelSelector onModelChange={handleModelChange} selectedModel={selectedModel} />
                    </div>
                </div>

                {/* Desktop : Select seul */}
                <div className="hidden md:block mb-4">
                    <ModelSelector onModelChange={handleModelChange} selectedModel={selectedModel} />
                </div>




                {/* Messages d'erreur */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <FiAlertCircle className="text-red-500" />
                        <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                        <button 
                            onClick={clearError}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 mt-4">
                    <div className="max-w-2xl mx-auto flex flex-col space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-400 mt-24">
                                <PiChatCircleTextLight size={48} className="mb-4 text-blue-500" />
                                <p className="text-lg font-medium">Bienvenue dans votre assistant IA</p>
                                
                                {/* Affichage du fichier associé au chat */}
                                {currentChat?.file ? (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Document analysé:</p>
                                        <FileIndicator fileName={currentChat.file.originalName} />
                                    </div>
                                ) : null}
                                
                                <p className="text-sm mt-4">
                                    {files.length > 0 
                                        ? "Ajoutez vos instructions et envoyez pour analyser le document"
                                        : currentChat?.file 
                                            ? "Posez vos questions sur ce document"
                                            : "Choisissez un modèle et posez votre première question, ou uploadez un document"
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <div
                                        key={msg.id || i}
                                        className={`w-fit max-w-full p-3 rounded-xl ${msg.type === 'user'
                                            ? 'self-end bg-blue-100 dark:bg-blue-800 text-right'
                                            : 'self-start bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    >
                                        {/* Indicateur de fichier pour le premier message utilisateur */}
                                        {msg.type === 'user' && i === 0 && currentChat?.file && (
                                            <FileIndicator 
                                                fileName={currentChat.file.originalName} 
                                                className="mb-2"
                                            />
                                        )}
                                        
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        
                                        {msg.metadata && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {msg.metadata.model && `Modèle: ${msg.metadata.model}`}
                                            </div>
                                        )}
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
                                <div ref={messagesEndRef} />
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
                                    className="relative flex items-center bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-3 py-2 pr-8 rounded-lg text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiPaperclip className="text-blue-600 dark:text-blue-400" size={14} />
                                        <div>
                                            <p className="text-blue-800 dark:text-blue-200 font-medium truncate max-w-[150px]">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Prêt à analyser
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-red-500 transition-colors"
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
                            disabled={isLoading || (!input.trim())}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                            title={
                                !currentChat && files.length > 0 
                                    ? "Analyser le document" 
                                    : "Envoyer le message"
                            }
                        >
                            <FiSend size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}
