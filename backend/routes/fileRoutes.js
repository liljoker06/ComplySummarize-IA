import { Router } from 'express';
import { fileController } from '../controllers/index.js';
import authMiddleware from '../middlewares/auth.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Générer un nom unique avec l'extension originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.post('/upload', authMiddleware, upload.single("file"), async (req, res) => {
  await fileController.uploadDocument(req, res);
});

router.post('/upload-with-instructions', authMiddleware, upload.single("file"), async (req, res) => {
  await fileController.uploadDocumentWithInstructions(req, res);
});

router.post('/upload-with-instructions/:chatId', authMiddleware, async (req, res) => {
  await fileController.uploadDocumentWithInstructions(req, res);
});

export default router;