import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import { CustomFile } from 'telegram/client/uploads';
import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';

const API_ID = 26713734;
const API_HASH = 'ce41f5915389862a172974121887c711';

export interface TelegramDialogItem {
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

export interface TelegramContactItem {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  username?: string;
  isOnline?: boolean;
  avatarUrl?: string;
}

export interface TelegramMessageItem {
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
  thumbUrl?: string;
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
  groupedId?: string;
  chatTitle?: string;
  chatAvatar?: string;
  isGroup?: boolean;
  isChannel?: boolean;
  isUser?: boolean;
  views?: number;
  forwards?: number;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseMediaFromMessage(message: any, chatId: string): {
  mediaType?: 'photo' | 'document' | 'voice' | 'audio' | 'video' | 'sticker';
  mediaUrl?: string;
  thumbUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
} {
  if (!message.media) return {};

  const media = message.media;
  const className = media.className || '';

  if (className === 'MessageMediaPhoto' || media.photo) {
    const mediaUrl = `http://localhost:4000/api/v1/telegram/media/${encodeURIComponent(chatId)}/${message.id}`;
    return {
      mediaType: 'photo',
      mediaUrl,
      thumbUrl: mediaUrl,
    };
  }

  if (className === 'MessageMediaDocument' || media.document) {
    const doc = media.document;
    let fileName = 'document.bin';
    let mediaType: 'document' | 'voice' | 'audio' | 'video' | 'sticker' | 'photo' = 'document';
    let duration: number | undefined;

    let stickerEmoji = '';
    if (doc?.attributes) {
      for (const attr of doc.attributes) {
        if (attr.className === 'DocumentAttributeFilename' && attr.fileName) {
          fileName = attr.fileName;
        } else if (attr.className === 'DocumentAttributeAudio') {
          mediaType = attr.voice ? 'voice' : 'audio';
          duration = attr.duration;
        } else if (attr.className === 'DocumentAttributeVideo' || doc.mimeType?.startsWith('video/')) {
          mediaType = 'video';
          duration = attr.duration;
        } else if (attr.className === 'DocumentAttributeSticker') {
          mediaType = 'sticker';
          if (attr.alt) {
            stickerEmoji = attr.alt;
            fileName = attr.alt;
          }
        } else if (attr.className === 'DocumentAttributeCustomEmoji') {
          if (attr.alt) {
            stickerEmoji = attr.alt;
          }
        }
      }
    }

    if (
      mediaType === 'document' &&
      (doc?.mimeType?.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|bmp|heic|svg)$/i.test(fileName) ||
        doc?.attributes?.some((a: any) => a.className === 'DocumentAttributeImageSize'))
    ) {
      mediaType = 'photo';
    }

    const mediaUrl = `http://localhost:4000/api/v1/telegram/media/${encodeURIComponent(chatId)}/${message.id}`;
    const thumbUrl = `http://localhost:4000/api/v1/telegram/media/${encodeURIComponent(chatId)}/${message.id}?thumb=1`;

    return {
      mediaType,
      fileName: fileName || stickerEmoji || 'sticker',
      fileSize: formatBytes(doc?.size),
      duration,
      mediaUrl,
      thumbUrl,
    };
  }

  return {};
}

function parseReactions(message: any): Array<{ emoticon: string; count: number; isChosen?: boolean }> {
  if (!message || !message.reactions) return [];
  const results = message.reactions.results || [];
  return results.map((r: any) => ({
    emoticon: r.reaction?.emoticon || r.emoticon || '👍',
    count: Number(r.count) || 1,
    isChosen: Boolean(r.chosenOrder !== undefined && r.chosenOrder !== null),
  }));
}

export class TelegramService {
  private client: TelegramClient | null = null;
  private isConnecting = false;
  private isConnected = false;
  private currentUser: any = null;
  private connectPromise: Promise<boolean> | null = null;
  private peerEntityCache = new Map<string, any>();
  public ghostSettings = db.getTelegramGhostSettings();
  private avatarBufferCache = new Map<string, { buffer: Buffer; timestamp: number }>();

  constructor() {
    this.initSavedSession().catch((err) => {
      console.warn('[Telegram] Auto-connect deferred:', err?.message || err);
    });
  }

