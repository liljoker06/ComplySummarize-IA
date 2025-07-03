import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEdit2,
  FiRefreshCw,
  FiSave,
  FiX,
} from 'react-icons/fi'
import { IoChevronBack } from 'react-icons/io5'
import { useUserProfile } from '../hooks/useUserProfile'

export default function Profile() {
  const { user, loading, error, loadUserProfile, deleteAccount, updateProfile } = useUserProfile()
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const navigate = useNavigate()

  // Initialiser le formulaire d'édition quand les données utilisateur sont chargées
  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user, isEditing])

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    setMessage(null)

    try {
      const result = await deleteAccount()
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // La déconnexion est gérée automatiquement dans le hook
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte.' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefreshProfile = async () => {
    setIsRefreshing(true)
    setMessage(null)

    try {
      await loadUserProfile()
      setMessage({ type: 'success', text: 'Profil actualisé avec succès.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'actualisation du profil.' })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Annuler l'édition - restaurer les données originales
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
    setIsEditing(!isEditing)
    setMessage(null)
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    // Validation côté client
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis.' })
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.email)) {
      setMessage({ type: 'error', text: 'Veuillez entrer un email valide.' })
      return
    }

    setIsUpdating(true)
    setMessage(null)

    try {
      const result = await updateProfile({
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim()
      })

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible'
    
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    } catch (err) {
      return 'Date invalide'
    }
  }

  // Effacer le message après 5 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/conversation')}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6"
        >
          <IoChevronBack size={20} className="mr-1" />
          Retour à la conversation
        </button>

        {/* Message de succès/erreur */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded border ${
            message.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Carte de profil */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profil Utilisateur
            </h2>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={handleRefreshProfile}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <FiRefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </button>
              )}
            </div>
          </div>

          {/* Erreur globale */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Chargement du profil...</span>
            </div>
          )}

          {/* Données utilisateur */}
          {user && !loading && (
            <div className="space-y-4">
              {/* Mode édition */}
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  {/* Boutons d'action pour l'édition */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiSave size={16} />
                      {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiX size={16} />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode affichage */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-gray-500 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMail className="text-gray-500 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiClock className="text-gray-500 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</p>
                      <p className="font-medium">{formatDate(user.lastLoginAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiClock className="text-gray-500 dark:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
                      <p className="font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {user.isActive ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Statut du compte</p>
                      <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                  </div>

                  {/* Rôle utilisateur */}
                  {user.role && (
                    <div className="flex items-center gap-3">
                      <FiUser className="text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
                        <p className="font-medium capitalize">{user.role}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FiEdit2 size={16} />
                      Modifier mon profil
                    </button>

                    {/* Supprimer le compte */}
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm"
                    >
                      <FiTrash2 size={16} />
                      {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aucune donnée et pas de chargement */}
          {!user && !loading && !error && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune donnée de profil disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
