import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { ModernAvatar } from '../../ui/ModernAvatar';
import { ContactInfoSidebar } from './ContactInfoSidebar';
import { toast } from '../../../store/useToastStore';

interface AttachmentItem {
  id: string;
  name: string;
  type: 'code' | 'doc' | 'image' | 'data';
  size: string;
}

const EMOJI_CATEGORIES = [
  {
    title: 'Popular',
    emojis: ['👍', '🔥', '🚀', '💡', '✨', '🎯', '❤️', '👏', '🎉', '🧠'],
  },
  {
    title: 'Smiles & Gestures',
    emojis: ['😀', '😄', '😊', '😎', '🤔', '🙌', '🤝', '💪', '👀', '✌️'],
  },
  {
    title: 'Work & Productivity',
    emojis: ['💻', '📊', '📈', '💳', '📅', '📝', '⚡', '🛠️', '🔒', '🏆'],
  },
  {
    title: 'Status & Symbols',
    emojis: ['✅', '⚠️', '❌', '📌', '⏳', '⭐', '💎', '🟢', '🔴', '💬'],
  },
];

export const ChatModule: React.FC = () => {
  const conversations = useDesktopStore((state) => state.conversations);
  const activeConversationId = useDesktopStore((state) => state.activeConversationId);
  const setActiveConversation = useDesktopStore((state) => state.setActiveConversation);
  const sendMessage = useDesktopStore((state) => state.sendMessage);
  const user = useAuthStore((state) => state.user);

  const [inputMessage, setInputMessage] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const recordingTimerRef = useRef<any>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;
    let fullMsg = inputMessage.trim();
    if (attachments.length > 0) {
      const attachInfo = attachments.map((a) => `[File: ${a.name}]`).join(' ');
      fullMsg = fullMsg ? `${fullMsg} ${attachInfo}` : attachInfo;
    }
    setInputMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);
    await sendMessage(fullMsg);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleAddAttachment = () => {
    const sampleFiles: AttachmentItem[] = [
      { id: `att-${Date.now()}-1`, name: 'SprintNotes.docx', type: 'doc', size: '24 KB' },
      { id: `att-${Date.now()}-2`, name: 'Wireframe.png', type: 'image', size: '1.2 MB' },
      { id: `att-${Date.now()}-3`, name: 'Contract_2026.pdf', type: 'doc', size: '320 KB' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachments((prev) => [...prev, picked]);
    toast.success('File Attached', `${picked.name} added.`);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setInputMessage((prev) => (prev ? `${prev} [Voice message]` : '🎙️ [Voice message recording attached]'));
      toast.info('Voice Clip', 'Voice message added.');
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleCall = () => {
    if (activeConv) toast.info('Audio Call', `Calling ${activeConv.name}...`);
  };

  const handleVideo = () => {
    if (activeConv) toast.info('Video Call', `Starting video call with ${activeConv.name}...`);
  };

  return (
    <View style={styles.container}>
      {/* Column 1: Conversations List (Collapsible: 240px <-> 54px) */}
      <View style={[styles.channelListCol, isLeftCollapsed && styles.channelListColCollapsed]}>
        {/* Search / Toggle Header */}
        <View style={[styles.searchHeader, isLeftCollapsed && styles.searchHeaderCollapsed]}>
          {!isLeftCollapsed ? (
            <>
              <View style={styles.searchBox}>
                <RemixIcon name="search-line" size={13} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  value={filterQuery}
                  onChangeText={setFilterQuery}
                  placeholder="Filter chats..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <TouchableOpacity
                style={styles.collapseToggleBtn}
                onPress={() => setIsLeftCollapsed(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon name="sidebar-collapse-line" size={14} color="#64748B" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.expandToggleBtn}
              onPress={() => setIsLeftCollapsed(false)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RemixIcon name="sidebar-expand-line" size={15} color="#0F172A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Conversation Items */}
        <ScrollView style={styles.channelsScroll} showsVerticalScrollIndicator={false}>
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConv?.id;
            return isLeftCollapsed ? (
              // Collapsed Avatar-Only Pill
              <TouchableOpacity
                key={conv.id}
                style={[styles.collapsedItem, isSelected && styles.collapsedItemActive]}
                onPress={() => setActiveConversation(conv.id)}
                activeOpacity={0.75}
              >
                <ModernAvatar
                  name={conv.name}
                  avatarUrl={conv.avatar}
                  size={32}
                  showPresence={true}
                  isOnline={conv.isOnline}
                />
                {isSelected && <View style={styles.activePillDot} />}
              </TouchableOpacity>
            ) : (
              // Full Expanded Card
              <TouchableOpacity
                key={conv.id}
                style={[styles.convCard, isSelected && styles.convCardActive]}
                onPress={() => setActiveConversation(conv.id)}
                activeOpacity={0.75}
              >
                <ModernAvatar
                  name={conv.name}
                  avatarUrl={conv.avatar}
                  size={32}
                  showPresence={true}
                  isOnline={conv.isOnline}
                />

                <View style={styles.convBody}>
                  <View style={styles.convTopRow}>
                    <Text style={[styles.convTitle, isSelected && styles.convTitleActive]} numberOfLines={1}>
                      {conv.name}
                    </Text>
                    <Text style={styles.convTime}>{conv.lastMessageTime}</Text>
                  </View>
                  <Text style={styles.convSnippet} numberOfLines={1}>
                    {conv.lastMessage || 'Start a conversation'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Column 2: Live Message Stream */}
      <View style={styles.chatDetailCol}>
        {activeConv ? (
          <>
            {/* Header */}
            <View style={styles.detailHeader}>
              <TouchableOpacity
                style={styles.detailHeaderLeft}
                onPress={() => setShowProfileSidebar(!showProfileSidebar)}
                activeOpacity={0.7}
              >
                <ModernAvatar
                  name={activeConv.name}
                  avatarUrl={activeConv.avatar}
                  size={28}
                  showPresence={true}
                  isOnline={activeConv.isOnline}
                />

                <View>
                  <Text style={styles.detailTitle}>{activeConv.name}</Text>
                  <Text style={styles.detailSub}>
                    {activeConv.isOnline ? 'online' : 'last seen recently'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Call & Profile Action Icons */}
              <View style={styles.detailHeaderRight}>
                <TouchableOpacity
                  style={styles.headerActionBtn}
                  onPress={handleCall}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RemixIcon name="phone-line" size={14} color="#475569" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerActionBtn}
                  onPress={handleVideo}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RemixIcon name="vidicon-line" size={14} color="#475569" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.headerActionBtn, showProfileSidebar && styles.headerActionBtnActive]}
                  onPress={() => setShowProfileSidebar(!showProfileSidebar)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RemixIcon name="more-2-fill" size={13} color={showProfileSidebar ? '#0F172A' : '#64748B'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages Scroll Area */}
            <ScrollView
              ref={scrollRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {activeConv.messages?.map((msg) => {
                const isMe = msg.senderId === user?.id || msg.senderName === user?.name;
                return (
                  <View
                    key={msg.id}
                    style={[styles.msgWrapper, isMe ? styles.msgWrapperMe : styles.msgWrapperOther]}
                  >
                    <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
                      {!isMe && (
                        <ModernAvatar
                          name={msg.senderName}
                          avatarUrl={msg.senderAvatar}
                          size={26}
                        />
                      )}
                      <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                        {!isMe && (
                          <Text style={styles.msgSenderName}>{msg.senderName}</Text>
                        )}
                        <Text style={[styles.msgText, isMe && styles.msgTextMe]}>
                          {msg.content}
                        </Text>
                        <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                          {msg.timestamp}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Interactive Emoji Picker Popover */}
            {showEmojiPicker && (
              <View style={styles.emojiPickerContainer}>
                <View style={styles.emojiPickerHeader}>
                  <Text style={styles.emojiPickerTitle}>Pick an Emoji</Text>
                  <TouchableOpacity
                    onPress={() => setShowEmojiPicker(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <RemixIcon name="close-line" size={13} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.emojiScroll} showsVerticalScrollIndicator={false}>
                  {EMOJI_CATEGORIES.map((cat, catIdx) => (
                    <View key={catIdx} style={styles.emojiCatSection}>
                      <Text style={styles.emojiCatTitle}>{cat.title}</Text>
                      <View style={styles.emojiGrid}>
                        {cat.emojis.map((em, emIdx) => (
                          <TouchableOpacity
                            key={emIdx}
                            style={styles.emojiCell}
                            onPress={() => handleEmojiSelect(em)}
                            activeOpacity={0.6}
                          >
                            <Text style={styles.emojiText}>{em}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Modern Input Bar */}
            <View style={styles.inputBar}>
              {/* Attached Items Badges */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsRow}>
                  {attachments.map((att) => (
                    <View key={att.id} style={styles.attachmentBadge}>
                      <RemixIcon name="file-text-line" size={12} color="#0F172A" />
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {att.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeAttachment(att.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <RemixIcon name="close-line" size={11} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View
                style={[
                  styles.inputCard,
                  isInputFocused && styles.inputCardFocused,
                  isRecording && styles.inputCardRecording,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder={
                    isRecording
                      ? `Recording voice note (${recordingSeconds}s)... click mic to stop`
                      : `Message ${activeConv.name}...`
                  }
                  placeholderTextColor="#94A3B8"
                  onSubmitEditing={handleSend}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                />

                <View style={styles.inputToolbar}>
                  <View style={styles.toolbarLeft}>
                    {/* Emoji Button */}
                    <TouchableOpacity
                      style={[styles.toolIconBtn, showEmojiPicker && styles.toolIconBtnActive]}
                      onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <RemixIcon
                        name="emotion-line"
                        size={15}
                        color={showEmojiPicker ? '#0F172A' : '#64748B'}
                      />
                    </TouchableOpacity>

                    {/* Attachment Button */}
                    <TouchableOpacity
                      style={styles.toolIconBtn}
                      onPress={handleAddAttachment}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <RemixIcon name="attachment-line" size={15} color="#64748B" />
                    </TouchableOpacity>

                    {/* Voice Mic Button */}
                    <TouchableOpacity
                      style={[styles.toolIconBtn, isRecording && styles.toolIconBtnRecording]}
                      onPress={toggleRecording}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <RemixIcon
                        name="mic-line"
                        size={15}
                        color={isRecording ? '#EF4444' : '#64748B'}
                      />
                      {isRecording && <View style={styles.recordingPulseDot} />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.toolbarRight}>
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        (!inputMessage.trim() && attachments.length === 0) && styles.sendBtnDisabled,
                      ]}
                      onPress={handleSend}
                      disabled={!inputMessage.trim() && attachments.length === 0}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name="send-plane-fill" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="chat-3-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Direct Chats or Notes Yet</Text>
            <Text style={styles.emptySub}>
              Direct 1-on-1 conversations and saved private notes will appear here.
            </Text>
          </View>
        )}
      </View>

      {/* Column 3: Profile Sidebar */}
      {showProfileSidebar && activeConv && (
        <ContactInfoSidebar
          conversation={activeConv}
          onClose={() => setShowProfileSidebar(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  channelListCol: {
    width: 240,
    minWidth: 220,
    flexShrink: 0,
    backgroundColor: '#FAFBFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    height: '100%',
  },
  channelListColCollapsed: {
    width: 54,
    minWidth: 54,
  },
  searchHeader: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchHeaderCollapsed: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 7,
    paddingHorizontal: 8,
    height: 28,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  collapseToggleBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expandToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelsScroll: {
    flex: 1,
    padding: 6,
  },
  collapsedItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  collapsedItemActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  activePillDot: {
    position: 'absolute',
    left: 2,
    width: 3,
    height: 14,
    borderRadius: 1.5,
    backgroundColor: '#2A9D8F',
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    borderRadius: 8,
    marginBottom: 2,
    gap: 8,
  },
  convCardActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  convBody: {
    flex: 1,
    minWidth: 0,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  convTitleActive: {
    color: '#0F172A',
  },
  convTime: {
    fontSize: 9,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginLeft: 4,
  },
  convSnippet: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  chatDetailCol: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  detailHeader: {
    height: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    fontSize: 13,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  detailSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#10B981',
  },
  detailHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerActionBtnActive: {
    backgroundColor: '#EEF2F6',
    borderColor: '#CBD5E1',
  },
  messagesScroll: {
    flex: 1,
    width: '100%',
  },
  messagesContent: {
    padding: 16,
    width: '100%',
  },
  msgWrapper: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  msgWrapperMe: {
    justifyContent: 'flex-end',
  },
  msgWrapperOther: {
    justifyContent: 'flex-start',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '65%',
    gap: 8,
  },
  msgRowMe: {
    flexDirection: 'row-reverse',
  },
  msgRowOther: {
    flexDirection: 'row',
  },
  msgBubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 1,
  },
  msgBubbleMe: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 3,
  },
  msgBubbleOther: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 3,
  },
  msgSenderName: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    marginBottom: 2,
  },
  msgText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    lineHeight: 16,
  },
  msgTextMe: {
    color: '#FFFFFF',
  },
  msgTime: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  msgTimeMe: {
    color: '#94A3B8',
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 280,
    height: 230,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    zIndex: 200,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  emojiPickerTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  emojiScroll: {
    flex: 1,
  },
  emojiCatSection: {
    marginBottom: 8,
  },
  emojiCatTitle: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'Krasar-Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emojiCell: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
  },
  emojiText: {
    fontSize: 13,
  },
  inputBar: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attachmentName: {
    fontSize: 10.5,
    color: '#334155',
    fontFamily: 'Krasar-Bold',
    maxWidth: 140,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },
  inputCardFocused: {
    borderColor: '#0F172A',
  },
  inputCardRecording: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    paddingVertical: 2,
    outlineStyle: 'none',
    minHeight: 26,
  } as any,
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  toolIconBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  toolIconBtnRecording: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  recordingPulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
});
