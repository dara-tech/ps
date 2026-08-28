const API_ROOT = 'http://localhost:4000/api/v1/telegram';

export interface TelegramDialog {
  id: string;
  name: string;
  isUser: boolean;
  isGroup: boolean;
  isChannel: boolean;
  isBot?: boolean;
  unreadCount: number;
  lastMessage?: string;
  lastMessageDate?: string;
  lastMessageTimestamp?: number;
  lastMessageRawId?: number;
  lastMediaType?: 'photo' | 'document' | 'voice' | 'audio' | 'video' | 'sticker' | 'contact' | 'location';
  lastMediaThumbUrl?: string;
  avatarUrl?: string;
  username?: string;
  participantsCount?: number;
  isMuted?: boolean;
  isOnline?: boolean;
  userStatus?: string;
  isPinned?: boolean;
  isOut?: boolean;
  isSeen?: boolean;
  isVerified?: boolean;
}

export interface TelegramContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  username?: string;
  isOnline?: boolean;
  userStatus?: string;
  avatarUrl?: string;
}

export interface TelegramMessage {
  id: number;
  chatId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  date: string;
  isOut: boolean;
  isSeen?: boolean;
  mediaType?: 'photo' | 'document' | 'voice' | 'audio' | 'video' | 'sticker';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
  reactions?: Array<{ emoticon: string; count: number; isChosen?: boolean }>;
  replyToMsgId?: number;
  replyToMsg?: {
    id: number;
    senderName?: string;
    text?: string;
  };
  fwdFrom?: {
    senderName?: string;
    senderId?: string;
    date?: string;
  };
  isPinned?: boolean;
  isEdited?: boolean;
  rawDate?: number;
  chatTitle?: string;
  chatAvatar?: string;
  isGroup?: boolean;
  isChannel?: boolean;
  isUser?: boolean;
  views?: number;
  forwards?: number;
}

export interface TelegramStatus {
  isConnected: boolean;
  isConnecting: boolean;
  user: {
    id?: string;
    firstName?: string;
    username?: string;
    phone?: string;
  } | null;
}

