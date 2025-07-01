import express from 'express';
import chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', chatController.createChat);
router.get('/', chatController.getUserChats);
router.get('/:chatId', chatController.getChatWithMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.delete('/:chatId', chatController.deleteChat);
router.patch('/:chatId/archive', chatController.archiveChat);

export default router;
