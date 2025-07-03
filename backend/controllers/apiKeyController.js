import apiKeyService from '../services/apiKeyService.js';

class ApiKeyController {
    /**
     * Récupérer toutes les clés API (masquées)
     */
    async getAllApiKeys(req, res) {
        try {
            const apiKeys = await apiKeyService.getAllApiKeys();
            
            res.json({
                success: true,
                data: apiKeys
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des clés API:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des clés API'
            });
        }
    }

    /**
     * Sauvegarder une clé API
     */
    async saveApiKey(req, res) {
        try {
            const { provider, apiKey } = req.body;

            if (!provider || !apiKey) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider et clé API requis'
                });
            }

            if (!['openai', 'anthropic', 'mistral'].includes(provider)) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider non valide'
                });
            }

            const result = await apiKeyService.saveApiKey(provider, apiKey);

            if (result.success) {
                res.json({
                    success: true,
                    message: result.created ? 'Clé API créée avec succès' : 'Clé API mise à jour avec succès',
                    created: result.created
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la clé API:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la sauvegarde de la clé API'
            });
        }
    }

    /**
     * Supprimer une clé API
     */
    async deleteApiKey(req, res) {
        try {
            const { provider } = req.params;

            if (!['openai', 'anthropic', 'mistral'].includes(provider)) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider non valide'
                });
            }

            const result = await apiKeyService.deleteApiKey(provider);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Clé API supprimée avec succès'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Clé API non trouvée'
                });
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la clé API:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de la clé API'
            });
        }
    }

    /**
     * Activer/désactiver une clé API
     */
    async toggleApiKey(req, res) {
        try {
            const { provider } = req.params;
            const { isActive } = req.body;

            if (!['openai', 'anthropic', 'mistral'].includes(provider)) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider non valide'
                });
            }

            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    error: 'isActive doit être un booléen'
                });
            }

            const result = await apiKeyService.toggleApiKey(provider, isActive);

            if (result.success) {
                res.json({
                    success: true,
                    message: `Clé API ${isActive ? 'activée' : 'désactivée'} avec succès`
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Clé API non trouvée'
                });
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la clé API:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la modification de la clé API'
            });
        }
    }

    /**
     * Tester une clé API
     */
    async testApiKey(req, res) {
        try {
            const { provider } = req.params;

            if (!['openai', 'anthropic', 'mistral'].includes(provider)) {
                return res.status(400).json({
                    success: false,
                    error: 'Provider non valide'
                });
            }

            const apiKey = await apiKeyService.getApiKey(provider);

            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: 'Clé API non trouvée'
                });
            }

            // Ici vous pouvez ajouter une logique de test spécifique à chaque provider
            // Pour l'instant, on retourne juste que la clé existe
            res.json({
                success: true,
                message: 'Clé API trouvée et active',
                hasKey: true
            });
        } catch (error) {
            console.error('Erreur lors du test de la clé API:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du test de la clé API'
            });
        }
    }
}

export default new ApiKeyController(); 