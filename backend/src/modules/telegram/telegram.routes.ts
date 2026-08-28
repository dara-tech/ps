import { Router } from 'express';
import { telegramController } from './telegram.controller';

const router = Router();

router.get('/status', telegramController.getStatus);
router.post('/send-code', telegramController.sendCode);
router.post('/sign-in', telegramController.signIn);
router.get('/dialogs', telegramController.getDialogs);
router.get('/contacts', telegramController.getContacts);
router.post('/contacts', telegramController.addContact);
router.get('/full/:chatId', telegramController.getChatFull);
router.get('/participants/:chatId', telegramController.getParticipants);
router.get('/shared-media/:chatId', telegramController.getSharedMedia);
router.get('/messages/:chatId', telegramController.getMessages);
router.get('/read-participants/:chatId/:messageId', telegramController.getMessageReadParticipants);
router.post('/read/:chatId', telegramController.markAsRead);
router.get('/avatar/:chatId', telegramController.getAvatar);
router.get('/media/:chatId/:messageId', telegramController.getMedia);
router.post('/send-message', telegramController.sendMessage);
router.post('/forward', telegramController.forwardMessages);
router.post('/edit-message', telegramController.editMessage);
router.post('/delete-messages', telegramController.deleteMessages);
router.post('/pin-message', telegramController.pinMessage);
router.post('/unpin-message', telegramController.unpinMessage);
router.post('/pin-dialog', telegramController.togglePinDialog);
router.post('/typing', telegramController.setTyping);
router.post('/send-media', telegramController.sendMedia);
router.post('/reaction', telegramController.sendReaction);
router.put('/profile', telegramController.updateProfile);
router.post('/profile-photo', telegramController.uploadProfilePhoto);
router.get('/ghost-settings', telegramController.getGhostSettings);
router.post('/ghost-settings', telegramController.updateGhostSettings);
router.post('/disconnect', telegramController.disconnect);

export const telegramRoutes = router;
