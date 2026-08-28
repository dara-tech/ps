import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTelegramStore, TelegramFolderFilter } from '../../../store/useTelegramStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { ContactInfoSidebar } from './ContactInfoSidebar';
import { TelegramConnectModal } from '../TelegramConnectModal';
import { toast } from '../../../store/useToastStore';
import { chatStyles as styles } from './chat/chatStyles';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessageList } from './chat/ChatMessageList';
import { ChatInputBar } from './chat/ChatInputBar';
import { AddContactModal } from './chat/AddContactModal';
import { TelegramMediaViewerModal, TelegramMediaItem } from './chat/TelegramMediaViewerModal';
import { ForwardMessageModal } from './chat/ForwardMessageModal';

export const ChatModule: React.FC = () => {
  const tokens = useThemeStore((state) => state.tokens);
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  // Team Chat Store
  const conversations = useDesktopStore((state) => state.conversations);
  const activeConversationId = useDesktopStore((state) => state.activeConversationId);
  const setActiveConversation = useDesktopStore((state) => state.setActiveConversation);
  const sendMessage = useDesktopStore((state) => state.sendMessage);
  const user = useAuthStore((state) => state.user);

  // Telegram MTProto Store
  const isTelegramConnected = useTelegramStore((state) => state.isConnected);
  const telegramUser = useTelegramStore((state) => state.user);
  const telegramDialogs = useTelegramStore((state) => state.dialogs);
  const activeTelegramChatId = useTelegramStore((state) => state.activeChatId);
  const telegramMessages = useTelegramStore((state) => state.messages);
  const selectTelegramChat = useTelegramStore((state) => state.selectChat);
  const sendTelegramMessage = useTelegramStore((state) => state.sendMessage);
  const fetchTelegramStatus = useTelegramStore((state) => state.fetchStatus);
  const fetchTelegramDialogs = useTelegramStore((state) => state.fetchDialogs);
  const activeFolder = useTelegramStore((state) => state.activeFolder);
  const setActiveFolder = useTelegramStore((state) => state.setActiveFolder);
  const sendTelegramReaction = useTelegramStore((state) => state.sendReaction);
  const replyingToMessage = useTelegramStore((state) => state.replyingToMessage);
  const editingMessage = useTelegramStore((state) => state.editingMessage);
  const setReplyingToMessage = useTelegramStore((state) => state.setReplyingToMessage);
  const setEditingMessage = useTelegramStore((state) => state.setEditingMessage);
  const editTelegramMessage = useTelegramStore((state) => state.editMessage);
  const deleteTelegramMessage = useTelegramStore((state) => state.deleteMessage);
  const pinTelegramMessage = useTelegramStore((state) => state.pinMessage);
  const unpinTelegramMessage = useTelegramStore((state) => state.unpinMessage);
  const sendTelegramMedia = useTelegramStore((state) => state.sendMedia);
  const sendTelegramTyping = useTelegramStore((state) => state.sendTyping);
  const loadingMessages = useTelegramStore((state) => state.loadingMessages);
  const loadingMoreMessages = useTelegramStore((state) => state.loadingMoreMessages);
  const hasMoreMessages = useTelegramStore((state) => state.hasMoreMessages);
  const loadMoreMessages = useTelegramStore((state) => state.loadMoreMessages);
  const loadingMoreDialogs = useTelegramStore((state) => state.loadingMoreDialogs);
  const loadMoreDialogs = useTelegramStore((state) => state.loadMoreDialogs);
  const telegramContacts = useTelegramStore((state) => state.contacts);
  const loadingContacts = useTelegramStore((state) => state.loadingContacts);
  const activeSidebarTab = useTelegramStore((state) => state.activeSidebarTab);
  const fetchTelegramContacts = useTelegramStore((state) => state.fetchContacts);
  const addTelegramContact = useTelegramStore((state) => state.addContact);
  const setActiveSidebarTab = useTelegramStore((state) => state.setActiveSidebarTab);
  const openForwardModal = useTelegramStore((state) => state.openForwardModal);

  // UI State
  const [chatSource, setChatSource] = useState<'team' | 'telegram'>('telegram');
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactFirstName, setNewContactFirstName] = useState('');
  const [newContactLastName, setNewContactLastName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const [filterQuery, setFilterQuery] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<number | string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [previewMediaModal, setPreviewMediaModal] = useState<{
    visible: boolean;
    items: TelegramMediaItem[];
    initialIndex: number;
    chatName?: string;
    chatAvatar?: string;
    timestamp?: string;
  } | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const isAtBottomRef = useRef(true);

  // Auto-connect and online listeners
  useEffect(() => {
    // On mount: fetch status, then immediately fetch dialogs if already connected
    const init = async () => {
      await fetchTelegramStatus();
      // After status fetch, check store directly for connected state
      const state = useTelegramStore.getState();
      if (state.isConnected && state.dialogs.length === 0) {
        fetchTelegramDialogs();
      }
    };
    init();

    const handleOnline = () => {
      fetchTelegramStatus();
      if (chatSource === 'telegram') {
        fetchTelegramDialogs();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []); // only on mount

  // Also fetch dialogs whenever Telegram becomes connected and dialog list is empty
  useEffect(() => {
    if (chatSource === 'telegram' && isTelegramConnected && telegramDialogs.length === 0) {
      fetchTelegramDialogs();
    }
  }, [chatSource, isTelegramConnected]);

  const animFrameRef = useRef<number | null>(null);

  // Audio Playback handler with silky smooth 60fps waveform progress
  const handlePlayVoiceNote = useCallback((msgId: string | number, url: string, totalDuration?: number) => {
    if (playingAudioId === msgId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setPlayingAudioId(null);
      setAudioProgress(0);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const audio = new Audio(url);
    audioElementRef.current = audio;
    setPlayingAudioId(msgId);
    setAudioProgress(0);
    setAudioCurrentTime(0);

    const updateSmoothProgress = () => {
      if (audioElementRef.current && !audioElementRef.current.paused) {
        const cur = audioElementRef.current.currentTime;
        const rawDur = audioElementRef.current.duration;
        const dur = (rawDur && isFinite(rawDur) && rawDur > 0)
          ? rawDur
          : (totalDuration || 20);

        setAudioProgress(Math.min(1, Math.max(0, cur / dur)));
        setAudioCurrentTime(Math.floor(cur));
        animFrameRef.current = requestAnimationFrame(updateSmoothProgress);
      }
    };

    audio.onplay = () => {
      animFrameRef.current = requestAnimationFrame(updateSmoothProgress);
    };

    audio.onended = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setPlayingAudioId(null);
      setAudioProgress(0);
      setAudioCurrentTime(0);
      audioElementRef.current = null;
    };

    audio.onerror = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      toast.error('Voice Playback Error', 'Could not stream voice note');
      setPlayingAudioId(null);
      audioElementRef.current = null;
    };

    audio.play().catch(() => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      toast.error('Playback Error', 'Autoplay prevented or network error');
      setPlayingAudioId(null);
    });
  }, [playingAudioId]);

  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Filtered Telegram Dialogs
  const filteredTelegramDialogs = useMemo(() => {
    let list = telegramDialogs;
    if (activeFolder === 'unread') list = list.filter((d) => d.unreadCount > 0);
    else if (activeFolder === 'direct') list = list.filter((d) => d.isUser && !d.isBot);
    else if (activeFolder === 'groups') list = list.filter((d) => d.isGroup);
    else if (activeFolder === 'channels') list = list.filter((d) => d.isChannel);
    else if (activeFolder === 'bots') list = list.filter((d) => d.isBot);

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.username && d.username.toLowerCase().includes(q)) ||
          (d.lastMessage && d.lastMessage.toLowerCase().includes(q))
      );
    }
    return list;
  }, [telegramDialogs, activeFolder, filterQuery]);

  // Filtered Contacts
  const filteredTelegramContacts = useMemo(() => {
    if (!filterQuery.trim()) return telegramContacts;
    const q = filterQuery.toLowerCase();
    return telegramContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.username && c.username.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [telegramContacts, filterQuery]);

  // Filtered Team Conversations
  const filteredTeamConversations = useMemo(() => {
    if (!filterQuery.trim()) return conversations;
    const q = filterQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  }, [conversations, filterQuery]);

  // Folder badge counts
  const folderCounts = useMemo<Record<TelegramFolderFilter, number>>(() => ({
    all: telegramDialogs.length,
    unread: telegramDialogs.filter((d) => d.unreadCount > 0).length,
    direct: telegramDialogs.filter((d) => d.isUser && !d.isBot).length,
    groups: telegramDialogs.filter((d) => d.isGroup).length,
    channels: telegramDialogs.filter((d) => d.isChannel).length,
    bots: telegramDialogs.filter((d) => d.isBot).length,
  }), [telegramDialogs]);

  // Active conversation resolution
  const activeTeamConv = conversations.find((c) => c.id === activeConversationId);
  const activeTelegramDialog = telegramDialogs.find((d) => d.id === activeTelegramChatId);

  const activeConv = useMemo(() => {
    if (chatSource === 'telegram') {
      if (!activeTelegramDialog) return null;
      return {
        id: activeTelegramDialog.id,
        name: activeTelegramDialog.name,
        avatar: activeTelegramDialog.avatarUrl,
        avatarUrl: activeTelegramDialog.avatarUrl,
        isOnline: activeTelegramDialog.isOnline,
        userStatus: activeTelegramDialog.userStatus,
        isGroup: activeTelegramDialog.isGroup,
        isChannel: activeTelegramDialog.isChannel,
        isBot: activeTelegramDialog.isBot,
        isUser: activeTelegramDialog.isUser,
        username: activeTelegramDialog.username,
        participantsCount: activeTelegramDialog.participantsCount,
        isMuted: activeTelegramDialog.isMuted,
        messages: telegramMessages,
      };
    }
    return activeTeamConv || null;
  }, [chatSource, activeTelegramDialog, telegramMessages, activeTeamConv]);

  // Scroll to bottom on conversation change
  useEffect(() => {
    const t1 = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    const t2 = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 180);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeConv?.id]);

  useEffect(() => {
    if (!loadingMessages && isAtBottomRef.current) {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, [loadingMessages]);

  const handleSendMessage = useCallback(async (fullMsg: string) => {
    if (chatSource === 'telegram') {
      if (editingMessage) {
        await editTelegramMessage((editingMessage as any).rawId ?? editingMessage.id, fullMsg);
        setEditingMessage(null);
      } else {
        await sendTelegramMessage(
          fullMsg,
          replyingToMessage ? ((replyingToMessage as any).rawId ?? replyingToMessage.id) : undefined
        );
        setReplyingToMessage(null);
      }
    } else {
      await sendMessage(fullMsg);
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [
    chatSource,
    editingMessage,
    replyingToMessage,
    editTelegramMessage,
    sendTelegramMessage,
    setEditingMessage,
    setReplyingToMessage,
    sendMessage,
  ]);

  const handleSendVoice = useCallback(async (base64Audio: string, durationSeconds: number) => {
    if (chatSource === 'telegram') {
      await sendTelegramMedia(base64Audio, 'voice_message.ogg', undefined, true, durationSeconds);
    } else {
      await sendMessage('[Voice message]');
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatSource, sendTelegramMedia, sendMessage]);

  const handleSaveContact = async () => {
    if (!newContactFirstName.trim() || !newContactPhone.trim()) {
      toast.error('Validation Error', 'First name and phone number are required');
      return;
    }
    setSavingContact(true);
    const success = await addTelegramContact(
      newContactPhone.trim(),
      newContactFirstName.trim(),
      newContactLastName.trim()
    );
    setSavingContact(false);
    if (success) {
      setShowAddContactModal(false);
      setNewContactFirstName('');
      setNewContactLastName('');
      setNewContactPhone('');
    }
  };

  const handleScrollMessages = (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    isAtBottomRef.current = distanceFromBottom < 80;
    setShowScrollBottomBtn(distanceFromBottom > 150);

    if (contentOffset.y <= 20 && hasMoreMessages && !loadingMoreMessages && !loadingMessages) {
      loadMoreMessages();
    }
  };

  const handleScrollDialogs = (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 40) {
      if (chatSource === 'telegram' && !loadingMoreDialogs) {
        loadMoreDialogs();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Column 1: Sidebar */}
      <ChatSidebar
        chatSource={chatSource}
        onSetChatSource={setChatSource}
        isLeftCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
        isTelegramConnected={isTelegramConnected}
        filterQuery={filterQuery}
        onSetFilterQuery={setFilterQuery}
        activeFolder={activeFolder}
        onSetActiveFolder={setActiveFolder}
        folderCounts={folderCounts}
        activeSidebarTab={activeSidebarTab}
        onSetActiveSidebarTab={setActiveSidebarTab}
        teamConversations={filteredTeamConversations}
        activeTeamId={activeConversationId}
        onSelectTeamConversation={setActiveConversation}
        telegramDialogs={filteredTelegramDialogs}
        activeTelegramChatId={activeTelegramChatId}
        onSelectTelegramChat={selectTelegramChat}
        loadingMoreDialogs={loadingMoreDialogs}
        onScrollDialogs={handleScrollDialogs}
        telegramContacts={filteredTelegramContacts}
        loadingContacts={loadingContacts}
        onOpenAddContactModal={() => setShowAddContactModal(true)}
        onOpenTelegramModal={() => setShowTelegramModal(true)}
        onFetchContacts={fetchTelegramContacts}
        isKh={isKh}
      />

      {/* Column 2: Main Chat Screen */}
      <View style={[styles.chatMain, { backgroundColor: tokens.windowBg }]}>
        {activeConv ? (
          <>
            {/* Header with Accurate Online Status */}
            <ChatHeader
              activeConv={activeConv}
              chatSource={chatSource}
              isKh={isKh}
              showProfileSidebar={showProfileSidebar}
              onToggleProfileSidebar={() => setShowProfileSidebar(!showProfileSidebar)}
              onOpenSettingsModal={() => setShowTelegramModal(true)}
              onSearchInChat={() => toast.info('Search', isKh ? 'ស្វែងរកសារក្នុង Chat' : 'Search in conversation')}
              onCall={() => toast.info('Audio Call', `Calling ${activeConv.name}...`)}
              onVideo={() => toast.info('Video Call', `Starting video call with ${activeConv.name}...`)}
            />

            {/* Message Feed */}
            <ChatMessageList
              messages={activeConv.messages || []}
              currentUserId={user?.id}
              isTelegram={chatSource === 'telegram'}
              isGroup={Boolean((activeConv as any)?.isGroup || (activeConv as any)?.type === 'group')}
              isKh={isKh}
              loadingMessages={loadingMessages}
              loadingMoreMessages={loadingMoreMessages}
              hasMoreMessages={hasMoreMessages}
              onLoadMoreMessages={loadMoreMessages}
              scrollRef={scrollRef}
              onReplyMessage={setReplyingToMessage}
              onForwardMessage={openForwardModal}
              onEditMessage={setEditingMessage}
              onPinMessage={(m) => pinTelegramMessage(m.rawId || m.id)}
              onDeleteMessage={(m) => deleteTelegramMessage(m.rawId || m.id)}
              onSendReaction={(msgId, emoji) => sendTelegramReaction(msgId, emoji)}
              onPlayVoiceNote={handlePlayVoiceNote}
              playingAudioId={playingAudioId}
              audioProgress={audioProgress}
              audioCurrentTime={audioCurrentTime}
              onScroll={handleScrollMessages}
              showScrollBottomBtn={showScrollBottomBtn}
              onScrollToBottom={() => {
                isAtBottomRef.current = true;
                setShowScrollBottomBtn(false);
                scrollRef.current?.scrollToEnd({ animated: true });
              }}
              onPreviewPhoto={(url, albumItems, msgInfo) => {
                const items: TelegramMediaItem[] =
                  albumItems && albumItems.length > 0
                    ? albumItems
                    : [{ url, isVideo: url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm') }];
                const idx = items.findIndex((i) => i.url === url);
                setPreviewMediaModal({
                  visible: true,
                  items,
                  initialIndex: idx >= 0 ? idx : 0,
                  chatName: activeConv?.name || 'Media',
                  chatAvatar: (activeConv as any)?.avatarUrl || (activeConv as any)?.avatar,
                  timestamp: msgInfo?.date || msgInfo?.timestamp,
                });
              }}
            />

            {/* High-Performance 0ms Isolated Input Bar */}
            <ChatInputBar
              activeConvName={activeConv.name}
              chatSource={chatSource}
              editingMessage={editingMessage}
              replyingToMessage={replyingToMessage}
              onClearEdit={() => setEditingMessage(null)}
              onClearReply={() => setReplyingToMessage(null)}
              onSend={handleSendMessage}
              onSendVoice={handleSendVoice}
              isKh={isKh}
              onTyping={chatSource === 'telegram' ? sendTelegramTyping : undefined}
            />
          </>
        ) : chatSource === 'telegram' && !isTelegramConnected ? (
          <View style={[styles.heroCenterCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: tokens.accentSoft }]}>
              <RemixIcon name="telegram-official" size={32} color={tokens.accentColor} />
            </View>
            <Text style={[styles.heroTitle, { color: tokens.textPrimary }]}>
              {isKh ? 'ភ្ជាប់គណនី Telegram (MTProto)' : 'Connect Telegram Account'}
            </Text>
            <Text style={[styles.heroSub, { color: tokens.textSecondary }]}>
              {isKh
                ? 'ជជែក ផ្ញើ និងទទួលសារពី Telegram ផ្ទាល់ក្នុង Desktop Workspace តាមរយៈ MTProto Sync Real-time'
                : 'Chat, send, and receive Telegram messages directly in Desktop Workspace with real-time MTProto sync.'}
            </Text>
            <TouchableOpacity
              style={[styles.heroActionBtn, { backgroundColor: tokens.accentColor }]}
              onPress={() => setShowTelegramModal(true)}
              activeOpacity={0.8}
            >
              <RemixIcon name="arrow-right-line" size={16} color={tokens.accentFg} />
              <Text style={[styles.heroActionBtnText, { color: tokens.accentFg }]}>
                {isKh ? 'ភ្ជាប់គណនីឥឡូវនេះ' : 'Connect Account Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyStateBox}>
            <View style={[styles.emptyStateIconCircle, { backgroundColor: tokens.surfaceMuted }]}>
              <RemixIcon
                name={chatSource === 'telegram' ? 'telegram-official' : 'chat-3-line'}
                size={28}
                color={tokens.accentColor}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: tokens.textPrimary }]}>
              {chatSource === 'telegram'
                ? isKh ? 'ជ្រើសរើសការសន្ទនា Telegram' : 'Select a Telegram Chat'
                : 'No Direct Chats or Notes Yet'}
            </Text>
            <Text style={[styles.emptySub, { color: tokens.textSecondary }]}>
              {chatSource === 'telegram'
                ? isKh
                  ? 'ជ្រើសរើស chat ឬក្រុមពីបញ្ជីខាងឆ្វេង ដើម្បីចាប់ផ្តើមជជែក'
                  : 'Pick a conversation from the left sidebar to start messaging.'
                : 'Direct 1-on-1 conversations and saved private notes will appear here.'}
            </Text>
          </View>
        )}
      </View>

      {/* Column 3: Profile & Chat Info Sidebar */}
      {showProfileSidebar && activeConv && (
        <ContactInfoSidebar
          conversation={activeConv as any}
          messages={activeConv.messages || []}
          isTelegram={chatSource === 'telegram'}
          onClose={() => setShowProfileSidebar(false)}
        />
      )}

      {/* Telegram Connection Modal Dialog */}
      <TelegramConnectModal
        visible={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
      />

      {/* Add Telegram Contact Modal Dialog */}
      <AddContactModal
        visible={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        firstName={newContactFirstName}
        onSetFirstName={setNewContactFirstName}
        lastName={newContactLastName}
        onSetLastName={setNewContactLastName}
        phone={newContactPhone}
        onSetPhone={setNewContactPhone}
        saving={savingContact}
        onSave={handleSaveContact}
        isKh={isKh}
      />

      {/* Full-Screen Telegram Desktop Media Viewer Modal */}
      {Boolean(previewMediaModal?.visible) && (
        <TelegramMediaViewerModal
          visible={Boolean(previewMediaModal?.visible)}
          onClose={() => setPreviewMediaModal(null)}
          items={previewMediaModal?.items || []}
          initialIndex={previewMediaModal?.initialIndex || 0}
          chatName={previewMediaModal?.chatName}
          chatAvatar={previewMediaModal?.chatAvatar}
          timestamp={previewMediaModal?.timestamp}
        />
      )}

      {/* Telegram Forward Message Modal Dialog */}
      <ForwardMessageModal />
    </View>
  );
};
