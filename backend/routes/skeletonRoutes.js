import express from 'express';
import { authMiddleware } from '../middlewares/index.js';
import { skeletonController } from '../controllers/index.js';

const router = express.Router();

// Create
router.post('/', authMiddleware, skeletonController.createSkeleton);

// Read all
router.get('/', authMiddleware, skeletonController.getAllSkeletons);

// Read one
router.get('/:id', authMiddleware, skeletonController.getSkeletonById);

// Update
router.patch('/:id', authMiddleware, skeletonController.updateSkeleton);

// Delete
router.delete('/:id', authMiddleware, skeletonController.deleteSkeleton);

export default router;