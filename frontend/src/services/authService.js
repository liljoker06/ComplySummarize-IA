import Cookies from 'js-cookie'
import apiService from './api.js'

class AuthService {
    constructor() {
        this.TOKEN_KEY = 'authToken'
        this.USER_KEY = 'userData'
        this.TOKEN_EXPIRY = 7 // 7 jours
    }

    // Sauvegarder le token et les données utilisateur
    saveAuthData(token, userData) {
        Cookies.set(this.TOKEN_KEY, token, { 
            expires: this.TOKEN_EXPIRY,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax'
        })
        
        Cookies.set(this.USER_KEY, JSON.stringify(userData), { 
            expires: this.TOKEN_EXPIRY,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax'
        })
    }

    // Récupérer le token
    getToken() {
        return Cookies.get(this.TOKEN_KEY)
    }

    // Récupérer les données utilisateur
    getUserData() {
        const userData = Cookies.get(this.USER_KEY)
        return userData ? JSON.parse(userData) : null
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        return !!this.getToken()
    }

    // Connexion
    async login(email, password) {
        try {
            const response = await apiService.login(email, password)
            
            if (response.token && response.user) {
                this.saveAuthData(response.token, response.user)
                return { success: true, user: response.user }
            } else {
                throw new Error('Réponse invalide du serveur')
            }
        } catch (error) {
            console.error('Erreur de connexion:', error)
            return { 
                success: false, 
                error: error.message || 'Erreur de connexion' 
            }
        }
    }

    // Inscription
    async register(userData) {
        try {
            const response = await apiService.register(userData)
            
            if (response.token && response.user) {
                this.saveAuthData(response.token, response.user)
                return { success: true, user: response.user }
            } else {
                throw new Error('Réponse invalide du serveur')
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error)
            return { 
                success: false, 
                error: error.message || 'Erreur d\'inscription' 
            }
        }
    }

    // Déconnexion
    logout() {
        Cookies.remove(this.TOKEN_KEY)
        Cookies.remove(this.USER_KEY)
        
        // Rediriger vers la page de connexion
        window.location.href = '/login'
    }

    // Vérifier la validité du token
    async validateToken() {
        const token = this.getToken()
        if (!token) return false

        try {
            // Faire une requête pour vérifier si le token est valide
            const response = await apiService.validateToken()
            return response.valid === true
        } catch (error) {
            console.error('Token invalide:', error)
            this.logout()
            return false
        }
    }

    // Rafraîchir le token si nécessaire
    async refreshTokenIfNeeded() {
        if (!this.isAuthenticated()) return false

        try {
            const response = await apiService.refreshToken()
            if (response.token) {
                const userData = this.getUserData()
                this.saveAuthData(response.token, userData)
                return true
            }
        } catch (error) {
            console.error('Erreur de rafraîchissement du token:', error)
            this.logout()
            return false
        }
    }

    // Obtenir les informations de l'utilisateur connecté
    getCurrentUser() {
        return this.getUserData()
    }

    // Mettre à jour les données utilisateur
    updateUserData(newUserData) {
        const currentData = this.getUserData()
        if (currentData) {
            const updatedData = { ...currentData, ...newUserData }
            const token = this.getToken()
            this.saveAuthData(token, updatedData)
        }
    }
}

export default new AuthService() 