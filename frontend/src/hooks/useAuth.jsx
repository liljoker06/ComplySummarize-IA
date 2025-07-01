import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import authService from '../services/authService.js'

// Contexte d'authentification
const AuthContext = createContext()

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider')
    }
    return context
}

// Provider d'authentification
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Initialiser l'état d'authentification
    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true)
            
            if (authService.isAuthenticated()) {
                const userData = authService.getCurrentUser()
                
                // Vérifier la validité du token
                const isValid = await authService.validateToken()
                
                if (isValid && userData) {
                    setUser(userData)
                    setIsAuthenticated(true)
                } else {
                    // Token invalide, déconnecter
                    authService.logout()
                    setUser(null)
                    setIsAuthenticated(false)
                }
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error('Erreur d\'initialisation de l\'authentification:', error)
            setError(error.message)
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Connexion
    const login = useCallback(async (email, password) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const result = await authService.login(email, password)
            
            if (result.success) {
                setUser(result.user)
                setIsAuthenticated(true)
                return { success: true }
            } else {
                setError(result.error)
                return { success: false, error: result.error }
            }
        } catch (error) {
            const errorMessage = error.message || 'Erreur de connexion'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Inscription
    const register = useCallback(async (userData) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const result = await authService.register(userData)
            
            if (result.success) {
                setUser(result.user)
                setIsAuthenticated(true)
                return { success: true }
            } else {
                setError(result.error)
                return { success: false, error: result.error }
            }
        } catch (error) {
            const errorMessage = error.message || 'Erreur d\'inscription'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Déconnexion
    const logout = useCallback(() => {
        authService.logout()
        setUser(null)
        setIsAuthenticated(false)
        setError(null)
    }, [])

    // Mettre à jour les données utilisateur
    const updateUser = useCallback((newUserData) => {
        const updatedUser = { ...user, ...newUserData }
        setUser(updatedUser)
        authService.updateUserData(updatedUser)
    }, [user])

    // Effacer les erreurs
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // Initialiser au montage
    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    // Vérifier périodiquement la validité du token
    useEffect(() => {
        if (!isAuthenticated) return

        const checkTokenValidity = async () => {
            try {
                const isValid = await authService.validateToken()
                if (!isValid) {
                    logout()
                }
            } catch (error) {
                console.error('Erreur de vérification du token:', error)
                logout()
            }
        }

        // Vérifier toutes les 30 minutes
        const interval = setInterval(checkTokenValidity, 30 * 60 * 1000)
        
        return () => clearInterval(interval)
    }, [isAuthenticated, logout])

    const value = {
        // État
        user,
        isAuthenticated,
        isLoading,
        error,
        
        // Actions
        login,
        register,
        logout,
        updateUser,
        clearError,
        
        // Utilitaires
        initializeAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook simple pour l'authentification (sans provider)
export const useAuthState = () => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = () => {
            if (authService.isAuthenticated()) {
                const userData = authService.getCurrentUser()
                setUser(userData)
                setIsAuthenticated(true)
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    return { user, isAuthenticated, isLoading }
} 