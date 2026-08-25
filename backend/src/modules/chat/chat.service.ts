import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { ChatConversation, ChatMessage } from '../../../../shared';

export class ChatService {
  public getConversations(): ChatConversation[] {
    return db.conversations;
  }

  public getConversationById(id: string): ChatConversation | undefined {
    return db.conversations.find(c => c.id === id);
  }

  public sendMessage(conversationId: string, content: string): ChatMessage {
    const conv = db.conversations.find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const currentUser = db.employees.find(e => e.id === db.currentUserId) || db.employees[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: content.trim(),
      timestamp: timeStr,
      isOwn: true,
    };

    conv.messages.push(newMsg);
    conv.lastMessage = newMsg.content;
    conv.lastMessageTime = timeStr;

    wsGateway.broadcastChatMessage(conversationId, newMsg);
    return newMsg;
  }
}

export const chatService = new ChatService();