  public async initSavedSession(): Promise<boolean> {
    if (this.isConnected && this.client && this.currentUser) {
      return true;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = (async () => {
      const saved = db.getTelegramAuth();
      if (!saved || !saved.sessionString) {
        this.isConnected = false;
        return false;
      }

      try {
        this.isConnecting = true;
        if (!this.client) {
          const stringSession = new StringSession(saved.sessionString);
          this.client = new TelegramClient(stringSession, API_ID, API_HASH, {
            connectionRetries: 10,
            retryDelay: 2000,
            useWSS: false,
            autoReconnect: true,
          });
        }

        if (!this.client.connected) {
          await this.client.connect();
        }

        const me = await this.client.getMe();
        if (me) {
          this.currentUser = me;
          this.isConnected = true;
          this.registerEventHandlers();
          console.log(`[Telegram] Connected as ${me.firstName || ''} (@${me.username || me.phone})`);
          return true;
        }
        return false;
      } catch (err: any) {
        console.error('[Telegram] Failed to connect with saved session:', err?.message);
        this.isConnected = false;
        return false;
      } finally {
        this.isConnecting = false;
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
  }

  private registerEventHandlers(): void {
    if (!this.client) return;

    this.client.addEventHandler(async (event: any) => {
      try {
        const message = event.message;
        if (!message) return;

        const sender = await message.getSender();
        const chat = await message.getChat();

        const chatId = message.chatId ? message.chatId.toString() : (chat?.id?.toString() || '');
        const senderName = sender ? ([sender.firstName, sender.lastName].filter(Boolean).join(' ') || sender.title || sender.username || 'Telegram User') : 'User';
        const senderId = message.senderId ? message.senderId.toString() : '';
        const senderAvatar = senderId ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(senderId)}` : undefined;

        const isGroup = Boolean(chat && (chat.className === 'Chat' || (chat.className === 'Channel' && !chat.broadcast) || message.isGroup));
        const isChannel = Boolean(chat && (chat.className === 'Channel' && chat.broadcast));
        const isUser = Boolean(chat && chat.className === 'User');
        const chatTitle = (isGroup || isChannel)
          ? (chat?.title || 'Group')
          : isUser
          ? (chat?.self ? 'Saved Messages' : [chat?.firstName, chat?.lastName].filter(Boolean).join(' ') || chat?.username || senderName)
          : (chat?.title || senderName);
        const chatAvatar = chatId ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(chatId)}` : undefined;

        const mediaInfo = parseMediaFromMessage(message, chatId);
        const replyToMsgId = message.replyTo?.replyToMsgId || (message as any).replyToMsgId;
        const isPinned = Boolean(message.pinned);
        const isEdited = Boolean(message.editDate);

        let fwdFrom = undefined;
        if (message.fwdFrom) {
          const f = message.fwdFrom;
          const fromName = f.fromName || (f.fromId ? (f.fromId.userId ? `User ${f.fromId.userId}` : f.fromId.channelId ? `Channel ${f.fromId.channelId}` : undefined) : undefined);
          fwdFrom = {
            senderName: fromName || 'Original Sender',
            senderId: f.fromId?.userId?.toString() || f.fromId?.channelId?.toString() || '',
            date: f.date ? new Date(f.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }

        const msgItem: TelegramMessageItem = {
          id: message.id,
          chatId,
          senderId,
          senderName,
          senderAvatar,
          chatTitle,
          chatAvatar,
          isGroup,
          isChannel,
          isUser,
          text: message.text || message.message || (mediaInfo.mediaType ? `[${mediaInfo.mediaType.toUpperCase()}]` : ''),
          date: new Date(message.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOut: Boolean(message.out),
          reactions: parseReactions(message),
          replyToMsgId,
          fwdFrom,
          isPinned,
          isEdited,
          ...mediaInfo,
        };

        wsGateway.broadcast({
          type: 'TELEGRAM_NEW_MESSAGE',
          data: msgItem,
        });
      } catch (err) {
        console.error('[Telegram Event Error]', err);
      }
    }, new NewMessage({}));

    // 2. Real-time User Typing & User Status Updates
    this.client.addEventHandler(async (update: any) => {
      try {
        const className = update.className || '';

        // A. User Typing updates
        if (
          className === 'UpdateUserTyping' ||
          className === 'UpdateChatUserTyping' ||
          className === 'UpdateChannelUserTyping'
        ) {
          const userId = update.userId?.toString() || update.fromId?.userId?.toString() || '';
          const chatId = update.chatId?.toString() || update.channelId?.toString() || userId;
          const action = update.action?.className || 'SendMessageTypingAction';
          const isRecording = action.includes('RecordAudio') || action.includes('RecordVoice');
          const isUploading = action.includes('Upload');

          wsGateway.broadcast({
            type: 'TELEGRAM_USER_TYPING',
            data: {
              chatId,
              userId,
              isTyping: true,
              action: isRecording ? 'recording' : isUploading ? 'uploading' : 'typing',
            },
          });
        }

        // B. User Online Presence updates
        if (className === 'UpdateUserStatus') {
          const userId = update.userId?.toString();
          const status = update.status;
          const isOnline = status?.className === 'UserStatusOnline';

          wsGateway.broadcast({
            type: 'TELEGRAM_USER_STATUS',
            data: {
              userId,
              isOnline,
            },
          });
        }

        // C. Read Outbox updates (when peer reads our outgoing message)
        if (
          className === 'UpdateReadHistoryOutbox' ||
          className === 'UpdateReadChannelOutbox' ||
          className === 'UpdateChannelReadMessagesContents'
        ) {
          const peer = update.peer;
          const chatId =
            peer?.userId?.toString() ||
            peer?.channelId?.toString() ||
            peer?.chatId?.toString() ||
            update.channelId?.toString() ||
            '';
          const maxId = update.maxId || (update.messages && Math.max(...update.messages)) || 0;

          if (chatId && maxId) {
            wsGateway.broadcast({
              type: 'TELEGRAM_MESSAGES_READ',
              data: {
                chatId,
                maxId,
              },
            });
          }
        }
      } catch (e) {
        // non-blocking
      }
    });
  }

  public getStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      phone?: string;
      about?: string;
      avatarUrl?: string;
    } | null;
  } {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      user: this.currentUser
        ? {
            id: this.currentUser.id?.toString(),
            firstName: this.currentUser.firstName,
            lastName: this.currentUser.lastName,
            username: this.currentUser.username,
            phone: this.currentUser.phone,
            about: (this.currentUser as any)?.about,
            avatarUrl: this.currentUser.id
              ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(this.currentUser.id.toString())}`
              : undefined,
          }
        : null,
    };
  }

  public async updateProfile(firstName?: string, lastName?: string, about?: string, username?: string): Promise<{ success: boolean; user?: any }> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client not connected');
    }

    try {
      if (firstName !== undefined || lastName !== undefined || about !== undefined) {
        await this.client.invoke(
          new Api.account.UpdateProfile({
            firstName: firstName !== undefined ? firstName : (this.currentUser?.firstName || ''),
            lastName: lastName !== undefined ? lastName : (this.currentUser?.lastName || ''),
            about: about !== undefined ? about : ((this.currentUser as any)?.about || ''),
          })
        );
      }

      if (username !== undefined && username.trim() !== '') {
        const cleanUsername = username.replace(/^@/, '').trim();
        if (cleanUsername !== this.currentUser?.username) {
          await this.client.invoke(
            new Api.account.UpdateUsername({
              username: cleanUsername,
            })
          );
        }
      }

      const me = (await this.client.getMe()) as any;
      if (me) {
        this.currentUser = {
          ...this.currentUser,
          ...me,
          about: about !== undefined ? about : (this.currentUser as any)?.about,
        };
      }

      return {
        success: true,
        user: {
          id: me?.id?.toString(),
          firstName: me?.firstName,
          lastName: me?.lastName,
          username: me?.username,
          phone: me?.phone,
          about: (this.currentUser as any)?.about,
        },
      };
    } catch (err: any) {
      console.error('[Telegram] Update profile error:', err);
      throw new Error(err.message || 'Failed to update profile');
    }
  }

  public async uploadProfilePhoto(fileBase64: string, fileName = 'avatar.jpg'): Promise<{ success: boolean; avatarUrl?: string }> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client not connected');
    }

    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const toUpload = new CustomFile(fileName, buffer.length, '', buffer);
      const uploaded = await this.client.uploadFile({
        file: toUpload,
        workers: 1,
      });

      await this.client.invoke(
        new Api.photos.UploadProfilePhoto({
          file: uploaded,
        })
      );

      const me = (await this.client.getMe()) as any;
      const avatarUrl = me?.id ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(me.id.toString())}?t=${Date.now()}` : undefined;

      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          avatarUrl,
        };
      }

      return {
        success: true,
        avatarUrl,
      };
    } catch (err: any) {
      console.error('[Telegram uploadProfilePhoto error]', err);
      throw new Error(err.message || 'Failed to upload profile photo');
    }
  }

  public async sendCode(phoneNumber: string): Promise<{ phoneCodeHash: string; isCodeViaApp: boolean }> {
    try {
      this.isConnecting = true;
      const stringSession = new StringSession('');
      this.client = new TelegramClient(stringSession, API_ID, API_HASH, {
        connectionRetries: 5,
        useWSS: false,
        autoReconnect: true,
      });

      await this.client.connect();

      const result = await this.client.sendCode(
        {
          apiId: API_ID,
          apiHash: API_HASH,
        },
        phoneNumber
      );

      return {
        phoneCodeHash: result.phoneCodeHash,
        isCodeViaApp: result.isCodeViaApp || false,
      };
    } catch (err: any) {
      console.error('[Telegram sendCode error]', err);
      throw new Error(err?.message || 'Failed to send Telegram verification code');
    } finally {
      this.isConnecting = false;
    }
  }

  public async signIn(params: {
    phoneNumber: string;
    phoneCodeHash: string;
    code: string;
    password?: string;
  }): Promise<{ user: any; sessionString: string }> {
    if (!this.client) {
      throw new Error('Please request verification code first');
    }

    try {
      this.isConnecting = true;
      let user: any;

      try {
        user = await this.client.signInUser(
          {
            apiId: API_ID,
            apiHash: API_HASH,
          },
          {
            phoneNumber: params.phoneNumber,
            phoneCode: async () => params.code,
            onError: (err) => console.error('[Telegram Auth Error]', err),
          }
        );
      } catch (err: any) {
        if (err.errorMessage === 'SESSION_PASSWORD_NEEDED' && params.password) {
          user = await this.client.signInWithPassword(
            {
              apiId: API_ID,
              apiHash: API_HASH,
            },
            {
              password: async () => params.password || '',
              onError: (err) => console.error('[Telegram 2FA Auth Error]', err),
            }
          );
        } else {
          throw err;
        }
      }

      const sessionString = (this.client.session.save() as unknown) as string;
      db.setTelegramAuth({
        sessionString,
        phone: params.phoneNumber,
        userId: user.id?.toString(),
        firstName: user.firstName,
        username: user.username,
      });

      this.currentUser = user;
      this.isConnected = true;
      this.isConnecting = false;

      this.registerEventHandlers();
      return { user, sessionString };
    } catch (err: any) {
      console.error('[Telegram signIn error]', err);
      throw new Error(err?.message || 'Failed to sign in to Telegram');
    }
  }

  public async getDialogs(limit = 40, offsetDate?: number, offsetId?: number): Promise<TelegramDialogItem[]> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      const reconnected = await this.initSavedSession();
      if (!reconnected || !this.client) {
        return [];
      }
    }

