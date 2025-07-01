import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
} from 'react-icons/fi'
import { IoChevronBack } from 'react-icons/io5'

export default function Profile() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser({
      firstName: 'Alice',
      lastName: 'Durand',
      email: 'alice.durand@example.com',
      isActive: true,
      lastLoginAt: '2025-06-28T13:45:00Z',
    })
  }, [])

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')
    if (confirmed) {
      console.log('Compte supprimé')
      // navigate('/logout') ou autre action après suppression
    }
  }

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

        {/* Carte de profil */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profil Utilisateur</h2>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiUser className="text-gray-500 dark:text-gray-300" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
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
                  <p className="font-medium">
                    {new Date(user.lastLoginAt).toLocaleString('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
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

              {/* Supprimer le compte */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                >
                  <FiTrash2 size={16} />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Chargement du profil...</p>
          )}
        </div>
      </div>
    </div>
  )
}
