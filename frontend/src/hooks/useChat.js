import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useChat = (initialChatId = null) => {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);

    const loadChats = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getUserChats();
            setChats(response.chats || []);
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement des chats:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadChat = useCallback(async (chatId) => {
        if (!chatId) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await apiService.getChatWithMessages(chatId);
            setCurrentChat(response.chat);
            setMessages(response.messages || []);
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement du chat:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createChat = useCallback(async (fileId, title) => {
        try {
            setIsLoading(true);
            const response = await apiService.createChat(fileId, title);
            const newChat = response.chat;
            
            setChats(prev => [newChat, ...prev]);
            setCurrentChat(newChat);
            setMessages([]);
            
            return newChat;
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la création du chat:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (content, modelName = null) => {
        if (!currentChat || !content.trim()) return;

        const tempUserMessage = {
            id: Date.now(),
            content: content.trim(),
            type: 'user',
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, tempUserMessage]);
        setIsTyping(true);
        setError(null);

        try {
            const response = await apiService.sendMessage(
                currentChat.id, 
                content.trim(), 
                modelName
            );

            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== tempUserMessage.id);
                return [
                    ...filtered,
                    response.userMessage,
                    response.assistantMessage
                ];
            });

            setChats(prev => prev.map(chat => 
                chat.id === currentChat.id 
                    ? { ...chat, ...response.chat }
                    : chat
            ));

        } catch (err) {
            setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
            setError(err.message);
            console.error('Erreur lors de l\'envoi du message:', err);
        } finally {
            setIsTyping(false);
        }
    }, [currentChat]);

    const uploadDocumentWithInstructions = useCallback(async (file, instructions, modelName = null) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiService.uploadDocumentWithInstructions(
                file, 
                instructions, 
                modelName
            );

            await loadChats();
            await loadChat(response.chatId);
            
            return response;
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de l\'upload:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [loadChats, loadChat]);

    const deleteChat = useCallback(async (chatId) => {
        try {
            await apiService.deleteChat(chatId);
            setChats(prev => prev.filter(chat => chat.id !== chatId));
            
            if (currentChat && currentChat.id === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la suppression du chat:', err);
        }
    }, [currentChat]);

    const archiveChat = useCallback(async (chatId) => {
        try {
            await apiService.archiveChat(chatId);
            setChats(prev => prev.filter(chat => chat.id !== chatId));
            
            if (currentChat && currentChat.id === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de l\'archivage du chat:', err);
        }
    }, [currentChat]);

    const selectChat = useCallback((chat) => {
        if (chat && chat.id !== currentChat?.id) {
            loadChat(chat.id);
        }
    }, [currentChat, loadChat]);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        if (initialChatId) {
            loadChat(initialChatId);
        }
    }, [initialChatId, loadChat]);

    return {
        chats,
        currentChat,
        messages,
        isLoading,
        isTyping,
        error,
        
        loadChats,
        loadChat,
        createChat,
        sendMessage,
        uploadDocumentWithInstructions,
        deleteChat,
        archiveChat,
        selectChat,
        
        clearError: () => setError(null),
    };
}; 