    try {
      const params: any = { limit };
      if (offsetDate) params.offsetDate = Number(offsetDate);
      if (offsetId) params.offsetId = Number(offsetId);

      const fetchWithTimeout = Promise.race([
        this.client.getDialogs(params),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getDialogs timed out')), 8000)
        ),
      ]);

      const dialogs = await fetchWithTimeout;
      return dialogs.map((d: any) => {
        const entity = d.entity;
        const isUser = d.isUser || Boolean(entity?.className === 'User');
        const isGroup = d.isGroup || Boolean(entity?.className === 'Chat' || (entity?.className === 'Channel' && !entity.broadcast));
        const isChannel = d.isChannel || Boolean(entity?.className === 'Channel' && entity.broadcast);
        const isBot = Boolean(entity?.bot);

        let name = 'Unknown Chat';
        if (isGroup || isChannel) {
          name = entity?.title || d.title || d.name || 'Group';
        } else if (isUser) {
          if (entity?.self) {
            name = 'Saved Messages';
          } else {
            name = [entity?.firstName, entity?.lastName].filter(Boolean).join(' ') || entity?.title || entity?.username || d.title || d.name || 'User';
          }
        } else {
          name = entity?.title || [entity?.firstName, entity?.lastName].filter(Boolean).join(' ') || d.title || d.name || 'Chat';
        }

        const hasPhoto = Boolean(entity?.photo);
        const dialogId = d.id ? d.id.toString() : entity?.id?.toString() || '';
        const avatarUrl = hasPhoto ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(dialogId)}` : undefined;

        let lastMediaType: 'photo' | 'document' | 'voice' | 'audio' | 'video' | 'sticker' | 'contact' | 'location' | undefined = undefined;
        let lastMediaThumbUrl: string | undefined = undefined;
        let lastMessage = d.message?.message || d.message?.text || '';

        if (d.message?.media) {
          const media = d.message.media;
          const className = media.className;
          const rawMsgId = d.message.id;

          if (className === 'MessageMediaPhoto') {
            lastMediaType = 'photo';
            lastMediaThumbUrl = `http://localhost:4000/api/v1/telegram/media/${encodeURIComponent(dialogId)}/${rawMsgId}`;
            if (!lastMessage) lastMessage = 'Photo';
          } else if (className === 'MessageMediaDocument') {
            const doc = media.document;
            const attributes = doc?.attributes || [];
            const isVoice = attributes.some((a: any) => a.className === 'DocumentAttributeAudio' && a.voice);
            const isAudio = attributes.some((a: any) => a.className === 'DocumentAttributeAudio' && !a.voice);
            const isVideo = attributes.some((a: any) => a.className === 'DocumentAttributeVideo');
            const isSticker = attributes.some((a: any) => a.className === 'DocumentAttributeSticker');
            const fileAttr = attributes.find((a: any) => a.className === 'DocumentAttributeFilename');

            if (isVoice) {
              lastMediaType = 'voice';
              if (!lastMessage) lastMessage = 'Voice message';
            } else if (isVideo) {
              lastMediaType = 'video';
              lastMediaThumbUrl = `http://localhost:4000/api/v1/telegram/media/${encodeURIComponent(dialogId)}/${rawMsgId}`;
              if (!lastMessage) lastMessage = 'Video';
            } else if (isSticker) {
              lastMediaType = 'sticker';
              if (!lastMessage) lastMessage = 'Sticker';
            } else if (isAudio) {
              lastMediaType = 'audio';
              if (!lastMessage) lastMessage = fileAttr?.fileName || 'Audio';
            } else {
              lastMediaType = 'document';
              if (!lastMessage) lastMessage = fileAttr?.fileName || 'Document';
            }
          } else if (className === 'MessageMediaContact') {
            lastMediaType = 'contact';
            if (!lastMessage) lastMessage = 'Contact';
          } else if (className === 'MessageMediaGeo' || className === 'MessageMediaGeoLive') {
            lastMediaType = 'location';
            if (!lastMessage) lastMessage = 'Location';
          }
        }

