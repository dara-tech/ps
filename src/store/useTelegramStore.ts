import { create } from 'zustand';
import { telegramApi, TelegramDialog, TelegramMessage, TelegramStatus, TelegramContact } from '../services/telegramApi';
import { toast } from './useToastStore';

export type TelegramFolderFilter = 'all' | 'direct' | 'groups' | 'channels' | 'bots' | 'unread';
export type TelegramSidebarTab = 'chats' | 'contacts' | 'settings';

interface TelegramState {
  isConnected: boolean;
  isConnecting: boolean;
  user: TelegramStatus['user'];
  dialogs: TelegramDialog[];
  contacts: TelegramContact[];
  activeChatId: string | null;
  messages: TelegramMessage[];
  messagesCache: Record<string, TelegramMessage[]>;
  loadingDialogs: boolean;
  loadingMoreDialogs: boolean;
  hasMoreDialogs: boolean;
  loadingContacts: boolean;
  loadingMessages: boolean;
  loadingMoreMessages: boolean;
  hasMoreMessages: boolean;
  sendingMessage: boolean;
  activeFolder: TelegramFolderFilter;
  activeSidebarTab: TelegramSidebarTab;

  // New features state
  replyingToMessage: TelegramMessage | null;
  editingMessage: TelegramMessage | null;
  forwardingMessage: TelegramMessage | null;
  forwardMessageIds: number[];
  isForwardModalOpen: boolean;

  // Forward Actions
  openForwardModal: (msg: TelegramMessage | TelegramMessage[]) => void;
  closeForwardModal: () => void;
  forwardMessage: (toChatId: string, dropAuthor?: boolean) => Promise<boolean>;

  // Sign in flow state
  phoneCodeHash: string | null;
  isCodeSent: boolean;
  isCodeViaApp: boolean;
  pendingPhone: string;

  typingStatus: Record<string, { isTyping: boolean; action?: string; timestamp: number }>;

  // Actions
  fetchStatus: () => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<boolean>;
  submitOtp: (code: string, password?: string) => Promise<boolean>;
  fetchDialogs: () => Promise<void>;
  loadMoreDialogs: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  addContact: (phone: string, firstName: string, lastName?: string) => Promise<boolean>;
  setActiveSidebarTab: (tab: TelegramSidebarTab) => void;
  selectChat: (chatId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (text: string, replyToMsgId?: number) => Promise<boolean>;
  editMessage: (messageId: number, text: string) => Promise<boolean>;
  deleteMessage: (messageId: number, revoke?: boolean) => Promise<boolean>;
  pinMessage: (messageId: number, silent?: boolean) => Promise<boolean>;
  unpinMessage: (messageId?: number) => Promise<boolean>;
  sendTyping: () => Promise<void>;
  setReplyingToMessage: (msg: TelegramMessage | null) => void;
  setEditingMessage: (msg: TelegramMessage | null) => void;
  sendMedia: (fileBase64: string, fileName: string, caption?: string, voiceNote?: boolean, duration?: number) => Promise<boolean>;
  sendReaction: (messageId: number, emoticon: string) => Promise<boolean>;
  setActiveFolder: (folder: TelegramFolderFilter) => void;
  disconnect: () => Promise<void>;
  handleIncomingMessage: (msg: TelegramMessage) => void;
  handleIncomingMessagesRead: (data: { chatId: string; maxId: number }) => void;
  handleIncomingTyping: (data: { chatId: string; userId: string; isTyping: boolean; action?: string }) => void;
  handleIncomingUserStatus: (data: { userId: string; isOnline: boolean }) => void;
  resetSignInState: () => void;
  clearCache: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; about?: string; username?: string }) => Promise<boolean>;
  uploadProfilePhoto: (fileBase64: string, fileName?: string) => Promise<boolean>;
  togglePinDialog: (chatId: string, pinned?: boolean) => Promise<boolean>;
}

