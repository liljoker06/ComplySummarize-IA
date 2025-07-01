import { Router } from 'express';
import { authController } from '../controllers/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/validate", authMiddleware, authController.validateToken);
router.post("/refresh", authMiddleware, authController.refreshToken);

export default router;