        const isMuted = Boolean(d.dialog?.notifySettings?.muteUntil && d.dialog.notifySettings.muteUntil > Math.floor(Date.now() / 1000));

        let isOnline = false;
        let userStatus: string | undefined = undefined;
        if (isUser && entity?.status) {
          const st = entity.status;
          const statusClass = st.className || '';
          if (statusClass === 'UserStatusOnline') {
            isOnline = true;
            userStatus = 'online';
          } else if (statusClass === 'UserStatusRecently') {
            userStatus = 'recently';
          } else if (statusClass === 'UserStatusLastWeek') {
            userStatus = 'within_week';
          } else if (statusClass === 'UserStatusLastMonth') {
            userStatus = 'within_month';
          } else if (statusClass === 'UserStatusOffline' && st.wasOnline) {
            userStatus = new Date(st.wasOnline * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }

        const isPinned = Boolean(d.pinned || (d as any).isPinned || (d as any).dialog?.pinned);
        const isVerified = Boolean((entity as any)?.verified);
        const isOut = Boolean(d.message?.out);
        const readOutboxMaxId = (d as any).dialog?.readOutboxMaxId || 0;
        const isSeen = isOut ? (readOutboxMaxId > 0 && d.message?.id ? d.message.id <= readOutboxMaxId : false) : undefined;

        return {
          id: dialogId,
          name,
          isUser,
          isGroup,
          isChannel,
          isBot,
          unreadCount: d.unreadCount || 0,
          lastMessage,
          lastMediaType,
          lastMediaThumbUrl,
          lastMessageDate: d.message?.date
            ? new Date(d.message.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          lastMessageTimestamp: d.message?.date ? d.message.date : undefined,
          lastMessageRawId: d.message?.id ? d.message.id : undefined,
          avatarUrl,
          username: entity?.username,
          participantsCount: entity?.participantsCount,
          isMuted,
          isOnline,
          userStatus,
          isPinned,
          isOut,
          isSeen,
          isVerified,
        };
      });
    } catch (err: any) {
      console.error('[Telegram getDialogs error]', err?.message || err);
      this.initSavedSession().catch(() => {});
      return [];
    }
  }

  public async getContacts(): Promise<TelegramContactItem[]> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      const reconnected = await this.initSavedSession();
      if (!reconnected || !this.client) return [];
    }

    try {
      const result: any = await this.client.invoke(
        new Api.contacts.GetContacts({ hash: BigInt(0) as any })
      );

      const users = result.users || [];
      return users.map((u: any) => {
        const id = u.id ? u.id.toString() : '';
        const firstName = u.firstName || '';
        const lastName = u.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || u.username || u.phone || 'Contact';
        
        let isOnline = false;
        let userStatus: string | undefined = undefined;
        const statusClass = u.status?.className || '';
        if (statusClass === 'UserStatusOnline') {
          isOnline = true;
          userStatus = 'online';
        } else if (statusClass === 'UserStatusRecently') {
          userStatus = 'recently';
        } else if (statusClass === 'UserStatusLastWeek') {
          userStatus = 'within_week';
        } else if (statusClass === 'UserStatusLastMonth') {
          userStatus = 'within_month';
        } else if (statusClass === 'UserStatusOffline' && u.status?.wasOnline) {
          userStatus = new Date(u.status.wasOnline * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const hasPhoto = Boolean(u.photo);
        const avatarUrl = hasPhoto ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(id)}` : undefined;

        return {
          id,
          firstName,
          lastName,
          name,
          phone: u.phone,
          username: u.username,
          isOnline,
          userStatus,
          avatarUrl,
        };
      });
    } catch (err: any) {
      console.error('[Telegram getContacts error]', err?.message || err);
      return [];
    }
  }

  public async addContact(phone: string, firstName: string, lastName = ''): Promise<boolean> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram not connected');
    }

    try {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      await this.client.invoke(
        new Api.contacts.ImportContacts({
          contacts: [
            new Api.InputPhoneContact({
              clientId: BigInt(Date.now()) as any,
              phone: cleanPhone,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            }),
          ],
        })
      );
      return true;
    } catch (err: any) {
      console.error('[Telegram addContact error]', err);
      throw new Error(err?.message || 'Failed to add contact to Telegram');
    }
  }

  public async downloadProfilePhoto(chatId: string): Promise<Buffer | null> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) return null;
    }

    // 1. Check in-memory avatar cache (valid for 15 minutes)
    const cached = this.avatarBufferCache.get(chatId);
    if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return cached.buffer;
    }

    try {
      // 2. Try resolving entity from peerEntityCache first
      let entity =
        this.peerEntityCache.get(chatId) ||
        this.peerEntityCache.get(chatId.replace(/^-100/, '')) ||
        this.peerEntityCache.get(`-100${chatId}`);

      // 3. If not cached, attempt getEntity
      if (!entity) {
        try {
          entity = await this.client.getEntity(chatId);
        } catch (e1) {
          try {
            const numId = Number(chatId);
            if (!isNaN(numId)) {
              entity = await this.client.getEntity(numId);
            }
          } catch (e2) {
            // non-blocking
          }
        }
      }

      if (!entity) return null;

      // 4. Download profile photo (try small first, then big)
      let buffer: any = await this.client.downloadProfilePhoto(entity, { isBig: false });
      if (!buffer || (buffer as Buffer).length === 0) {
        buffer = await this.client.downloadProfilePhoto(entity, { isBig: true });
      }

      if (buffer && (buffer as Buffer).length > 0) {
        const finalBuf = buffer as Buffer;
        this.avatarBufferCache.set(chatId, { buffer: finalBuf, timestamp: Date.now() });
        return finalBuf;
      }
      return null;
    } catch (err: any) {
      return null;
    }
  }

  public async getMessages(chatId: string, limit = 50, offsetId?: number): Promise<TelegramMessageItem[]> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return [];
    }

    try {
      const entity = await this.client.getEntity(chatId);
      if (entity && (entity as any).id) {
        this.peerEntityCache.set((entity as any).id.toString(), entity);
        this.peerEntityCache.set(chatId, entity);
      }

      const getParams: any = { limit };
      if (offsetId) {
        getParams.offsetId = Number(offsetId);
      }

      // Find outbox read position for this chat to compute isSeen
      let readOutboxMaxId = 0;
      try {
        const dialogs = await this.client.getDialogs({ limit: 50 });
        const d = dialogs.find((item: any) => item.id?.toString() === chatId || item.entity?.id?.toString() === chatId);
        if (d && (d as any).dialog?.readOutboxMaxId) {
          readOutboxMaxId = (d as any).dialog.readOutboxMaxId;
        }
      } catch (e) {
        // non-blocking
      }

      // Mark chat as read when messages are loaded
      this.client.markAsRead(entity).catch(() => {});

      const fetchWithTimeout = Promise.race([
        this.client.getMessages(entity, getParams),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('getMessages timed out')), 8000)
        ),
      ]);
      const messages: any = await fetchWithTimeout;

      // Populate peerEntityCache with all sender and chat entities returned
      if (Array.isArray(messages)) {
        for (const m of messages) {
          if (m.sender && m.sender.id) {
            this.peerEntityCache.set(m.sender.id.toString(), m.sender);
          }
          if (m._chat && m._chat.id) {
            this.peerEntityCache.set(m._chat.id.toString(), m._chat);
          }
          if (m._entities) {
            const ents = typeof m._entities.values === 'function' ? m._entities.values() : Object.values(m._entities);
            for (const ent of ents) {
              if (ent && (ent as any).id) {
                this.peerEntityCache.set((ent as any).id.toString(), ent);
              }
            }
          }
        }
      }

      return messages.reverse().map((m: any) => {
        let sender = m.sender;
        if (!sender && m.fromId) {
          const fromIdStr = m.fromId.userId?.toString() || m.fromId.channelId?.toString() || m.fromId.chatId?.toString();
          if (fromIdStr && this.peerEntityCache.has(fromIdStr)) {
            sender = this.peerEntityCache.get(fromIdStr);
          }
        }

        let senderName = 'User';
        if (sender) {
          const fullName = [sender.firstName, sender.lastName].filter(Boolean).join(' ');
          senderName = fullName || sender.title || sender.username || 'User';
        } else if (m.postAuthor) {
          senderName = m.postAuthor;
        } else if (!m.fromId && entity) {
          senderName = (entity as any).title || (entity as any).firstName || 'Group';
        }

        const senderId = m.senderId
          ? m.senderId.toString()
          : sender?.id
          ? sender.id.toString()
          : m.fromId?.userId?.toString() || m.fromId?.channelId?.toString() || chatId;

        const senderAvatar = senderId ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(senderId)}` : undefined;
        const mediaInfo = parseMediaFromMessage(m, chatId);
        const replyToMsgId = m.replyTo?.replyToMsgId || (m as any).replyToMsgId;
        const isPinned = Boolean(m.pinned);
        const isEdited = Boolean(m.editDate);
        const rawDate = m.date ? m.date * 1000 : Date.now();
        const isOut = Boolean(m.out);
        const isSeen = isOut ? (readOutboxMaxId > 0 ? m.id <= readOutboxMaxId : false) : true;

        let fwdFrom = undefined;
        if (m.fwdFrom) {
          const f = m.fwdFrom;
          const fromName = f.fromName || (f.fromId ? (f.fromId.userId ? `User ${f.fromId.userId}` : f.fromId.channelId ? `Channel ${f.fromId.channelId}` : undefined) : undefined);
          fwdFrom = {
            senderName: fromName || 'Original Sender',
            senderId: f.fromId?.userId?.toString() || f.fromId?.channelId?.toString() || '',
            date: f.date ? new Date(f.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }

        return {
          id: m.id,
          chatId,
          senderId,
          senderName,
          senderAvatar,
          text: m.text || m.message || '',
          date: new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate,
          isOut,
          isSeen,
          views: m.views || undefined,
          forwards: m.forwards || undefined,
          reactions: parseReactions(m),
          replyToMsgId,
          fwdFrom,
          isPinned,
          isEdited,
          groupedId: m.groupedId ? m.groupedId.toString() : undefined,
          ...mediaInfo,
        };
      });
    } catch (err: any) {
      console.error('[Telegram getMessages error]', err);
      return [];
    }
  }

  public async getChatFull(chatId: string): Promise<{ bio?: string; participantsCount?: number; username?: string }> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return {};
    }
    try {
      const entity: any = await this.client.getEntity(chatId);
      let bio: string | undefined = undefined;
      let participantsCount = entity?.participantsCount;

      if (entity.className === 'User') {
        const fullUser: any = await this.client.invoke(new Api.users.GetFullUser({ id: entity }));
        bio = fullUser?.fullUser?.about || undefined;
      } else if (entity.className === 'Channel') {
        const fullChannel: any = await this.client.invoke(new Api.channels.GetFullChannel({ channel: entity }));
        bio = fullChannel?.fullChat?.about || undefined;
        participantsCount = fullChannel?.fullChat?.participantsCount || participantsCount;
      } else if (entity.className === 'Chat') {
        const fullChat: any = await this.client.invoke(new Api.messages.GetFullChat({ chatId: entity.id }));
        bio = fullChat?.fullChat?.about || undefined;
        participantsCount = fullChat?.fullChat?.participants?.participants?.length || participantsCount;
      }

      return { bio, participantsCount, username: entity.username };
    } catch (err: any) {
      console.error('[Telegram getChatFull error]', err?.message || err);
      return {};
    }
  }

  public async getParticipants(chatId: string, limit = 100): Promise<Array<{ id: string; name: string; username?: string; isOnline?: boolean; userStatus?: string; avatarUrl?: string; role?: 'owner' | 'admin' | 'member' }>> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return [];
    }
    try {
      const entity: any = await this.client.getEntity(chatId);
      const participants = await (this.client as any).getParticipants(entity, { limit });
      for (const p of participants || []) {
        if (p && p.id) {
          this.peerEntityCache.set(p.id.toString(), p);
        }
      }
      return (participants || []).map((p: any) => {
        const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || p.title || p.username || 'Member';
        const isOnline = p.status?.className === 'UserStatusOnline';
        let userStatus = undefined;
        if (p.status?.className === 'UserStatusOnline') userStatus = 'online';
        else if (p.status?.className === 'UserStatusRecently') userStatus = 'recently';
        else if (p.status?.wasOnline) userStatus = new Date(p.status.wasOnline * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const pClass = p.participant?.className || '';
        const role = (pClass.includes('Creator') || pClass.includes('Owner')) ? 'owner' : (pClass.includes('Admin') ? 'admin' : 'member');

        return {
          id: p.id?.toString?.() || String(p.id),
          name,
          username: p.username,
          isOnline,
          userStatus,
          avatarUrl: `http://localhost:4000/api/v1/telegram/avatar/${p.id}`,
          role,
        };
      });
    } catch (err: any) {
      console.error('[Telegram getParticipants error]', err?.message || err);
      return [];
    }
  }

  public async getMessageReadParticipants(chatId: string, messageId: number): Promise<Array<{ id: string; name: string; avatarUrl?: string; date?: string }>> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return [];
    }
    try {
      const entity = await this.client.getEntity(chatId);
      const res: any = await this.client.invoke(
        new Api.messages.GetMessageReadParticipants({
          peer: entity,
          msgId: Number(messageId),
        })
      );
      if (Array.isArray(res)) {
        return res.map((item: any) => {
          const user = item.user || item;
          const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || `User ${item.userId}` : `User ${item.userId}`;
          return {
            id: (item.userId || user?.id || '').toString(),
            name,
            avatarUrl: item.userId ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(item.userId.toString())}` : undefined,
            date: item.date ? new Date(item.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        });
      }
      return [];
    } catch (err: any) {
      console.warn('[Telegram getMessageReadParticipants error]', err?.message);
      return [];
    }
  }

  public async getSharedMedia(chatId: string, type: 'photo' | 'video' | 'media' | 'document' | 'voice' | 'url', limit = 100): Promise<TelegramMessageItem[]> {
    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return [];
    }
    try {
      const entity: any = await this.client.getEntity(chatId);
      let filter: any;
      if (type === 'photo' || type === 'media') {
        filter = new Api.InputMessagesFilterPhotoVideo();
      } else if (type === 'video') {
        filter = new Api.InputMessagesFilterVideo();
      } else if (type === 'document') {
        filter = new Api.InputMessagesFilterDocument();
      } else if (type === 'voice') {
        filter = new Api.InputMessagesFilterVoice();
      } else if (type === 'url') {
        filter = new Api.InputMessagesFilterUrl();
      }

      const messages = await this.client.getMessages(entity, {
        limit,
        filter,
      });

      return (messages || []).map((m: any) => {
        const sender = m.sender;
        const senderName = sender ? (sender.firstName || sender.title || sender.username || 'User') : 'User';
        const senderId = m.senderId ? m.senderId.toString() : (sender?.id ? sender.id.toString() : '');
        const senderAvatar = senderId ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent(senderId)}` : undefined;
        const mediaInfo = parseMediaFromMessage(m, chatId);
        const rawDate = m.date ? m.date * 1000 : Date.now();

        return {
          id: m.id,
          chatId,
          senderId,
          senderName,
          senderAvatar,
          text: m.text || m.message || '',
          date: new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate,
          isOut: Boolean(m.out),
          isSeen: true,
          ...mediaInfo,
        };
      });
    } catch (err: any) {
      console.error('[Telegram getSharedMedia error]', err?.message || err);
      return [];
    }
  }

  public async markAsRead(chatId: string, maxId?: number): Promise<boolean> {
    // Ghost Mode check: Stealth Read (do not send read receipts)
    if (this.ghostSettings.enabled && this.ghostSettings.noReadReceipts) {
      console.log('[Telegram Ghost Mode] Suppressed markAsRead to keep unread status for sender');
      return true;
    }

    if (!this.client || !this.isConnected || !this.client.connected) {
      await this.initSavedSession();
      if (!this.client) return false;
    }
    try {
      const entity = await this.client.getEntity(chatId);
      await this.client.markAsRead(entity, maxId ? Number(maxId) : undefined);
      return true;
    } catch (err: any) {
      console.error('[Telegram markAsRead error]', err?.message || err);
      return false;
    }
  }

  public async downloadMessageMedia(chatId: string, messageId: number, thumb?: boolean | number | string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) return null;
    }

    try {
      const entity = await this.client.getEntity(chatId);
      const messages = await this.client.getMessages(entity, { ids: [messageId] });
      const msg = messages[0];
      if (!msg || !msg.media) return null;

      let buffer: Buffer | null = null;
      let mimeType = 'application/octet-stream';
      const mediaAny = msg.media as any;

      if (thumb) {
        try {
          const thumbOpt = typeof thumb === 'number' ? thumb : -1;
          buffer = (await this.client.downloadMedia(msg, { thumb: thumbOpt as any })) as Buffer;
          if (buffer) {
            mimeType = 'image/jpeg';
          }
        } catch {
          // fallback to full download if thumb fails
        }
      }

      if (!buffer) {
        buffer = (await this.client.downloadMedia(msg, {})) as Buffer;
      }

      if (!buffer) return null;

      if (mediaAny.className === 'MessageMediaPhoto' || mediaAny.photo || (thumb && mimeType === 'image/jpeg')) {
        mimeType = 'image/jpeg';
      } else if (mediaAny.document?.mimeType) {
        mimeType = mediaAny.document.mimeType;
      }

      return { buffer, mimeType };
    } catch (err: any) {
      console.error('[Telegram downloadMedia error]', err);
      return null;
    }
  }

  public async sendMessage(chatId: string, text: string, replyToMsgId?: number): Promise<TelegramMessageItem> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      let res: any;
      try {
        res = await this.client.sendMessage(entity, {
          message: text,
          replyTo: replyToMsgId ? Number(replyToMsgId) : undefined,
          parseMode: 'markdown',
        });
      } catch {
        res = await this.client.sendMessage(entity, {
          message: text,
          replyTo: replyToMsgId ? Number(replyToMsgId) : undefined,
        });
      }

      const msgItem: TelegramMessageItem = {
        id: res.id,
        chatId,
        senderId: this.currentUser?.id?.toString() || '',
        senderName: this.currentUser?.firstName || 'Me',
        text,
        date: new Date(res.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOut: true,
        replyToMsgId: replyToMsgId ? Number(replyToMsgId) : undefined,
      };

      wsGateway.broadcast({
        type: 'TELEGRAM_NEW_MESSAGE',
        data: msgItem,
      });

      return msgItem;
    } catch (err: any) {
      console.error('[Telegram sendMessage error]', err);
      throw new Error(err?.message || 'Failed to send Telegram message');
    }
  }

  public async editMessage(chatId: string, messageId: number, text: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      await this.client.editMessage(entity, {
        message: Number(messageId),
        text,
      });

      wsGateway.broadcast({
        type: 'TELEGRAM_MESSAGE_EDITED',
        data: { chatId, messageId: Number(messageId), text },
      });

      return true;
    } catch (err: any) {
      console.error('[Telegram editMessage error]', err);
      throw new Error(err?.message || 'Failed to edit Telegram message');
    }
  }

  public async deleteMessages(chatId: string, messageIds: number[], revoke = true): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      await this.client.deleteMessages(entity, messageIds.map(Number), { revoke });

      wsGateway.broadcast({
        type: 'TELEGRAM_MESSAGES_DELETED',
        data: { chatId, messageIds },
      });

      return true;
    } catch (err: any) {
      console.error('[Telegram deleteMessages error]', err);
      throw new Error(err?.message || 'Failed to delete Telegram messages');
    }
  }

  public async pinMessage(chatId: string, messageId: number, silent = true): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      await (this.client as any).pinMessage(entity, Number(messageId), { notify: !silent });

      wsGateway.broadcast({
        type: 'TELEGRAM_MESSAGE_PINNED',
        data: { chatId, messageId: Number(messageId) },
      });

      return true;
    } catch (err: any) {
      console.error('[Telegram pinMessage error]', err?.message || err);
      if (err?.message?.includes('CHAT_ADMIN_REQUIRED') || err?.errorMessage === 'CHAT_ADMIN_REQUIRED') {
        throw new Error('Permission Denied: Only channel/group admins can pin messages.');
      }
      throw new Error(err?.errorMessage || err?.message || 'Failed to pin Telegram message');
    }
  }

  public async unpinMessage(chatId: string, messageId?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      await (this.client as any).unpinMessage(entity, messageId ? Number(messageId) : undefined);

      wsGateway.broadcast({
        type: 'TELEGRAM_MESSAGE_UNPINNED',
        data: { chatId, messageId },
      });

      return true;
    } catch (err: any) {
      console.error('[Telegram unpinMessage error]', err?.message || err);
      if (err?.message?.includes('CHAT_ADMIN_REQUIRED') || err?.errorMessage === 'CHAT_ADMIN_REQUIRED') {
        throw new Error('Permission Denied: Only channel/group admins can unpin messages.');
      }
      throw new Error(err?.errorMessage || err?.message || 'Failed to unpin Telegram message');
    }
  }

  public async togglePinDialog(chatId: string, pinned = true): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      let inputPeer: any;
      try {
        inputPeer = await this.client.getInputEntity(chatId);
      } catch {
        const entity = await this.client.getEntity(chatId);
        inputPeer = await this.client.getInputEntity(entity);
      }

      await this.client.invoke(
        new Api.messages.ToggleDialogPin({
          peer: new Api.InputDialogPeer({ peer: inputPeer }),
          pinned: Boolean(pinned),
        })
      );
      return true;
    } catch (err: any) {
      console.error('[Telegram togglePinDialog error]', err?.message || err);
      if (err?.message?.includes('PINNED_DIALOGS_TOO_MUCH') || err?.errorMessage === 'PINNED_DIALOGS_TOO_MUCH') {
        throw new Error('Telegram Limit: You can only pin up to 5 chats without Telegram Premium.');
      }
      if (err?.message?.includes('CHAT_ADMIN_REQUIRED') || err?.errorMessage === 'CHAT_ADMIN_REQUIRED') {
        throw new Error('Permission Denied: Admin rights required to pin in this group/channel.');
      }
      throw new Error(err?.errorMessage || err?.message || 'Failed to toggle pin dialog');
    }
  }

  public async setTyping(chatId: string): Promise<boolean> {
    // Ghost Mode check: Stealth Typing (do not broadcast typing)
    if (this.ghostSettings.enabled && this.ghostSettings.hideTyping) {
      return true;
    }

    if (!this.client || !this.isConnected) return false;
    try {
      const entity = await this.client.getEntity(chatId);
      await this.client.invoke(
        new Api.messages.SetTyping({
          peer: entity,
          action: new Api.SendMessageTypingAction(),
        })
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  public async sendMedia(params: {
    chatId: string;
    fileBase64: string;
    fileName: string;
    caption?: string;
    voiceNote?: boolean;
    duration?: number;
  }): Promise<TelegramMessageItem> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(params.chatId);
      const buffer = Buffer.from(params.fileBase64, 'base64');
      const toUpload = new CustomFile(params.fileName, buffer.length, '', buffer);

      const res = await this.client.sendFile(entity, {
        file: toUpload,
        caption: params.caption || '',
        voiceNote: Boolean(params.voiceNote),
      });

      const mediaInfo = parseMediaFromMessage(res, params.chatId);

      const msgItem: TelegramMessageItem = {
        id: res.id,
        chatId: params.chatId,
        senderId: this.currentUser?.id?.toString() || '',
        senderName: this.currentUser?.firstName || 'Me',
        text: params.caption || '',
        date: new Date(res.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOut: true,
        ...mediaInfo,
        duration: params.duration || mediaInfo.duration,
      };

      wsGateway.broadcast({
        type: 'TELEGRAM_NEW_MESSAGE',
        data: msgItem,
      });

      return msgItem;
    } catch (err: any) {
      console.error('[Telegram sendMedia error]', err);
      throw new Error(err?.message || 'Failed to send media to Telegram');
    }
  }

  public async sendReaction(chatId: string, messageId: number, emoticon?: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const entity = await this.client.getEntity(chatId);
      const isUnreact = !emoticon || !emoticon.trim();
      const reactionPayload = isUnreact ? [] : [new Api.ReactionEmoji({ emoticon: emoticon.trim() })];

      await this.client.invoke(
        new Api.messages.SendReaction({
          peer: entity,
          msgId: messageId,
          reaction: reactionPayload,
        })
      );
      console.log(`[Telegram] Reaction ${isUnreact ? 'REMOVED/UNREACTED' : `"${emoticon}"`} on msg ${messageId}`);
      return true;
    } catch (err: any) {
      console.error('[Telegram sendReaction error]', err?.message || err);
      return false;
    }
  }

  public async forwardMessages(params: {
    fromChatId: string;
    toChatId: string;
    messageIds: number[];
    dropAuthor?: boolean;
  }): Promise<TelegramMessageItem[]> {
    if (!this.client || !this.isConnected) {
      await this.initSavedSession();
      if (!this.client) throw new Error('Telegram client is not connected');
    }

    try {
      const fromEntity = await this.client.getEntity(params.fromChatId);
      const toEntity = await this.client.getEntity(params.toChatId);

      const result: any = await this.client.forwardMessages(toEntity, {
        messages: params.messageIds.map(Number),
        fromPeer: fromEntity,
        dropAuthor: Boolean(params.dropAuthor),
      });

      const forwardedList: TelegramMessageItem[] = [];
      const messages = Array.isArray(result) ? result : (result?.updates?.filter((u: any) => u.message).map((u: any) => u.message) || [result]);

      for (const m of messages) {
        if (!m || !m.id) continue;
        const rawDate = m.date ? m.date * 1000 : Date.now();
        const mediaInfo = parseMediaFromMessage(m, params.toChatId);

        let fwdFrom = undefined;
        if (m.fwdFrom && !params.dropAuthor) {
          const f = m.fwdFrom;
          const fromName = f.fromName || (f.fromId ? (f.fromId.userId ? `User ${f.fromId.userId}` : f.fromId.channelId ? `Channel ${f.fromId.channelId}` : undefined) : undefined);
          fwdFrom = {
            senderName: fromName || 'Original Sender',
            senderId: f.fromId?.userId?.toString() || f.fromId?.channelId?.toString() || '',
            date: f.date ? new Date(f.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }

        const msgItem: TelegramMessageItem = {
          id: m.id,
          chatId: params.toChatId,
          senderId: this.currentUser?.id?.toString() || '',
          senderName: this.currentUser?.firstName || 'Me',
          text: m.text || m.message || '',
          date: new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate,
          isOut: true,
          isSeen: true,
          fwdFrom,
          ...mediaInfo,
        };
        forwardedList.push(msgItem);

        wsGateway.broadcast({
          type: 'TELEGRAM_NEW_MESSAGE',
          data: msgItem,
        });
      }

      return forwardedList;
    } catch (err: any) {
      console.error('[Telegram forwardMessages error]', err);
      throw new Error(err?.errorMessage || err?.message || 'Failed to forward Telegram message');
    }
  }

  public getGhostSettings() {
    this.ghostSettings = db.getTelegramGhostSettings();
    return this.ghostSettings;
  }

  public updateGhostSettings(settings: Partial<{
    enabled: boolean;
    noReadReceipts: boolean;
    hideOnline: boolean;
    hideTyping: boolean;
    antiDelete: boolean;
    stealthStories: boolean;
  }>) {
    this.ghostSettings = db.setTelegramGhostSettings(settings);
    if (this.ghostSettings.enabled && this.ghostSettings.hideOnline && this.client && this.isConnected) {
      try {
        this.client.invoke(new Api.account.UpdateStatus({ offline: true })).catch(() => {});
      } catch {}
    }
    console.log('[Telegram Ghost Mode] Updated settings:', this.ghostSettings);
    return this.ghostSettings;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
      }
    } catch (e) {}
    this.client = null;
    this.isConnected = false;
    this.currentUser = null;
    db.clearTelegramAuth();
    console.log('[Telegram] Disconnected and session cleared.');
  }
}

export const telegramService = new TelegramService();
