import express from 'express';
import apiKeyController from '../controllers/apiKeyController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/api-keys - Récupérer toutes les clés API
router.get('/', apiKeyController.getAllApiKeys);

// POST /api/api-keys - Sauvegarder une clé API
router.post('/', apiKeyController.saveApiKey);

// DELETE /api/api-keys/:provider - Supprimer une clé API
router.delete('/:provider', apiKeyController.deleteApiKey);

// PATCH /api/api-keys/:provider/toggle - Activer/désactiver une clé API
router.patch('/:provider/toggle', apiKeyController.toggleApiKey);

// GET /api/api-keys/:provider/test - Tester une clé API
router.get('/:provider/test', apiKeyController.testApiKey);

export default router; 