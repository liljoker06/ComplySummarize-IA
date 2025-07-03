import { ApiKey } from '../models/index.js';

class ApiKeyService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Récupérer une clé API par provider
     */
    async getApiKey(provider) {
        try {
            // Vérifier le cache d'abord
            const cacheKey = `apikey_${provider}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }

            // Récupérer depuis la base de données
            const apiKeyRecord = await ApiKey.findOne({
                where: { 
                    provider: provider,
                    isActive: true
                }
            });

            if (!apiKeyRecord) {
                return null;
            }

            // Mettre en cache
            this.cache.set(cacheKey, {
                data: apiKeyRecord.apiKey,
                timestamp: Date.now()
            });

            return apiKeyRecord.apiKey;
        } catch (error) {
            console.error(`Erreur lors de la récupération de la clé API pour ${provider}:`, error);
            return null;
        }
    }

    /**
     * Sauvegarder ou mettre à jour une clé API
     */
    async saveApiKey(provider, apiKey) {
        try {
            const [record, created] = await ApiKey.upsert({
                provider: provider,
                apiKey: apiKey,
                isActive: true
            });

            // Invalider le cache
            this.cache.delete(`apikey_${provider}`);

            return {
                success: true,
                created: created,
                data: record
            };
        } catch (error) {
            console.error(`Erreur lors de la sauvegarde de la clé API pour ${provider}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Récupérer toutes les clés API (masquées pour la sécurité)
     */
    async getAllApiKeys() {
        try {
            const apiKeys = await ApiKey.findAll({
                attributes: ['id', 'provider', 'isActive', 'createdAt', 'updatedAt'],
                order: [['provider', 'ASC']]
            });

            return apiKeys.map(key => ({
                id: key.id,
                provider: key.provider,
                isActive: key.isActive,
                hasKey: true,
                createdAt: key.createdAt,
                updatedAt: key.updatedAt
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des clés API:', error);
            return [];
        }
    }

    /**
     * Supprimer une clé API
     */
    async deleteApiKey(provider) {
        try {
            const deleted = await ApiKey.destroy({
                where: { provider: provider }
            });

            // Invalider le cache
            this.cache.delete(`apikey_${provider}`);

            return {
                success: deleted > 0,
                deleted: deleted
            };
        } catch (error) {
            console.error(`Erreur lors de la suppression de la clé API pour ${provider}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Activer/désactiver une clé API
     */
    async toggleApiKey(provider, isActive) {
        try {
            const [updated] = await ApiKey.update(
                { isActive: isActive },
                { where: { provider: provider } }
            );

            // Invalider le cache
            this.cache.delete(`apikey_${provider}`);

            return {
                success: updated > 0,
                updated: updated
            };
        } catch (error) {
            console.error(`Erreur lors de la modification de la clé API pour ${provider}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Vider le cache
     */
    clearCache() {
        this.cache.clear();
    }
}

export default new ApiKeyService(); 