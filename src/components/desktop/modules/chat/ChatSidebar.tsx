import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { chatStyles as styles } from './chatStyles';
import { TelegramFolderFilter, TelegramSidebarTab, useTelegramStore } from '../../../../store/useTelegramStore';
import { useThemeStore } from '../../../../store/useThemeStore';
import { toast } from '../../../../store/useToastStore';

interface ChatSidebarProps {
  chatSource: 'team' | 'telegram';
  onSetChatSource: (source: 'team' | 'telegram') => void;
  isLeftCollapsed: boolean;
  onToggleCollapse: () => void;
  isTelegramConnected: boolean;
  filterQuery: string;
  onSetFilterQuery: (q: string) => void;
  activeFolder: TelegramFolderFilter;
  onSetActiveFolder: (folder: TelegramFolderFilter) => void;
  folderCounts: Record<TelegramFolderFilter, number>;
  activeSidebarTab: TelegramSidebarTab;
  onSetActiveSidebarTab: (tab: TelegramSidebarTab) => void;
  // Team
  teamConversations: any[];
  activeTeamId: string | null;
  onSelectTeamConversation: (id: string) => void;
  // Telegram
  telegramDialogs: any[];
  activeTelegramChatId: string | null;
  onSelectTelegramChat: (id: string) => void;
  loadingMoreDialogs: boolean;
  onScrollDialogs: (e: any) => void;
  // Contacts
  telegramContacts: any[];
  loadingContacts: boolean;
  onOpenAddContactModal: () => void;
  onOpenTelegramModal: () => void;
  onFetchContacts: () => void;
  isKh: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatSource,
  onSetChatSource,
  isLeftCollapsed,
  onToggleCollapse,
  isTelegramConnected,
  filterQuery,
  onSetFilterQuery,
  activeFolder,
  onSetActiveFolder,
  folderCounts,
  activeSidebarTab,
  onSetActiveSidebarTab,
  teamConversations,
  activeTeamId,
  onSelectTeamConversation,
  telegramDialogs,
  activeTelegramChatId,
  onSelectTelegramChat,
  loadingMoreDialogs,
  onScrollDialogs,
  telegramContacts,
  loadingContacts,
  onOpenAddContactModal,
  onOpenTelegramModal,
  onFetchContacts,
  isKh,
}) => {
  const tokens = useThemeStore((s) => s.tokens);
  const typingStatus = useTelegramStore((s) => s.typingStatus);
  const togglePinDialog = useTelegramStore((s) => s.togglePinDialog);
  const loadingDialogs = useTelegramStore((s) => s.loadingDialogs);
  const fetchDialogs = useTelegramStore((s) => s.fetchDialogs);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dialog: any;
  } | null>(null);

  const isTelegram = chatSource === 'telegram';

  const handleContextMenu = (e: any, dialog: any) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const clickX = e?.nativeEvent?.pageX ?? e?.pageX ?? 120;
    const clickY = e?.nativeEvent?.pageY ?? e?.pageY ?? 200;
    const maxPosX = typeof window !== 'undefined' ? window.innerWidth - 200 : 300;
    const maxPosY = typeof window !== 'undefined' ? window.innerHeight - 160 : 400;
    const posX = clickX + 4;
    const posY = clickY + 4;
    setContextMenu({
      visible: true,
      x: Math.min(Math.max(16, posX), maxPosX),
      y: Math.min(Math.max(16, posY), maxPosY),
      dialog,
    });
  };

  return (
    <View style={[styles.sidebar, isLeftCollapsed && styles.sidebarCollapsed, { backgroundColor: tokens.surfaceBg, borderRightColor: tokens.borderSubtle }]}>
      {/* 1. Sidebar Top Header */}
      <View style={[styles.sidebarHeader, isLeftCollapsed && styles.sidebarHeaderCollapsed, { borderBottomColor: tokens.borderSubtle }]}>
        {!isLeftCollapsed ? (
          <>
            <View style={styles.sidebarHeaderLeft}>
              <TouchableOpacity
                style={[
                  styles.sourceSwitchBtn,
                  { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                  !isTelegram && { backgroundColor: tokens.accentSoft, borderColor: tokens.borderSubtle },
                ]}
                onPress={() => onSetChatSource('team')}
                activeOpacity={0.7}
              >
                <RemixIcon name="user-3-fill" size={13} color={!isTelegram ? tokens.accentColor : tokens.textSecondary} />
                <Text style={[styles.sourceSwitchText, { color: !isTelegram ? tokens.accentColor : tokens.textSecondary }]}>Team</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sourceSwitchBtn,
                  { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                  isTelegram && { backgroundColor: tokens.accentSoft, borderColor: tokens.borderSubtle },
                ]}
                onPress={() => onSetChatSource('telegram')}
                activeOpacity={0.7}
              >
                <RemixIcon name="telegram-official" size={13} color={isTelegram ? tokens.accentColor : tokens.textSecondary} />
                <Text style={[styles.sourceSwitchText, { color: isTelegram ? tokens.accentColor : tokens.textSecondary }]}>Telegram</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.collapseBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
              onPress={onToggleCollapse}
              activeOpacity={0.7}
            >
              <RemixIcon name="menu-line" size={16} color={tokens.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.collapseBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
            onPress={onToggleCollapse}
            activeOpacity={0.7}
          >
            <RemixIcon name="menu-line" size={16} color={tokens.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Search & Add Contact (when expanded) */}
      {!isLeftCollapsed && (
        <>
          <View style={[styles.searchBox, { borderBottomColor: tokens.borderSubtle }]}>
            <View style={[styles.searchInputWrapper, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
              <RemixIcon name="search-line" size={13} color={tokens.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: tokens.textPrimary }]}
                placeholder={isTelegram ? (isKh ? 'ស្វែងរក Chat / ទំនាក់ទំនង...' : 'Search Telegram...') : (isKh ? 'ស្វែងរកការសន្ទនា...' : 'Search chats...')}
                placeholderTextColor={tokens.textMuted}
                value={filterQuery}
                onChangeText={onSetFilterQuery}
              />
              {filterQuery ? (
                <TouchableOpacity onPress={() => onSetFilterQuery('')}>
                  <RemixIcon name="close-line" size={12} color={tokens.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {isTelegram && (
              <TouchableOpacity
                style={[styles.addContactBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                onPress={onOpenAddContactModal}
                activeOpacity={0.75}
              >
                <RemixIcon name="user-add-line" size={14} color={tokens.accentColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Folder Filter Chips (for Telegram) */}
          {isTelegram && isTelegramConnected && activeSidebarTab === 'chats' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.folderScroll, { borderBottomColor: tokens.borderSubtle }]}
              contentContainerStyle={styles.folderScrollContent}
            >
              {[
                { id: 'all' as TelegramFolderFilter, label: isKh ? 'ទាំងអស់' : 'All', icon: 'chat-3-line' },
                { id: 'unread' as TelegramFolderFilter, label: isKh ? 'មិនទាន់អាន' : 'Unread', icon: 'mail-unread-line' },
                { id: 'direct' as TelegramFolderFilter, label: isKh ? 'បុគ្គល' : 'Personal', icon: 'user-line' },
                { id: 'groups' as TelegramFolderFilter, label: isKh ? 'ក្រុម' : 'Groups', icon: 'team-line' },
                { id: 'channels' as TelegramFolderFilter, label: isKh ? 'ឆានែល' : 'Channels', icon: 'broadcast-line' },
                { id: 'bots' as TelegramFolderFilter, label: 'Bots', icon: 'robot-line' },
              ].map((f) => {
                const isActive = activeFolder === f.id;
                const count = folderCounts[f.id] || 0;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.folderChip,
                      { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                      isActive && { backgroundColor: tokens.accentSoft, borderColor: tokens.borderSubtle },
                    ]}
                    onPress={() => onSetActiveFolder(f.id)}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name={f.icon as any} size={11} color={isActive ? tokens.accentColor : tokens.textSecondary} />
                    <Text style={[styles.folderChipText, { color: tokens.textSecondary }, isActive && { color: tokens.accentColor, fontWeight: '700' }]}>
                      {f.label}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.folderCountBadge, { backgroundColor: isActive ? tokens.accentColor : tokens.surfaceBg }]}>
                        <Text style={[styles.folderCountText, { color: isActive ? tokens.accentFg : tokens.textSecondary }]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      {/* 4. Conversations List ScrollView */}
      <ScrollView
        style={styles.convList}
        showsVerticalScrollIndicator={false}
        onScroll={onScrollDialogs}
        scrollEventThrottle={300}
      >
        {isTelegram ? (
          activeSidebarTab === 'contacts' ? (
            /* Contacts Tab */
            loadingContacts ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0284C7" />
              </View>
            ) : telegramContacts.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: 'Krasar-Regular', color: '#94A3B8' }}>
                  {isKh ? 'មិនមានទំនាក់ទំនងទេ' : 'No contacts found'}
                </Text>
              </View>
            ) : (
              telegramContacts.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.convCard}
                  onPress={() => {
                    onSelectTelegramChat(c.id);
                    onSetActiveSidebarTab('chats');
                  }}
                  activeOpacity={0.75}
                >
                  <ModernAvatar
                    name={c.name}
                    avatarUrl={c.avatarUrl}
                    size={32}
                    showPresence={true}
                    isOnline={Boolean(c.isOnline)}
                  />
                  {!isLeftCollapsed && (
                    <View style={styles.convBody}>
                      <Text style={styles.convTitle} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={[styles.convSnippet, c.isOnline && { color: '#16A34A' }]} numberOfLines={1}>
                        {c.isOnline ? (isKh ? 'កំពុងអនឡាញ' : 'online') : c.phone || `@${c.username || 'user'}`}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )
          ) : (
            /* Telegram Dialogs List */
            telegramDialogs.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {loadingDialogs ? (
                  <>
                    <ActivityIndicator size="small" color={tokens.accentColor} />
                    <Text style={{ fontSize: 12, fontFamily: 'Krasar-Regular', color: tokens.textSecondary, textAlign: 'center' }}>
                      {isKh ? 'កំពុងទាញយកការជជែក Telegram...' : 'Syncing Telegram dialogs...'}
                    </Text>
                  </>
                ) : isTelegramConnected ? (
                  <>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: tokens.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <RemixIcon name="telegram-official" size={24} color={tokens.accentColor} />
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Krasar-Bold', color: tokens.textPrimary, textAlign: 'center' }}>
                      {isKh ? 'មិនទាន់មានការសន្ទនា' : 'No Conversations'}
                    </Text>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Krasar-Regular', color: tokens.textSecondary, textAlign: 'center', lineHeight: 16 }}>
                      {isKh ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីទាញយកបញ្ជី Chats ឡើងវិញ' : 'Click below to sync your active Telegram chat list'}
                    </Text>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: tokens.accentColor,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                      onPress={() => fetchDialogs()}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name="refresh-line" size={13} color={tokens.accentFg} />
                      <Text style={{ fontSize: 12, fontFamily: 'Krasar-Bold', color: tokens.accentFg }}>
                        {isKh ? 'ទាញយកសារឡើងវិញ' : 'Sync Dialogs'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: tokens.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tokens.borderSubtle }}>
                      <RemixIcon name={'telegram-official' as any} size={24} color={tokens.textSecondary} />
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Krasar-Bold', color: tokens.textPrimary, textAlign: 'center' }}>
                      {isKh ? 'មិនទាន់បានភ្ជាប់ Telegram' : 'Telegram Not Connected'}
                    </Text>
                    <Text style={{ fontSize: 11.5, fontFamily: 'Krasar-Regular', color: tokens.textSecondary, textAlign: 'center', lineHeight: 16 }}>
                      {isKh ? 'ភ្ជាប់គណនី Telegram របស់អ្នកដើម្បីផ្ញើ និងទទួលសារផ្ទាល់' : 'Connect your personal Telegram account to chat directly'}
                    </Text>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: tokens.accentColor,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginTop: 4,
                      }}
                      onPress={onOpenTelegramModal}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name={'telegram-official' as any} size={13} color={tokens.accentFg} />
                      <Text style={{ fontSize: 12, fontFamily: 'Krasar-Bold', color: tokens.accentFg }}>
                        {isKh ? 'ភ្ជាប់គណនី Telegram' : 'Connect Telegram'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <>
                {telegramDialogs.map((dialog) => {
                const isSelected = dialog.id === activeTelegramChatId;
                return isLeftCollapsed ? (
                  <View
                    key={dialog.id}
                    style={{ width: '100%' }}
                    {...({
                      onContextMenu: (e: any) => handleContextMenu(e, dialog),
                      onMouseDown: (e: any) => {
                        if (e?.button === 2) handleContextMenu(e, dialog);
                      },
                    } as any)}
                  >
                    <TouchableOpacity
                      style={[styles.collapsedItem, isSelected && styles.collapsedItemActive]}
                      onPress={() => onSelectTelegramChat(dialog.id)}
                      onLongPress={(e) => handleContextMenu(e, dialog)}
                      activeOpacity={0.75}
                    >
                      <ModernAvatar
                        name={dialog.name}
                        avatarUrl={dialog.avatarUrl}
                        size={32}
                        showPresence={true}
                        isOnline={Boolean(dialog.isOnline)}
                      />
                      {isSelected && <View style={styles.activePillDot} />}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    key={dialog.id}
                    style={{ width: '100%' }}
                    {...({
                      onContextMenu: (e: any) => handleContextMenu(e, dialog),
                      onMouseDown: (e: any) => {
                        if (e?.button === 2) handleContextMenu(e, dialog);
                      },
                    } as any)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.convCard,
                        { borderBottomColor: tokens.borderSubtle },
                        isSelected && { backgroundColor: tokens.accentSoft, borderLeftColor: tokens.accentColor },
                      ]}
                      onPress={() => onSelectTelegramChat(dialog.id)}
                      onLongPress={(e) => handleContextMenu(e, dialog)}
                      activeOpacity={0.75}
                    >
                      <ModernAvatar
                        name={dialog.name}
                        avatarUrl={dialog.avatarUrl}
                        size={32}
                        showPresence={true}
                        isOnline={Boolean(dialog.isOnline)}
                      />

                      <View style={styles.convBody}>
                        <View style={styles.convTopRow}>
                          <View style={styles.convTitleRow}>
                            <Text
                              style={[
                                styles.convTitle,
                                { color: tokens.textPrimary },
                                isSelected && { color: tokens.accentColor, fontWeight: '700' },
                              ]}
                              numberOfLines={1}
                            >
                              {dialog.name}
                            </Text>
                            {dialog.isVerified ? (
                              <RemixIcon name={'checkbox-circle-fill' as any} size={12} color={tokens.accentColor} />
                            ) : null}
                            {dialog.isMuted ? (
                              <RemixIcon name={'notification-off-line' as any} size={11} color={tokens.textMuted} />
                            ) : null}
                          </View>
                          <View style={styles.convTimeRow}>
                            {Boolean(dialog.isOut) && dialog.isSeen !== undefined ? (
                              <RemixIcon
                                name={(dialog.isSeen ? 'check-double-line' : 'check-line') as any}
                                size={12}
                                color={dialog.isSeen ? tokens.accentColor : tokens.textMuted}
                              />
                            ) : null}
                            <Text style={[styles.convTime, { color: tokens.textMuted }]}>{dialog.lastMessageDate}</Text>
                          </View>
                        </View>

                        <View style={styles.convSnippetRow}>
                          <View style={styles.convSnippetLeft}>
                            {dialog.lastMediaType === 'photo' ? (
                              <View style={styles.tgMiniThumbRow}>
                                {dialog.lastMediaThumbUrl ? (
                                  <Image
                                    source={{ uri: dialog.lastMediaThumbUrl }}
                                    style={styles.tgMiniThumbImg}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <RemixIcon name="image-line" size={12} color={tokens.accentColor} />
                                )}
                              </View>
                            ) : dialog.lastMediaType === 'voice' ? (
                              <RemixIcon name="mic-line" size={12} color={tokens.accentColor} />
                            ) : dialog.lastMediaType === 'document' ? (
                              <RemixIcon name="file-text-line" size={12} color={tokens.accentColor} />
                            ) : dialog.lastMediaType === 'sticker' ? (
                              <RemixIcon name="emotion-line" size={12} color="#F59E0B" />
                            ) : null}

                            {typingStatus[dialog.id]?.isTyping ? (
                              <Text
                                style={[
                                  styles.convSnippet,
                                  { color: tokens.accentColor, fontFamily: 'Krasar-Bold' },
                                ]}
                                numberOfLines={1}
                              >
                                {typingStatus[dialog.id]?.action === 'recording'
                                  ? (isKh ? 'កំពុងថតសំឡេង...' : 'recording voice...')
                                  : typingStatus[dialog.id]?.action === 'uploading'
                                  ? (isKh ? 'កំពុងផ្ញើឯកសារ...' : 'uploading file...')
                                  : (isKh ? 'កំពុងវាយអក្សរ...' : 'typing...')}
                              </Text>
                            ) : (
                              <Text
                                style={[
                                  styles.convSnippet,
                                  { color: tokens.textSecondary },
                                  Boolean(dialog.lastMediaType) && styles.convSnippetWithMedia,
                                ]}
                                numberOfLines={1}
                              >
                                {(() => {
                                  const raw = (dialog.lastMessage || '').trim();
                                  if (dialog.lastMediaType === 'voice' || raw === '[VOICE]' || raw.toLowerCase().includes('voice_message')) {
                                    return isKh ? 'សារសំឡេង' : 'Voice message';
                                  }
                                  if (dialog.lastMediaType === 'photo' || raw === '[PHOTO]' || raw === '[Photo]') {
                                    return isKh ? 'រូបថត' : 'Photo';
                                  }
                                  if (dialog.lastMediaType === 'document' || raw === '[DOCUMENT]' || raw === '[Document]') {
                                    return isKh ? 'ឯកសារ' : 'Document';
                                  }
                                  if (dialog.lastMediaType === 'sticker' || raw === '[STICKER]') {
                                    return 'Sticker';
                                  }
                                  if (dialog.lastMediaType === 'video' || raw === '[VIDEO]') {
                                    return isKh ? 'វីដេអូ' : 'Video';
                                  }
                                  return raw.replace(/^\[(photo|document|voice|audio|video|sticker|file)\]$/i, '') || (isKh ? 'បើកការសន្ទនា' : 'Open chat');
                                })()}
                              </Text>
                            )}
                          </View>

                          {dialog.unreadCount > 0 && !isSelected ? (
                            <View style={styles.tgUnreadBadge}>
                              <Text style={styles.tgUnreadBadgeText}>{dialog.unreadCount}</Text>
                            </View>
                          ) : dialog.isPinned ? (
                            <View style={styles.tgPinBadge}>
                              <RemixIcon name={'pushpin-fill' as any} size={12} color={tokens.textMuted} />
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {loadingMoreDialogs && (
                <View style={{ padding: 12, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={tokens.accentColor} />
                </View>
              )}
            </>
          ))
        ) : (
          /* Team Conversations */
          teamConversations.map((conv) => {
            const isSelected = conv.id === activeTeamId;
            return isLeftCollapsed ? (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.collapsedItem,
                  isSelected && { backgroundColor: tokens.accentSoft },
                ]}
                onPress={() => onSelectTeamConversation(conv.id)}
                activeOpacity={0.75}
              >
                <ModernAvatar
                  name={conv.name}
                  avatarUrl={conv.avatar}
                  size={32}
                  showPresence={true}
                  isOnline={Boolean(conv.isOnline)}
                />
                {isSelected && <View style={[styles.activePillDot, { backgroundColor: tokens.accentColor }]} />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.convCard,
                  { borderBottomColor: tokens.borderSubtle },
                  isSelected && { backgroundColor: tokens.accentSoft, borderLeftColor: tokens.accentColor },
                ]}
                onPress={() => onSelectTeamConversation(conv.id)}
                activeOpacity={0.75}
              >
                <ModernAvatar
                  name={conv.name}
                  avatarUrl={conv.avatar}
                  size={32}
                  showPresence={true}
                  isOnline={Boolean(conv.isOnline)}
                />

                <View style={styles.convBody}>
                  <View style={styles.convTopRow}>
                    <Text
                      style={[
                        styles.convTitle,
                        { color: tokens.textPrimary },
                        isSelected && { color: tokens.accentColor, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {conv.name}
                    </Text>
                    <Text style={[styles.convTime, { color: tokens.textMuted }]}>{conv.lastMessageTime}</Text>
                  </View>
                  <Text style={[styles.convSnippet, { color: tokens.textSecondary }]} numberOfLines={1}>
                    {conv.lastMessage || 'Start a conversation'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 5. Bottom Navigation Bar for Telegram */}
      {isTelegram && isTelegramConnected && (
        <View style={[!isLeftCollapsed ? styles.sidebarBottomBar : styles.sidebarBottomBarCollapsed, { backgroundColor: tokens.surfaceBg, borderTopColor: tokens.borderSubtle }]}>
          {/* Chats */}
          <TouchableOpacity
            style={!isLeftCollapsed ? styles.sidebarBottomTab : styles.sidebarBottomTabCollapsed}
            onPress={() => {
              if (isLeftCollapsed) onToggleCollapse();
              onSetActiveSidebarTab('chats');
            }}
            activeOpacity={0.7}
          >
            <RemixIcon
              name="chat-3-fill"
              size={20}
              color={activeSidebarTab === 'chats' ? tokens.accentColor : tokens.textSecondary}
            />
          </TouchableOpacity>

          {/* Contacts */}
          <TouchableOpacity
            style={!isLeftCollapsed ? styles.sidebarBottomTab : styles.sidebarBottomTabCollapsed}
            onPress={() => {
              if (isLeftCollapsed) onToggleCollapse();
              onSetActiveSidebarTab('contacts');
              onFetchContacts();
            }}
            activeOpacity={0.7}
          >
            <RemixIcon
              name="user-circle-fill"
              size={20}
              color={activeSidebarTab === 'contacts' ? tokens.accentColor : tokens.textSecondary}
            />
          </TouchableOpacity>

          {/* Phone (Calls - only when expanded) */}
          {!isLeftCollapsed && (
            <TouchableOpacity
              style={styles.sidebarBottomTab}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <RemixIcon name="phone-fill" size={19} color={tokens.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Settings */}
          <TouchableOpacity
            style={!isLeftCollapsed ? styles.sidebarBottomTab : styles.sidebarBottomTabCollapsed}
            onPress={onOpenTelegramModal}
            activeOpacity={0.7}
          >
            <RemixIcon name="settings-3-fill" size={20} color={tokens.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Native Telegram Desktop Chat Right-Click Context Menu */}
      {/* Native Telegram Desktop Chat Right-Click Context Menu */}
      {contextMenu && (
        <Modal
          visible={Boolean(contextMenu)}
          transparent={true}
          animationType="none"
          onRequestClose={() => setContextMenu(null)}
        >
          <TouchableOpacity
            style={styles.tgContextMenuBackdrop}
            onPress={() => setContextMenu(null)}
            activeOpacity={1}
          />
          <View style={[styles.tgContextMenu, { top: contextMenu.y, left: contextMenu.x, minWidth: 220 }]}>
            {/* 1. Open In Window */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                onSelectTelegramChat(contextMenu.dialog.id);
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'external-link-line' as any} size={15} color="#475569" />
              <Text style={styles.tgContextItemText}>
                {isKh ? 'បើកក្នុងផ្ទាំងថ្មី' : 'Open In Window'}
              </Text>
            </TouchableOpacity>

            {/* 2. Pin / Unpin */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={async () => {
                const targetChatId = contextMenu.dialog.id;
                const nextPinned = !contextMenu.dialog.isPinned;
                setContextMenu(null);
                await togglePinDialog(targetChatId, nextPinned);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon
                name={(contextMenu.dialog.isPinned ? 'pushpin-fill' : 'pushpin-line') as any}
                size={15}
                color="#475569"
              />
              <Text style={styles.tgContextItemText}>
                {contextMenu.dialog.isPinned ? (isKh ? 'ដោះខ្ទាស់' : 'Unpin') : (isKh ? 'ខ្ទាស់' : 'Pin')}
              </Text>
            </TouchableOpacity>

            {/* 3. Mute / Unmute */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                toast.info(
                  contextMenu.dialog.isMuted ? 'Unmuted' : 'Muted',
                  contextMenu.dialog.isMuted
                    ? isKh ? 'បានបើកសំឡេងសារ' : 'Notifications unmuted'
                    : isKh ? 'បានបិទសំឡេងសារ' : 'Notifications muted'
                );
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon
                name={(contextMenu.dialog.isMuted ? 'bell-line' : 'notification-off-line') as any}
                size={15}
                color="#475569"
              />
              <Text style={[styles.tgContextItemText, { flex: 1 }]}>
                {contextMenu.dialog.isMuted ? (isKh ? 'បើកសំឡេង' : 'Unmute') : (isKh ? 'បិទសំឡេង' : 'Mute')}
              </Text>
              <RemixIcon name={'arrow-right-s-line' as any} size={14} color="#94A3B8" />
            </TouchableOpacity>

            {/* 4. Mark As Read / Unread */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                toast.info('Status Updated', isKh ? 'បានប្តូរស្ថានភាពសារ' : 'Chat read status updated');
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'chat-3-line' as any} size={15} color="#475569" />
              <Text style={styles.tgContextItemText}>
                {contextMenu.dialog.unreadCount > 0
                  ? isKh ? 'សម្គាល់ថាបានអាន' : 'Mark As Read'
                  : isKh ? 'សម្គាល់ថាមិនទាន់អាន' : 'Mark As Unread'}
              </Text>
            </TouchableOpacity>

            {/* 5. Preview */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                onSelectTelegramChat(contextMenu.dialog.id);
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'eye-line' as any} size={15} color="#475569" />
              <Text style={styles.tgContextItemText}>
                {isKh ? 'មើលសេចក្តីសង្ខេប' : 'Preview'}
              </Text>
            </TouchableOpacity>

            {/* 6. Archive */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                toast.info('Archived', isKh ? 'បានរក្សាទុកក្នុងប័ណ្ណសារ' : 'Chat archived');
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'archive-line' as any} size={15} color="#475569" />
              <Text style={styles.tgContextItemText}>
                {isKh ? 'រក្សាទុកក្នុងប័ណ្ណសារ' : 'Archive'}
              </Text>
            </TouchableOpacity>

            {/* 7. Add to folder */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                toast.info('Folder', isKh ? 'ជ្រើសរើស Folder' : 'Add to folder...');
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'folder-add-line' as any} size={15} color="#475569" />
              <Text style={[styles.tgContextItemText, { flex: 1 }]}>
                {isKh ? 'បន្ថែមទៅ Folder...' : 'Add to folder...'}
              </Text>
              <RemixIcon name={'arrow-right-s-line' as any} size={14} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.tgContextMenuDivider} />

            {/* 8. Clear History */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                toast.info('Clear History', isKh ? 'បានលុបប្រវត្តិសារ' : 'History cleared');
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'close-circle-fill' as any} size={15} color="#64748B" />
              <Text style={styles.tgContextItemText}>
                {isKh ? 'លុបប្រវត្តិសារ' : 'Clear History'}
              </Text>
            </TouchableOpacity>

            {/* 9. Delete Chat (Danger Red) */}
            <TouchableOpacity
              style={[styles.tgContextMenuItem, styles.tgContextMenuItemDanger]}
              onPress={() => {
                toast.error('Deleted', isKh ? 'បានលុបការសន្ទនា' : 'Chat deleted');
                setContextMenu(null);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name={'delete-bin-line' as any} size={15} color="#EF4444" />
              <Text style={[styles.tgContextItemText, styles.tgContextItemTextDanger]}>
                {isKh ? 'លុបការសន្ទនា' : 'Delete Chat'}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};
