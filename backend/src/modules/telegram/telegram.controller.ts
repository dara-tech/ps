import { Request, Response, NextFunction } from 'express';
import { telegramService } from './telegram.service';
import { ApiResponse } from '../../core/utils/response.util';

export class TelegramController {
  public getStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = telegramService.getStatus();
      res.json(ApiResponse.success(status));
    } catch (err) {
      next(err);
    }
  };

  public sendCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json(ApiResponse.error('Phone number is required'));
      }
      const data = await telegramService.sendCode(phone);
      res.json(ApiResponse.success(data, 'Verification code sent'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to send code'));
    }
  };

  public signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, phoneNumber, phoneCodeHash, code, password } = req.body;
      const targetPhone = phoneNumber || phone;
      if (!targetPhone || !phoneCodeHash || !code) {
        return res.status(400).json(ApiResponse.error('Phone, code hash, and verification code are required'));
      }
      const data = await telegramService.signIn({ phoneNumber: targetPhone, phoneCodeHash, code, password });
      res.json(ApiResponse.success(data, 'Telegram connected successfully'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to sign in to Telegram'));
    }
  };

  public getDialogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 40;
      const offsetDate = req.query.offsetDate ? parseInt(req.query.offsetDate as string, 10) : undefined;
      const offsetId = req.query.offsetId ? parseInt(req.query.offsetId as string, 10) : undefined;
      const dialogs = await telegramService.getDialogs(limit, offsetDate, offsetId);
      res.json(ApiResponse.success(dialogs));
    } catch (err) {
      next(err);
    }
  };

  public getContacts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const contacts = await telegramService.getContacts();
      res.json(ApiResponse.success(contacts));
    } catch (err) {
      next(err);
    }
  };

  public addContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, firstName, lastName } = req.body;
      if (!phone || !firstName) {
        return res.status(400).json(ApiResponse.error('Phone and first name are required'));
      }
      const success = await telegramService.addContact(phone, firstName, lastName);
      res.json(ApiResponse.success({ success }));
    } catch (err) {
      next(err);
    }
  };

  public getChatFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const full = await telegramService.getChatFull(chatId);
      res.json(ApiResponse.success(full));
    } catch (err) {
      next(err);
    }
  };

  public getParticipants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const participants = await telegramService.getParticipants(chatId, limit);
      res.json(ApiResponse.success(participants));
    } catch (err) {
      next(err);
    }
  };

  public getSharedMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const type = (req.query.type as 'photo' | 'document' | 'voice' | 'url') || 'photo';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const media = await telegramService.getSharedMedia(chatId, type, limit);
      res.json(ApiResponse.success(media));
    } catch (err) {
      next(err);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offsetId = req.query.offsetId ? parseInt(req.query.offsetId as string, 10) : undefined;
      const messages = await telegramService.getMessages(chatId, limit, offsetId);
      res.json(ApiResponse.success(messages));
    } catch (err) {
      next(err);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const { maxId } = req.body;
      const success = await telegramService.markAsRead(chatId, maxId);
      res.json(ApiResponse.success({ success }));
    } catch (err) {
      next(err);
    }
  };

  public getMessageReadParticipants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId } = req.params;
      const participants = await telegramService.getMessageReadParticipants(chatId, Number(messageId));
      res.json(ApiResponse.success(participants));
    } catch (err) {
      next(err);
    }
  };

  public getAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const buffer = await telegramService.downloadProfilePhoto(chatId);
      if (!buffer || buffer.length === 0) {
        return res.status(404).send('No avatar');
      }
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  public getMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId } = req.params;
      const thumb = req.query.thumb ? true : undefined;
      const media = await telegramService.downloadMessageMedia(chatId, parseInt(messageId, 10), thumb);
      if (!media || !media.buffer) {
        return res.status(404).send('Media not found');
      }
      res.setHeader('Content-Type', media.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(media.buffer);
    } catch (err) {
      next(err);
    }
  };

  public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, text, replyToMsgId } = req.body;
      if (!chatId || !text) {
        return res.status(400).json(ApiResponse.error('chatId and text are required'));
      }
      const msg = await telegramService.sendMessage(chatId, text, replyToMsgId ? Number(replyToMsgId) : undefined);
      res.json(ApiResponse.success(msg, 'Message sent'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to send message'));
    }
  };

  public editMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId, text } = req.body;
      if (!chatId || messageId === undefined || !text) {
        return res.status(400).json(ApiResponse.error('chatId, messageId and text are required'));
      }
      const ok = await telegramService.editMessage(chatId, Number(messageId), text);
      res.json(ApiResponse.success({ ok }, 'Message edited'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to edit message'));
    }
  };

  public deleteMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageIds, revoke } = req.body;
      if (!chatId || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json(ApiResponse.error('chatId and messageIds are required'));
      }
      const ok = await telegramService.deleteMessages(chatId, messageIds, revoke !== false);
      res.json(ApiResponse.success({ ok }, 'Messages deleted'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to delete messages'));
    }
  };

  public forwardMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fromChatId, toChatId, messageIds, dropAuthor } = req.body;
      if (!fromChatId || !toChatId || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json(ApiResponse.error('fromChatId, toChatId, and messageIds array are required'));
      }
      const messages = await telegramService.forwardMessages({
        fromChatId,
        toChatId,
        messageIds,
        dropAuthor: Boolean(dropAuthor),
      });
      res.json(ApiResponse.success(messages, 'Messages forwarded successfully'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to forward messages'));
    }
  };

  public pinMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId, silent } = req.body;
      if (!chatId || messageId === undefined) {
        return res.status(400).json(ApiResponse.error('chatId and messageId are required'));
      }
      const ok = await telegramService.pinMessage(chatId, Number(messageId), silent !== false);
      res.json(ApiResponse.success({ ok }, 'Message pinned'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to pin message'));
    }
  };

  public unpinMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId } = req.body;
      if (!chatId) {
        return res.status(400).json(ApiResponse.error('chatId is required'));
      }
      const ok = await telegramService.unpinMessage(chatId, messageId ? Number(messageId) : undefined);
      res.json(ApiResponse.success({ ok }, 'Message unpinned'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to unpin message'));
    }
  };

  public togglePinDialog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, pinned } = req.body;
      if (!chatId) {
        return res.status(400).json(ApiResponse.error('chatId is required'));
      }
      const ok = await telegramService.togglePinDialog(chatId, pinned !== false);
      res.json(ApiResponse.success({ ok }, pinned !== false ? 'Chat pinned' : 'Chat unpinned'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to pin chat'));
    }
  };

  public setTyping = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.body;
      if (!chatId) {
        return res.status(400).json(ApiResponse.error('chatId is required'));
      }
      const ok = await telegramService.setTyping(chatId);
      res.json(ApiResponse.success({ ok }, 'Typing set'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to set typing'));
    }
  };

  public sendMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, fileBase64, fileName, caption, voiceNote, duration } = req.body;
      if (!chatId || !fileBase64 || !fileName) {
        return res.status(400).json(ApiResponse.error('chatId, fileBase64, and fileName are required'));
      }
      const msg = await telegramService.sendMedia({ chatId, fileBase64, fileName, caption, voiceNote, duration: duration ? Number(duration) : undefined });
      res.json(ApiResponse.success(msg, 'Media sent'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to send media'));
    }
  };

  public sendReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chatId, messageId, emoticon } = req.body;
      if (!chatId || messageId === undefined) {
        return res.status(400).json(ApiResponse.error('chatId and messageId are required'));
      }
      const ok = await telegramService.sendReaction(chatId, Number(messageId), emoticon || '');
      res.json(ApiResponse.success({ ok }, 'Reaction sent'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to send reaction'));
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, about, username } = req.body;
      const result = await telegramService.updateProfile(firstName, lastName, about, username);
      res.json(ApiResponse.success(result, 'Profile updated successfully'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to update profile'));
    }
  };

  public uploadProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileBase64, fileName } = req.body;
      if (!fileBase64) {
        return res.status(400).json(ApiResponse.error('fileBase64 is required'));
      }
      const result = await telegramService.uploadProfilePhoto(fileBase64, fileName);
      res.json(ApiResponse.success(result, 'Profile photo updated successfully'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to upload profile photo'));
    }
  };

  public getGhostSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = telegramService.getGhostSettings();
      res.json(ApiResponse.success(settings, 'Ghost settings retrieved'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to get ghost settings'));
    }
  };

  public updateGhostSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = telegramService.updateGhostSettings(req.body);
      res.json(ApiResponse.success(settings, 'Ghost settings updated'));
    } catch (err: any) {
      res.status(400).json(ApiResponse.error(err.message || 'Failed to update ghost settings'));
    }
  };

  public disconnect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await telegramService.disconnect();
      res.json(ApiResponse.success(null, 'Telegram disconnected'));
    } catch (err) {
      next(err);
    }
  };
}

export const telegramController = new TelegramController();
