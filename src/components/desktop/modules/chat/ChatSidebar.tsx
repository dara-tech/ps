import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { chatStyles as styles } from './chatStyles';
import { TelegramFolderFilter, TelegramSidebarTab, useTelegramStore } from '../../../../store/useTelegramStore';
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
  const typingStatus = useTelegramStore((s) => s.typingStatus);
  const togglePinDialog = useTelegramStore((s) => s.togglePinDialog);
  const isTelegram = chatSource === 'telegram';
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; dialog: any } | null>(null);

  const handleContextMenu = (e: any, dialog: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const posX = e?.clientX ?? e?.nativeEvent?.clientX ?? e?.nativeEvent?.pageX ?? e?.pageX ?? 160;
    const posY = e?.clientY ?? e?.nativeEvent?.clientY ?? e?.nativeEvent?.pageY ?? e?.pageY ?? 220;
    const menuWidth = 220;
    const menuHeight = 340;
    const maxPosX = typeof window !== 'undefined' ? window.innerWidth - menuWidth - 16 : 500;
    const maxPosY = typeof window !== 'undefined' ? window.innerHeight - menuHeight - 16 : 500;

    setContextMenu({
      x: Math.min(Math.max(16, posX), maxPosX),
      y: Math.min(Math.max(16, posY), maxPosY),
      dialog,
    });
  };

  return (
    <View style={[styles.sidebar, isLeftCollapsed && styles.sidebarCollapsed]}>
      {/* 1. Sidebar Top Header */}
      <View style={[styles.sidebarHeader, isLeftCollapsed && styles.sidebarHeaderCollapsed]}>
        {!isLeftCollapsed ? (
          <>
            <View style={styles.sidebarHeaderLeft}>
              <TouchableOpacity
                style={[styles.sourceSwitchBtn, !isTelegram && styles.sourceSwitchBtnActive]}
                onPress={() => onSetChatSource('team')}
                activeOpacity={0.7}
              >
                <RemixIcon name="user-3-fill" size={13} color={!isTelegram ? '#0284C7' : '#64748B'} />
                <Text style={[styles.sourceSwitchText, isTelegram && { color: '#64748B' }]}>Team</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sourceSwitchBtn, isTelegram && styles.sourceSwitchBtnActive]}
                onPress={() => onSetChatSource('telegram')}
                activeOpacity={0.7}
              >
                <RemixIcon name="telegram-official" size={13} color={isTelegram ? '#0284C7' : '#64748B'} />
                <Text style={[styles.sourceSwitchText, !isTelegram && { color: '#64748B' }]}>Telegram</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={onToggleCollapse}
              activeOpacity={0.7}
            >
              <RemixIcon name="menu-line" size={16} color="#64748B" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={onToggleCollapse}
            activeOpacity={0.7}
          >
            <RemixIcon name="menu-line" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Search & Add Contact (when expanded) */}
      {!isLeftCollapsed && (
        <>
          <View style={styles.searchBox}>
            <View style={styles.searchInputWrapper}>
              <RemixIcon name="search-line" size={13} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder={isTelegram ? (isKh ? 'ស្វែងរក Chat / ទំនាក់ទំនង...' : 'Search Telegram...') : (isKh ? 'ស្វែងរកការសន្ទនា...' : 'Search chats...')}
                placeholderTextColor="#94A3B8"
                value={filterQuery}
                onChangeText={onSetFilterQuery}
              />
              {filterQuery ? (
                <TouchableOpacity onPress={() => onSetFilterQuery('')}>
                  <RemixIcon name="close-line" size={12} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {isTelegram && (
              <TouchableOpacity
                style={styles.addContactBtn}
                onPress={onOpenAddContactModal}
                activeOpacity={0.75}
              >
                <RemixIcon name="user-add-line" size={14} color="#0284C7" />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Folder Filter Chips (for Telegram) */}
          {isTelegram && isTelegramConnected && activeSidebarTab === 'chats' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.folderScroll}
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
                    style={[styles.folderChip, isActive && styles.folderChipActive]}
                    onPress={() => onSetActiveFolder(f.id)}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name={f.icon as any} size={11} color={isActive ? '#0284C7' : '#64748B'} />
                    <Text style={[styles.folderChipText, isActive && styles.folderChipTextActive]}>
                      {f.label}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.folderCountBadge, isActive && styles.folderCountBadgeActive]}>
                        <Text style={[styles.folderCountText, isActive && styles.folderCountTextActive]}>
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
                      style={[styles.convCard, isSelected && styles.convCardActive]}
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
                            <Text style={[styles.convTitle, isSelected && styles.convTitleActive]} numberOfLines={1}>
                              {dialog.name}
                            </Text>
                            {dialog.isVerified ? (
                              <RemixIcon name={'checkbox-circle-fill' as any} size={12} color="#0284C7" />
                            ) : null}
                            {dialog.isMuted ? (
                              <RemixIcon name={'notification-off-line' as any} size={11} color="#94A3B8" />
                            ) : null}
                          </View>
                          <View style={styles.convTimeRow}>
                            {Boolean(dialog.isOut) && dialog.isSeen !== undefined ? (
                              <RemixIcon
                                name={(dialog.isSeen ? 'check-double-line' : 'check-line') as any}
                                size={12}
                                color={dialog.isSeen ? '#0284C7' : '#94A3B8'}
                              />
                            ) : null}
                            <Text style={styles.convTime}>{dialog.lastMessageDate}</Text>
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
                                  <RemixIcon name="image-line" size={12} color="#0284C7" />
                                )}
                              </View>
                            ) : dialog.lastMediaType === 'voice' ? (
                              <RemixIcon name="mic-line" size={12} color="#0284C7" />
                            ) : dialog.lastMediaType === 'document' ? (
                              <RemixIcon name="file-text-line" size={12} color="#0284C7" />
                            ) : dialog.lastMediaType === 'sticker' ? (
                              <RemixIcon name="emotion-line" size={12} color="#F59E0B" />
                            ) : null}

                            {typingStatus[dialog.id]?.isTyping ? (
                              <Text
                                style={[
                                  styles.convSnippet,
                                  { color: '#0284C7', fontFamily: 'Krasar-Bold' },
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
                              <RemixIcon name={'pushpin-fill' as any} size={12} color="#94A3B8" />
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
                  <ActivityIndicator size="small" color="#0284C7" />
                </View>
              )}
            </>
          )
        ) : (
          /* Team Conversations */
          teamConversations.map((conv) => {
            const isSelected = conv.id === activeTeamId;
            return isLeftCollapsed ? (
              <TouchableOpacity
                key={conv.id}
                style={[styles.collapsedItem, isSelected && styles.collapsedItemActive]}
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
                {isSelected && <View style={styles.activePillDot} />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={conv.id}
                style={[styles.convCard, isSelected && styles.convCardActive]}
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
          })
        )}
      </ScrollView>

      {/* 5. Bottom Navigation Bar for Telegram */}
      {isTelegram && isTelegramConnected && (
        <View style={!isLeftCollapsed ? styles.sidebarBottomBar : styles.sidebarBottomBarCollapsed}>
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
              color={activeSidebarTab === 'chats' ? '#0284C7' : '#94A3B8'}
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
              color={activeSidebarTab === 'contacts' ? '#0284C7' : '#94A3B8'}
            />
          </TouchableOpacity>

          {/* Phone (Calls - only when expanded) */}
          {!isLeftCollapsed && (
            <TouchableOpacity
              style={styles.sidebarBottomTab}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <RemixIcon name="phone-fill" size={19} color="#94A3B8" />
            </TouchableOpacity>
          )}

          {/* Settings */}
          <TouchableOpacity
            style={!isLeftCollapsed ? styles.sidebarBottomTab : styles.sidebarBottomTabCollapsed}
            onPress={onOpenTelegramModal}
            activeOpacity={0.7}
          >
            <RemixIcon name="settings-3-fill" size={20} color="#94A3B8" />
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
