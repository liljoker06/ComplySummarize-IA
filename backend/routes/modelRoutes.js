import express from 'express';
import modelController from '../controllers/modelController.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', modelController.getAvailableModels);
router.get('/check/:modelName', modelController.checkModel);
router.get('/default', modelController.getDefaultModel);
router.post('/default', modelController.setDefaultModel);

export default router; 