import express from 'express';
import { authMiddleware } from '../middlewares/index.js';
import { skeletonController } from '../controllers/index.js';

const router = express.Router();

router.post('/', authMiddleware, skeletonController.createSkeleton);
router.get('/', authMiddleware, skeletonController.getAllSkeletons);
router.get('/:id', authMiddleware, skeletonController.getSkeletonById);
router.patch('/:id', authMiddleware, skeletonController.updateSkeleton);
router.delete('/:id', authMiddleware, skeletonController.deleteSkeleton);

export default router;