export const telegramApi = {
  getStatus: async (): Promise<TelegramStatus> => {
    const res = await fetch(`${API_ROOT}/status`);
    const json = await res.json();
    return json.data;
  },

  sendCode: async (phone: string): Promise<{ phoneCodeHash: string; isCodeViaApp: boolean }> => {
    const res = await fetch(`${API_ROOT}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to send verification code');
    return json.data;
  },

  signIn: async (params: {
    phoneNumber?: string;
    phone?: string;
    phoneCodeHash: string;
    code: string;
    password?: string;
  }): Promise<{ user: any; sessionString: string }> => {
    const res = await fetch(`${API_ROOT}/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to sign in to Telegram');
    return json.data;
  },

  getDialogs: async (limit = 40, offsetDate?: number, offsetId?: number): Promise<TelegramDialog[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (offsetDate) params.set('offsetDate', offsetDate.toString());
    if (offsetId) params.set('offsetId', offsetId.toString());
    const res = await fetch(`${API_ROOT}/dialogs?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  getMessages: async (chatId: string, limit = 50, offsetId?: number): Promise<TelegramMessage[]> => {
    const query = offsetId ? `?limit=${limit}&offsetId=${offsetId}` : `?limit=${limit}`;
    const res = await fetch(`${API_ROOT}/messages/${encodeURIComponent(chatId)}${query}`);
    const json = await res.json();
    return json.data || [];
  },

  sendMessage: async (chatId: string, text: string, replyToMsgId?: number): Promise<TelegramMessage> => {
    const res = await fetch(`${API_ROOT}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text, replyToMsgId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to send message');
    return json.data;
  },

  editMessage: async (chatId: string, messageId: number, text: string): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/edit-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageId, text }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to edit message');
    return json.data?.ok || false;
  },

  deleteMessages: async (chatId: string, messageIds: number[], revoke = true): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/delete-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageIds, revoke }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete messages');
    return json.data?.ok || false;
  },

  pinMessage: async (chatId: string, messageId: number, silent = true): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/pin-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageId, silent }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to pin message');
    return json.data?.ok || false;
  },

  forwardMessages: async (params: {
    fromChatId: string;
    toChatId: string;
    messageIds: number[];
    dropAuthor?: boolean;
  }): Promise<TelegramMessage[]> => {
    const res = await fetch(`${API_ROOT}/forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to forward messages');
    return json.data || [];
  },

  unpinMessage: async (chatId: string, messageId?: number): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/unpin-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to unpin message');
    return json.data?.ok || false;
  },

  sendTyping: async (chatId: string): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    });
    const json = await res.json();
    return json.data?.ok || false;
  },

  sendMedia: async (params: {
    chatId: string;
    fileBase64: string;
    fileName: string;
    caption?: string;
    voiceNote?: boolean;
    duration?: number;
  }): Promise<TelegramMessage> => {
    const res = await fetch(`${API_ROOT}/send-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to send media');
    return json.data;
  },

  sendReaction: async (params: {
    chatId: string;
    messageId: number;
    emoticon: string;
  }): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json.data?.ok || false;
  },

  getContacts: async (): Promise<TelegramContact[]> => {
    const res = await fetch(`${API_ROOT}/contacts`);
    const json = await res.json();
    return json.data || [];
  },

  addContact: async (phone: string, firstName: string, lastName?: string): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, firstName, lastName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to add contact');
    return json.data?.success || false;
  },

  markAsRead: async (chatId: string, maxId?: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_ROOT}/read/${encodeURIComponent(chatId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxId }),
      });
      const json = await res.json();
      return json.data?.success || false;
    } catch {
      return false;
    }
  },

  getChatFull: async (chatId: string): Promise<{ bio?: string; participantsCount?: number; username?: string }> => {
    try {
      const res = await fetch(`${API_ROOT}/full/${encodeURIComponent(chatId)}`);
      const json = await res.json();
      return json.data || {};
    } catch {
      return {};
    }
  },

  getParticipants: async (chatId: string, limit = 100): Promise<Array<{ id: string; name: string; username?: string; isOnline?: boolean; userStatus?: string; avatarUrl?: string; role?: 'owner' | 'admin' | 'member' }>> => {
    try {
      const res = await fetch(`${API_ROOT}/participants/${encodeURIComponent(chatId)}?limit=${limit}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  getSharedMedia: async (chatId: string, type: 'photo' | 'video' | 'media' | 'document' | 'voice' | 'url', limit = 100): Promise<TelegramMessage[]> => {
    try {
      const res = await fetch(`${API_ROOT}/shared-media/${encodeURIComponent(chatId)}?type=${type}&limit=${limit}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; about?: string; username?: string }): Promise<{ success: boolean; user?: any }> => {
    const res = await fetch(`${API_ROOT}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update profile');
    return json.data;
  },

  uploadProfilePhoto: async (fileBase64: string, fileName?: string): Promise<{ success: boolean; avatarUrl?: string }> => {
    const res = await fetch(`${API_ROOT}/profile-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64, fileName: fileName || 'profile.jpg' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to upload profile photo');
    return json.data;
  },

  togglePinDialog: async (chatId: string, pinned = true): Promise<boolean> => {
    const res = await fetch(`${API_ROOT}/pin-dialog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, pinned }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to toggle pin dialog');
    return true;
  },

  getMessageReadParticipants: async (chatId: string, messageId: number): Promise<Array<{ id: string; name: string; avatarUrl?: string; date?: string }>> => {
    try {
      const res = await fetch(`${API_ROOT}/read-participants/${encodeURIComponent(chatId)}/${messageId}`);
      const json = await res.json();
      if (!res.ok) return [];
      return json.data || [];
    } catch {
      return [];
    }
  },

  getGhostSettings: async (): Promise<TelegramGhostSettings> => {
    const res = await fetch(`${API_ROOT}/ghost-settings`);
    const json = await res.json();
    return json.data;
  },

  updateGhostSettings: async (settings: Partial<TelegramGhostSettings>): Promise<TelegramGhostSettings> => {
    const res = await fetch(`${API_ROOT}/ghost-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update ghost settings');
    return json.data;
  },

  disconnect: async (): Promise<void> => {
    await fetch(`${API_ROOT}/disconnect`, { method: 'POST' });
  },
};

export interface TelegramGhostSettings {
  enabled: boolean;
  noReadReceipts: boolean;
  hideOnline: boolean;
  hideTyping: boolean;
  antiDelete: boolean;
  stealthStories: boolean;
}
