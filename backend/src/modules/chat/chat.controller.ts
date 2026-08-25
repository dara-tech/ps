import { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service';
import { ApiResponse } from '../../core/utils/response.util';

export class ChatController {
  public getConversations = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = chatService.getConversations();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public getConversationById = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = chatService.getConversationById(req.params.id);
      if (!data) return res.status(404).json(ApiResponse.error('Conversation not found'));
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public sendMessage = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const data = chatService.sendMessage(conversationId, content);
      res.status(201).json(ApiResponse.success(data, 'Message sent'));
    } catch (err) {
      next(err);
    }
  };
}

export const chatController = new ChatController();
