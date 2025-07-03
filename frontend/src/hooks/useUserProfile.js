import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from './useAuth';

export const useUserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { logout } = useAuth();

    // Charger le profil utilisateur
    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await apiService.getUserProfile();
            setUser(userData);
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement du profil:', err);
            
            // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
            if (err.message.includes('401') || err.message.includes('Token')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    // Supprimer le compte utilisateur
    const deleteAccount = async () => {
        try {
            setError(null);
            // TODO: Implémenter la suppression du compte dans l'API
            // const response = await apiService.deleteAccount();
            
            // Pour l'instant, on simule la suppression
            console.log('Suppression du compte...');
            logout(); // Déconnecter après suppression
            
            return { success: true, message: 'Compte supprimé avec succès' };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Mettre à jour le profil utilisateur
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await apiService.updateProfile(profileData);
            
            if (response.success) {
                setUser(response.user); // Mettre à jour les données utilisateur
                return { success: true, message: response.message };
            } else {
                throw new Error(response.error || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Charger le profil au montage du composant
    useEffect(() => {
        loadUserProfile();
    }, []);

    return {
        user,
        loading,
        error,
        loadUserProfile,
        deleteAccount,
        updateProfile,
    };
}; 