export const useTelegramStore = create<TelegramState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  user: null,
  dialogs: [],
  contacts: [],
  activeChatId: null,
  messages: [],
  messagesCache: {},
  loadingDialogs: false,
  loadingMoreDialogs: false,
  hasMoreDialogs: true,
  loadingContacts: false,
  loadingMessages: false,
  loadingMoreMessages: false,
  hasMoreMessages: true,
  sendingMessage: false,
  activeFolder: 'all',
  activeSidebarTab: 'chats',
  replyingToMessage: null,
  editingMessage: null,
  forwardingMessage: null,
  forwardMessageIds: [],
  isForwardModalOpen: false,

  phoneCodeHash: null,
  isCodeSent: false,
  isCodeViaApp: false,
  pendingPhone: '',

  typingStatus: {},

  fetchStatus: async () => {
    try {
      const data = await telegramApi.getStatus();
      set({
        isConnected: data.isConnected,
        isConnecting: data.isConnecting,
        user: data.user,
      });

      if (data.isConnected && get().dialogs.length === 0) {
        get().fetchDialogs();
      }
    } catch (e) {
      set({ isConnected: false });
    }
  },

  setActiveFolder: (folder: TelegramFolderFilter) => {
    set({ activeFolder: folder });
  },

  sendVerificationCode: async (phone: string) => {
    try {
      set({ isConnecting: true });
      const res = await telegramApi.sendCode(phone);
      set({
        phoneCodeHash: res.phoneCodeHash,
        isCodeSent: true,
        isCodeViaApp: res.isCodeViaApp,
        pendingPhone: phone,
        isConnecting: false,
      });
      toast.success(
        'Code Sent',
        res.isCodeViaApp ? 'Verification code sent to your Telegram App' : 'Verification code sent via SMS'
      );
      return true;
    } catch (err: any) {
      set({ isConnecting: false });
      toast.error('Telegram Error', err.message || 'Could not send verification code');
      return false;
    }
  },

  submitOtp: async (code: string, password?: string) => {
    const { pendingPhone, phoneCodeHash } = get();
    if (!pendingPhone || !phoneCodeHash) {
      toast.error('Error', 'Please request a verification code first');
      return false;
    }

    try {
      set({ isConnecting: true });
      const res = await telegramApi.signIn({
        phone: pendingPhone,
        phoneCodeHash,
        code,
        password,
      });

      set({
        isConnected: true,
        isConnecting: false,
        isCodeSent: false,
        phoneCodeHash: null,
        user: {
          id: res.user.id?.toString(),
          firstName: res.user.firstName,
          username: res.user.username,
          phone: pendingPhone,
        },
      });

      toast.success('Connected!', `Logged in to Telegram as ${res.user.firstName || 'User'}`);
      get().fetchDialogs();
      return true;
    } catch (err: any) {
      set({ isConnecting: false });
      toast.error('Authentication Error', err.message || 'Invalid verification code or password');
      return false;
    }
  },

  fetchDialogs: async () => {
    try {
      set({ loadingDialogs: true, hasMoreDialogs: true });
      const dialogs = await telegramApi.getDialogs(40);
      set({
        dialogs,
        loadingDialogs: false,
        hasMoreDialogs: dialogs.length >= 40,
        activeChatId: get().activeChatId || dialogs[0]?.id || null,
      });

      if (dialogs.length > 0) {
        if (!get().activeChatId) {
          get().selectChat(dialogs[0].id);
        }
        // Eagerly prefetch top 5 recent dialogs in background for 0ms instant click switching!
        dialogs.slice(0, 5).forEach((d) => {
          if (!get().messagesCache[d.id]) {
            telegramApi.getMessages(d.id, 50).then((msgs) => {
              set((state) => ({
                messagesCache: {
                  ...state.messagesCache,
                  [d.id]: msgs,
                },
              }));
            }).catch(() => {});
          }
        });
      }
    } catch (err) {
      set({ loadingDialogs: false });
    }
  },

  loadMoreDialogs: async () => {
    const { dialogs, loadingMoreDialogs, hasMoreDialogs } = get();
    if (loadingMoreDialogs || !hasMoreDialogs || dialogs.length === 0) return;

    const lastDialog = dialogs[dialogs.length - 1];
    set({ loadingMoreDialogs: true });
    try {
      const more = await telegramApi.getDialogs(
        40,
        lastDialog?.lastMessageTimestamp,
        lastDialog?.lastMessageRawId
      );
      const existingIds = new Set(dialogs.map((d) => d.id));
      const freshMore = more.filter((d) => !existingIds.has(d.id));

      set((state) => ({
        dialogs: [...state.dialogs, ...freshMore],
        loadingMoreDialogs: false,
        hasMoreDialogs: more.length >= 40,
      }));
    } catch (err) {
      set({ loadingMoreDialogs: false });
    }
  },

  setActiveSidebarTab: (tab: TelegramSidebarTab) => {
    set({ activeSidebarTab: tab });
    if (tab === 'contacts' && get().contacts.length === 0) {
      get().fetchContacts();
    }
  },

  fetchContacts: async () => {
    try {
      set({ loadingContacts: true });
      const contacts = await telegramApi.getContacts();
      set({ contacts, loadingContacts: false });
    } catch (err) {
      set({ loadingContacts: false });
    }
  },

  addContact: async (phone: string, firstName: string, lastName?: string) => {
    try {
      const ok = await telegramApi.addContact(phone, firstName, lastName);
      if (ok) {
        toast.success('Contact Added', `${firstName} has been added to Telegram contacts`);
        await get().fetchContacts();
        await get().fetchDialogs();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Error', err.message || 'Failed to add contact');
      return false;
    }
  },

  selectChat: async (chatId: string) => {
    const { messagesCache } = get();
    const cached = messagesCache[chatId];

    if (cached && cached.length > 0) {
      // 0ms INSTANT SWITCH from in-memory cache!
      set({
        activeChatId: chatId,
        messages: cached,
        loadingMessages: false,
        hasMoreMessages: true,
        replyingToMessage: null,
        editingMessage: null,
      });
    } else {
      set({
        activeChatId: chatId,
        messages: [],
        loadingMessages: true,
        hasMoreMessages: true,
        replyingToMessage: null,
        editingMessage: null,
      });
    }

    // Optimistically reset unread badge for this chat in dialogs
    set((state) => ({
      dialogs: state.dialogs.map((d) => (d.id === chatId ? { ...d, unreadCount: 0 } : d)),
    }));

    // Silently revalidate latest messages from MTProto in background
    try {
      const messages = await telegramApi.getMessages(chatId, 50);
      set((state) => ({
        messagesCache: {
          ...state.messagesCache,
          [chatId]: messages,
        },
        messages: state.activeChatId === chatId ? messages : state.messages,
        loadingMessages: false,
        hasMoreMessages: messages.length >= 50,
      }));
      // Mark as read on Telegram MTProto
      telegramApi.markAsRead(chatId).catch(() => {});
    } catch (err) {
      set({ loadingMessages: false });
    }
  },

  loadMoreMessages: async () => {
    const { activeChatId, messages, loadingMoreMessages, hasMoreMessages } = get();
    if (!activeChatId || loadingMoreMessages || !hasMoreMessages || messages.length === 0) return;

    const oldestMsg = messages[0];
    if (!oldestMsg) return;

    set({ loadingMoreMessages: true });
    try {
      const older = await telegramApi.getMessages(activeChatId, 50, oldestMsg.id);
      const existingIds = new Set(messages.map((m) => m.id));
      const freshOlder = older.filter((m) => !existingIds.has(m.id));
      const updated = [...freshOlder, ...get().messages];

      set((state) => ({
        messages: updated,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updated,
        },
        loadingMoreMessages: false,
        hasMoreMessages: older.length >= 50,
      }));
    } catch (err) {
      set({ loadingMoreMessages: false });
    }
  },

  clearCache: () => {
    set({ messagesCache: {} });
    toast.success('Cache Cleared', 'In-memory message cache has been cleaned.');
  },

  setReplyingToMessage: (msg: TelegramMessage | null) => {
    set({ replyingToMessage: msg, editingMessage: null });
  },

  setEditingMessage: (msg: TelegramMessage | null) => {
    set({ editingMessage: msg, replyingToMessage: null });
  },

  openForwardModal: (msg: TelegramMessage | TelegramMessage[] | any) => {
    if (Array.isArray(msg)) {
      set({
        forwardingMessage: msg[0] || null,
        forwardMessageIds: msg.map((m) => m.id),
        isForwardModalOpen: true,
      });
    } else if (msg?.albumPhotos && Array.isArray(msg.albumPhotos) && msg.albumPhotos.length > 0) {
      set({
        forwardingMessage: msg,
        forwardMessageIds: msg.albumPhotos.map((m: any) => m.id),
        isForwardModalOpen: true,
      });
    } else if (msg) {
      set({
        forwardingMessage: msg,
        forwardMessageIds: [msg.id],
        isForwardModalOpen: true,
      });
    }
  },

  closeForwardModal: () => {
    set({
      isForwardModalOpen: false,
      forwardingMessage: null,
      forwardMessageIds: [],
    });
  },

  forwardMessage: async (toChatId: string, dropAuthor = false) => {
    const { activeChatId, forwardMessageIds } = get();
    if (!activeChatId || forwardMessageIds.length === 0) return false;

    try {
      const forwardedMsgs = await telegramApi.forwardMessages({
        fromChatId: activeChatId,
        toChatId,
        messageIds: forwardMessageIds,
        dropAuthor,
      });

      // If forwarded to current active chat, append immediately
      if (toChatId === activeChatId && forwardedMsgs.length > 0) {
        set((state) => {
          const updated = [...state.messages, ...forwardedMsgs];
          return {
            messages: updated,
            messagesCache: {
              ...state.messagesCache,
              [activeChatId]: updated,
            },
          };
        });
      }

      set({ isForwardModalOpen: false, forwardingMessage: null, forwardMessageIds: [] });
      toast.success('Forwarded', `Message forwarded successfully`);
      return true;
    } catch (err: any) {
      toast.error('Forward Failed', err.message || 'Could not forward message');
      return false;
    }
  },

  sendMessage: async (text: string, replyToMsgId?: number) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId || !text.trim()) return false;

    set({ sendingMessage: true });
    try {
      const newMsg = await telegramApi.sendMessage(activeChatId, text.trim(), replyToMsgId);
      set((state) => {
        const alreadyExists = state.messages.some((m) => m.id === newMsg.id);
        const updated = alreadyExists ? state.messages : [...state.messages, newMsg];
        return {
          messages: updated,
          messagesCache: {
            ...state.messagesCache,
            [activeChatId]: updated,
          },
          sendingMessage: false,
          replyingToMessage: null,
          dialogs: (() => {
            const target = state.dialogs.find((d) => d.id === activeChatId);
            const others = state.dialogs.filter((d) => d.id !== activeChatId);
            if (!target) return state.dialogs;
            return [{ ...target, lastMessage: text.trim(), lastMessageDate: newMsg.date, isOut: true, isSeen: false }, ...others];
          })(),
        };
      });
      return true;
    } catch (err: any) {
      set({ sendingMessage: false });
      toast.error('Send Failed', err.message || 'Could not send message');
      return false;
    }
  },

  editMessage: async (messageId: number, text: string) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId || !text.trim()) return false;

    // Optimistic update
    set((state) => {
      const updated = state.messages.map((m) =>
        m.id === messageId || Number(m.id) === Number(messageId)
          ? { ...m, text: text.trim(), isEdited: true }
          : m
      );
      return {
        messages: updated,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updated,
        },
        editingMessage: null,
      };
    });

    try {
      await telegramApi.editMessage(activeChatId, messageId, text.trim());
      toast.success('Message Edited', 'Message updated successfully');
      return true;
    } catch (err: any) {
      toast.error('Edit Failed', err.message || 'Could not edit message');
      return false;
    }
  },

  deleteMessage: async (messageId: number, revoke = true) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return false;

    // Optimistic removal
    set((state) => {
      const updated = state.messages.filter((m) => m.id !== messageId && Number(m.id) !== Number(messageId));
      return {
        messages: updated,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updated,
        },
      };
    });

    try {
      await telegramApi.deleteMessages(activeChatId, [Number(messageId)], revoke);
      toast.success('Message Deleted', 'Message removed from Telegram');
      return true;
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Could not delete message');
      return false;
    }
  },

  pinMessage: async (messageId: number, silent = true) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return false;

    set((state) => {
      const updated = state.messages.map((m) =>
        m.id === messageId || Number(m.id) === Number(messageId)
          ? { ...m, isPinned: true }
          : m
      );
      return {
        messages: updated,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updated,
        },
      };
    });

    try {
      await telegramApi.pinMessage(activeChatId, messageId, silent);
      toast.success('Message Pinned', 'Message pinned to chat');
      return true;
    } catch (err: any) {
      toast.error('Pin Failed', err.message || 'Could not pin message');
      return false;
    }
  },

  unpinMessage: async (messageId?: number) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return false;

    set((state) => {
      const updated = state.messages.map((m) =>
        !messageId || m.id === messageId || Number(m.id) === Number(messageId)
          ? { ...m, isPinned: false }
          : m
      );
      return {
        messages: updated,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updated,
        },
      };
    });

    try {
      await telegramApi.unpinMessage(activeChatId, messageId);
      toast.info('Message Unpinned', 'Message unpinned from chat');
      return true;
    } catch (err: any) {
      toast.error('Unpin Failed', err.message || 'Could not unpin message');
      return false;
    }
  },

  sendTyping: async () => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return;
    try {
      await telegramApi.sendTyping(activeChatId);
    } catch (e) {}
  },

  sendMedia: async (fileBase64: string, fileName: string, caption?: string, voiceNote?: boolean, duration?: number) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return false;

    set({ sendingMessage: true });
    try {
      const newMsg = await telegramApi.sendMedia({
        chatId: activeChatId,
        fileBase64,
        fileName,
        caption,
        voiceNote,
        duration,
      });
      set((state) => {
        const alreadyExists = state.messages.some((m) => m.id === newMsg.id);
        const updated = alreadyExists ? state.messages : [...state.messages, newMsg];
        return {
          messages: updated,
          messagesCache: {
            ...state.messagesCache,
            [activeChatId]: updated,
          },
          sendingMessage: false,
          dialogs: (() => {
            const target = state.dialogs.find((d) => d.id === activeChatId);
            const others = state.dialogs.filter((d) => d.id !== activeChatId);
            if (!target) return state.dialogs;
            return [
              {
                ...target,
                lastMessage: caption || (voiceNote ? 'Voice message' : fileName),
                lastMediaType: voiceNote ? 'voice' : undefined,
                lastMessageDate: newMsg.date,
                isOut: true,
                isSeen: false,
              },
              ...others,
            ];
          })(),
        };
      });
      toast.success('Media Sent', `${fileName} sent to Telegram`);
      return true;
    } catch (err: any) {
      set({ sendingMessage: false });
      toast.error('Send Media Failed', err.message || 'Could not send file');
      return false;
    }
  },

  sendReaction: async (messageId: number, emoticon: string) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) return false;

    let isRemoving = false;

    // Optimistically update message reactions in local state
    set((state) => {
      const updatedMessages = state.messages.map((m) => {
        if (m.id !== messageId && Number(m.id) !== Number(messageId)) return m;
        const currentReactions = m.reactions || [];
        const existingIdx = currentReactions.findIndex((r) => r.emoticon === emoticon);

        let newReactions: Array<{ emoticon: string; count: number; isChosen?: boolean }>;
        if (existingIdx >= 0) {
          const isChosen = currentReactions[existingIdx].isChosen;
          if (isChosen) {
            // Already chosen by current user -> unreact / remove reaction!
            isRemoving = true;
            const newCount = currentReactions[existingIdx].count - 1;
            if (newCount <= 0) {
              newReactions = currentReactions.filter((_, idx) => idx !== existingIdx);
            } else {
              newReactions = currentReactions.map((r, idx) =>
                idx === existingIdx ? { ...r, count: newCount, isChosen: false } : r
              );
            }
          } else {
            // Add reaction and clear other chosen reactions (Telegram allows 1 reaction per user)
            newReactions = currentReactions.map((r, idx) =>
              idx === existingIdx
                ? { ...r, count: r.count + 1, isChosen: true }
                : { ...r, count: r.isChosen ? Math.max(1, r.count - 1) : r.count, isChosen: false }
            ).filter((r) => r.count > 0);
          }
        } else {
          // Clear any previous chosen reaction and add new reaction
          const cleared = currentReactions.map((r) =>
            r.isChosen ? { ...r, count: Math.max(1, r.count - 1), isChosen: false } : r
          ).filter((r) => r.count > 0);
          newReactions = [...cleared, { emoticon, count: 1, isChosen: true }];
        }

        return {
          ...m,
          reactions: newReactions,
        };
      });

      return {
        messages: updatedMessages,
        messagesCache: {
          ...state.messagesCache,
          [activeChatId]: updatedMessages,
        },
      };
    });

    try {
      await telegramApi.sendReaction({
        chatId: activeChatId,
        messageId: Number(messageId),
        emoticon: isRemoving ? '' : emoticon,
      });
      return true;
    } catch (err) {
      return false;
    }
  },

  disconnect: async () => {
    try {
      await telegramApi.disconnect();
      set({
        isConnected: false,
        user: null,
        dialogs: [],
        messages: [],
        messagesCache: {},
        activeChatId: null,
      });
      toast.info('Disconnected', 'Telegram session cleared');
    } catch (err) {}
  },

  handleIncomingMessage: (msg: TelegramMessage) => {
    set((state) => {
      const isCurrentChat = state.activeChatId === msg.chatId;
      const targetCached = state.messagesCache[msg.chatId] || [];
      const alreadyInTargetCache = targetCached.some((m) => m.id === msg.id);
      const updatedTargetCache = alreadyInTargetCache ? targetCached : [...targetCached, msg];

      const alreadyExists = state.messages.some((m) => m.id === msg.id);
      const updatedMessages = isCurrentChat
        ? (alreadyExists ? state.messages : [...state.messages, msg])
        : state.messages;

      const targetDialog = state.dialogs.find((d) => d.id === msg.chatId);
      const otherDialogs = state.dialogs.filter((d) => d.id !== msg.chatId);
      const updatedDialog = targetDialog
        ? {
            ...targetDialog,
            lastMessage: msg.text || (msg.mediaType ? `[${msg.mediaType.toUpperCase()}]` : ''),
            lastMediaType: msg.mediaType,
            lastMessageDate: msg.date,
            isOut: Boolean(msg.isOut),
            isSeen: msg.isOut ? Boolean(msg.isSeen) : undefined,
            unreadCount: isCurrentChat ? 0 : targetDialog.unreadCount + 1,
          }
        : {
            id: msg.chatId,
            name: msg.chatTitle || msg.senderName || 'Chat',
            avatarUrl: msg.chatAvatar || msg.senderAvatar,
            lastMessage: msg.text || (msg.mediaType ? `[${msg.mediaType.toUpperCase()}]` : ''),
            lastMediaType: msg.mediaType,
            lastMessageDate: msg.date,
            isOut: Boolean(msg.isOut),
            isSeen: msg.isOut ? Boolean(msg.isSeen) : undefined,
            unreadCount: isCurrentChat ? 0 : 1,
            isUser: Boolean(msg.isUser !== undefined ? msg.isUser : !msg.isGroup && !msg.isChannel),
            isGroup: Boolean(msg.isGroup),
            isChannel: Boolean(msg.isChannel),
            isBot: false,
          };

      const updatedDialogs = [updatedDialog, ...otherDialogs];

      return {
        messages: updatedMessages,
        messagesCache: {
          ...state.messagesCache,
          [msg.chatId]: updatedTargetCache,
        },
        dialogs: updatedDialogs,
      };
    });
  },

  handleIncomingMessagesRead: (data: { chatId: string; maxId: number }) => {
    if (!data.chatId) return;
    set((state) => {
      const isCurrentChat = state.activeChatId === data.chatId;
      const updatedMessages = isCurrentChat
        ? state.messages.map((m) =>
            m.isOut && m.id <= data.maxId ? { ...m, isSeen: true } : m
          )
        : state.messages;

      const cached = state.messagesCache[data.chatId];
      const updatedCache = cached
        ? {
            ...state.messagesCache,
            [data.chatId]: cached.map((m) =>
              m.isOut && m.id <= data.maxId ? { ...m, isSeen: true } : m
            ),
          }
        : state.messagesCache;

      const updatedDialogs = state.dialogs.map((d) =>
        d.id === data.chatId && d.isOut
          ? { ...d, isSeen: true }
          : d
      );

      return {
        messages: updatedMessages,
        messagesCache: updatedCache,
        dialogs: updatedDialogs,
      };
    });
  },

  handleIncomingTyping: (data: { chatId: string; userId: string; isTyping: boolean; action?: string }) => {
    if (!data.chatId) return;
    set((state) => ({
      typingStatus: {
        ...state.typingStatus,
        [data.chatId]: {
          isTyping: data.isTyping,
          action: data.action,
          timestamp: Date.now(),
        },
      },
    }));

    // Auto clear typing state after 4.5 seconds if no further update
    setTimeout(() => {
      const current = get().typingStatus[data.chatId];
      if (current && Date.now() - current.timestamp >= 4000) {
        set((state) => {
          const updated = { ...state.typingStatus };
          delete updated[data.chatId];
          return { typingStatus: updated };
        });
      }
    }, 4500);
  },

  handleIncomingUserStatus: (data: { userId: string; isOnline: boolean }) => {
    if (!data.userId) return;
    set((state) => ({
      dialogs: state.dialogs.map((d) =>
        d.id === data.userId || (d as any).userId === data.userId
          ? { ...d, isOnline: data.isOnline }
          : d
      ),
      contacts: state.contacts.map((c) =>
        c.id === data.userId ? { ...c, isOnline: data.isOnline } : c
      ),
    }));
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; about?: string; username?: string }): Promise<boolean> => {
    try {
      const res = await telegramApi.updateProfile(data);
      if (res.success && res.user) {
        set((state) => ({
          user: {
            ...state.user,
            ...res.user,
          },
        }));
        toast.success('Profile Updated', 'Telegram profile info saved.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update Telegram profile');
      return false;
    }
  },

  uploadProfilePhoto: async (fileBase64: string, fileName?: string): Promise<boolean> => {
    try {
      const res = await telegramApi.uploadProfilePhoto(fileBase64, fileName);
      if (res.success) {
        if (res.avatarUrl && get().user) {
          set((state) => ({
            user: {
              ...state.user,
              avatarUrl: res.avatarUrl,
            },
          }));
        }
        await get().fetchStatus();
        toast.success('Photo Updated', 'Telegram profile photo changed.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Upload Failed', err.message || 'Could not update profile photo');
      return false;
    }
  },

  togglePinDialog: async (chatId: string, pinned?: boolean): Promise<boolean> => {
    try {
      const currentDialog = get().dialogs.find((d) => d.id === chatId);
      const nextPinned = pinned !== undefined ? pinned : !currentDialog?.isPinned;

      // Optimistic update & resort
      set((state) => {
        const updated = state.dialogs.map((d) =>
          d.id === chatId ? { ...d, isPinned: nextPinned } : d
        );
        updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
        });
        return { dialogs: updated };
      });

      await telegramApi.togglePinDialog(chatId, nextPinned);
      toast.success(
        nextPinned ? 'Pinned' : 'Unpinned',
        nextPinned ? 'Chat pinned to top' : 'Chat unpinned'
      );
      return true;
    } catch (err: any) {
      toast.error('Pin Failed', err?.message || 'Could not toggle pin on chat');
      get().fetchDialogs();
      return false;
    }
  },

  resetSignInState: () => {
    set({
      isCodeSent: false,
      phoneCodeHash: null,
      pendingPhone: '',
      isConnecting: false,
    });
  },
}));
