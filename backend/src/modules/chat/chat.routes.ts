import { Router } from 'express';
import { chatController } from './chat.controller';

const router = Router();

router.get('/', chatController.getConversations);
router.get('/:id', chatController.getConversationById);
router.post('/:conversationId/messages', chatController.sendMessage);

export const chatRoutes = router;
