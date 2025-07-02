import Cookies from 'js-cookie'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthToken() {
        return Cookies.get('authToken');
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.includeAuth !== false),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            includeAuth: false,
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            includeAuth: false,
        });
    }

    async getAvailableModels() {
        return this.request('/models');
    }

    async syncModels() {
        return this.request('/models/sync', {
            method: 'POST',
        });
    }

    async getDefaultModel() {
        return this.request('/models/default');
    }

    async setDefaultModel(modelName) {
        return this.request('/models/default', {
            method: 'POST',
            body: JSON.stringify({ modelName }),
        });
    }

    async checkModel(modelName) {
        return this.request(`/models/check/${encodeURIComponent(modelName)}`);
    }

    async toggleModelStatus(modelId, isActive) {
        return this.request(`/models/${modelId}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        });
    }

    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/files/upload', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${this.getAuthToken()}`,
                // Ne pas définir Content-Type pour FormData
            },
        });
    }

    async uploadDocumentWithInstructions(file, instructions, modelName = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('instructions', instructions);
        if (modelName) {
            formData.append('model', modelName);
        }

        return this.request('/files/upload-with-instructions', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${this.getAuthToken()}`,
            },
        });
    }

    async createChat(fileId, title) {
        return this.request('/chats', {
            method: 'POST',
            body: JSON.stringify({ fileId, title }),
        });
    }

    async getUserChats() {
        return this.request('/chats');
    }

    async getChatWithMessages(chatId) {
        return this.request(`/chats/${chatId}`);
    }

    async sendMessage(chatId, content, modelName = null) {
        return this.request(`/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, modelName }),
        });
    }

    async deleteChat(chatId) {
        return this.request(`/chats/${chatId}`, {
            method: 'DELETE',
        });
    }

    async archiveChat(chatId) {
        return this.request(`/chats/${chatId}/archive`, {
            method: 'PATCH',
        });
    }

    async validateToken() {
        return this.request('/auth/validate');
    }

    async refreshToken() {
        return this.request('/auth/refresh', {
            method: 'POST',
        });
    }
}

export default new ApiService(); 