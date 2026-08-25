import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator } from 'react-native';
import { RemixIcon } from '../../ui/RemixIcon';
import { ModernAvatar } from '../../ui/ModernAvatar';
import { toast } from '../../../store/useToastStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { telegramApi } from '../../../services/telegramApi';

interface ContactInfoSidebarProps {
  conversation: any;
  messages?: any[];
  isTelegram?: boolean;
  onClose: () => void;
}

export const ContactInfoSidebar: React.FC<ContactInfoSidebarProps> = ({
  conversation,
  messages = [],
  isTelegram = false,
  onClose,
}) => {
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  const isGroup = Boolean(conversation.isGroup);
  const isChannel = Boolean(conversation.isChannel);
  const isDirectUser = !isGroup && !isChannel;

  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'voice' | 'links' | 'members'>('media');
  const [isMuted, setIsMuted] = useState<boolean>(Boolean(conversation.isMuted));
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Live Fetched Bio & Media from Telegram API
  const [liveBio, setLiveBio] = useState<string | null>(conversation.bio || conversation.about || null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [fetchedMedia, setFetchedMedia] = useState<Record<string, any[]>>({
    media: [],
    photo: [],
    document: [],
    voice: [],
    url: [],
  });
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Fetch Full Info (real Bio)
  useEffect(() => {
    if (isTelegram && conversation.id) {
      telegramApi.getChatFull(conversation.id).then((full) => {
        if (full?.bio) {
          setLiveBio(full.bio);
        }
      });
    }
  }, [conversation.id, isTelegram]);

  // Fetch Group / Channel Participants
  useEffect(() => {
    if (isTelegram && (isGroup || isChannel) && conversation.id) {
      setLoadingParticipants(true);
      telegramApi.getParticipants(conversation.id, 100)
        .then((items) => {
          setParticipants(items || []);
        })
        .catch(() => {})
        .finally(() => {
          setLoadingParticipants(false);
        });
    }
  }, [conversation.id, isTelegram, isGroup, isChannel]);

  // Fetch Full Shared Media from Telegram
  useEffect(() => {
    if (isTelegram && conversation.id && activeTab !== 'members') {
      setLoadingMedia(true);
      const apiType = activeTab === 'media' ? 'media' : activeTab === 'files' ? 'document' : activeTab === 'voice' ? 'voice' : 'url';
      
      telegramApi.getSharedMedia(conversation.id, apiType, 100)
        .then((items) => {
          setFetchedMedia((prev) => ({
            ...prev,
            [apiType]: items || [],
          }));
        })
        .finally(() => {
          setLoadingMedia(false);
        });
    }
  }, [conversation.id, activeTab, isTelegram]);

  // Combine local active messages + remote MTProto fetched media
  const allMediaMessages = useMemo(() => {
    const apiType = activeTab === 'media' ? 'media' : activeTab === 'files' ? 'document' : activeTab === 'voice' ? 'voice' : 'url';
    const remote = fetchedMedia[apiType] || [];
    
    // Map with unique keys
    const map = new Map<number | string, any>();
    messages.forEach((m) => {
      if (m.id || m.rawId) map.set(m.rawId || m.id, m);
    });
    remote.forEach((m) => {
      if (m.id || m.rawId) map.set(m.rawId || m.id, m);
    });
    return Array.from(map.values());
  }, [messages, fetchedMedia, activeTab]);

  // 1. Photos & Videos (Multimedia)
  const sharedMedia = useMemo(() => {
    const list = isTelegram && fetchedMedia.media?.length > 0 ? fetchedMedia.media : allMediaMessages;
    return list
      .filter((m) => (m.mediaType === 'photo' || m.mediaType === 'video') && m.mediaUrl)
      .map((m) => ({
        id: m.id || m.rawId || `photo-${Math.random()}`,
        url: m.mediaUrl,
        isVideo: m.mediaType === 'video',
        duration: m.duration,
        date: m.date || m.timestamp || 'Recent',
      }));
  }, [allMediaMessages, fetchedMedia.media, isTelegram]);

  // 2. Documents
  const sharedFiles = useMemo(() => {
    const list = isTelegram && fetchedMedia.document.length > 0 ? fetchedMedia.document : allMediaMessages;
    return list
      .filter((m) => m.mediaType === 'document' && m.mediaUrl)
      .map((m) => ({
        id: m.id || m.rawId || `doc-${Math.random()}`,
        name: m.fileName || 'Document.pdf',
        size: m.fileSize || 'File',
        url: m.mediaUrl,
        date: m.date || m.timestamp || 'Recent',
      }));
  }, [allMediaMessages, fetchedMedia.document, isTelegram]);

  // 3. Voice Notes
  const sharedVoice = useMemo(() => {
    const list = isTelegram && fetchedMedia.voice.length > 0 ? fetchedMedia.voice : allMediaMessages;
    return list
      .filter((m) => (m.mediaType === 'voice' || m.mediaType === 'audio') && m.mediaUrl)
      .map((m) => ({
        id: m.id || m.rawId || `voice-${Math.random()}`,
        duration: m.duration ? `${Math.floor(m.duration / 60)}:${((m.duration || 0) % 60).toString().padStart(2, '0')}` : '0:18',
        url: m.mediaUrl,
        date: m.date || m.timestamp || 'Recent',
      }));
  }, [allMediaMessages, fetchedMedia.voice, isTelegram]);

  // 4. Links / URLs
  const sharedLinks = useMemo(() => {
    const list = isTelegram && fetchedMedia.url.length > 0 ? fetchedMedia.url : allMediaMessages;
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links: Array<{ id: string; url: string; title: string }> = [];
    list.forEach((m) => {
      if (m.text || m.content) {
        const text = m.text || m.content;
        const matches = text.match(linkRegex);
        if (matches) {
          matches.forEach((url: string, idx: number) => {
            let domain = url;
            try {
              domain = new URL(url).hostname;
            } catch (e) {}
            links.push({
              id: `link-${m.id}-${idx}`,
              url,
              title: domain || url,
            });
          });
        }
      }
    });
    return links;
  }, [allMediaMessages, fetchedMedia.url, isTelegram]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(
      isMuted ? (isKh ? 'បានបើកសម្លេង' : 'Unmuted') : (isKh ? 'បានបិទសម្លេង' : 'Muted'),
      `${conversation.name} notifications ${isMuted ? 'enabled' : 'muted'}`
    );
  };

  const handleCopyUsername = () => {
    const username = conversation.username ? `@${conversation.username}` : `@${conversation.name?.toLowerCase().replace(/\s+/g, '')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(username);
      toast.success(isKh ? 'បានចម្លង' : 'Copied', `${username} copied to clipboard`);
    }
  };

  const handleCopyPhone = () => {
    if (conversation.phone && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(conversation.phone);
      toast.success(isKh ? 'បានចម្លង' : 'Copied', `${conversation.phone} copied to clipboard`);
    }
  };

  const isBot = Boolean(conversation.isBot);

  const chatTypeText = isChannel
    ? isKh ? 'ឆានែល (Channel)' : 'Channel'
    : isGroup
    ? isKh ? 'ក្រុម (Group)' : 'Group'
    : isBot
    ? isKh ? 'បូត (Bot)' : 'Bot'
    : isKh ? 'គណនីផ្ទាល់ខ្លួន' : 'Direct Message';

  const realBioText = liveBio || conversation.bio || conversation.about;

  return (
    <View style={styles.sidebar}>
      {/* 1. Clean Title-Only Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isChannel
            ? isKh ? 'ព័ត៌មានឆានែល' : 'Channel Info'
            : isGroup
            ? isKh ? 'ព័ត៌មានក្រុម' : 'Group Info'
            : isKh ? 'ព័ត៌មានគណនី' : 'User Info'}
        </Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <RemixIcon name="close-line" size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 2. Hero Profile Section */}
        <View style={styles.profileSection}>
          <ModernAvatar
            name={conversation.name}
            avatarUrl={conversation.avatar || conversation.avatarUrl}
            size={72}
            showPresence={true}
            isOnline={Boolean(conversation.isOnline)}
          />
          <Text style={styles.userName} numberOfLines={2}>
            {conversation.name}
          </Text>

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{chatTypeText}</Text>
          </View>

          <Text style={[styles.userStatus, conversation.isOnline && styles.userStatusOnline]}>
            {isGroup || isChannel
              ? `${conversation.participantsCount || 'All'} ${isChannel ? (isKh ? 'អ្នកជាវ' : 'subscribers') : (isKh ? 'សមាជិក' : 'members')}`
              : conversation.isOnline
              ? (isKh ? 'កំពុងអនឡាញ' : 'online')
              : (isKh ? 'បានឃើញថ្មីៗនេះ' : 'last seen recently')}
          </Text>

          {/* Quick Actions Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toast.info('Call', `Calling ${conversation.name}...`)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <RemixIcon name="phone-line" size={19} color="#0284C7" />
              </View>
              <Text style={styles.actionLabel}>{isKh ? 'តេ' : 'Call'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleToggleMute}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconCircle, isMuted && styles.actionIconCircleMuted]}>
                <RemixIcon
                  name={isMuted ? 'notification-off-line' : 'bell-line'}
                  size={19}
                  color={isMuted ? '#EF4444' : '#0284C7'}
                />
              </View>
              <Text style={[styles.actionLabel, isMuted && { color: '#EF4444' }]}>
                {isMuted ? (isKh ? 'បានបិទ' : 'Muted') : (isKh ? 'សំឡេង' : 'Mute')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => toast.info('Search', isKh ? 'ស្វែងរកសារក្នុង Chat នេះ' : 'Search in this chat')}
              activeOpacity={0.75}
            >
              <View style={styles.actionIconCircle}>
                <RemixIcon name="search-line" size={19} color="#0284C7" />
              </View>
              <Text style={styles.actionLabel}>{isKh ? 'ស្វែងរក' : 'Search'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Account Details / Identifiers */}
        <View style={styles.infoSection}>
          {Boolean(conversation.phone) && (
            <TouchableOpacity style={styles.infoRow} onPress={handleCopyPhone} activeOpacity={0.7}>
              <View style={styles.infoIconWrap}>
                <RemixIcon name="phone-line" size={14} color="#0284C7" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoValue}>{conversation.phone}</Text>
                <Text style={styles.infoKey}>{isKh ? 'លេខទូរស័ព្ទ (Phone)' : 'Phone'}</Text>
              </View>
              <RemixIcon name="file-copy-line" size={13} color="#CBD5E1" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.infoRow} onPress={handleCopyUsername} activeOpacity={0.7}>
            <View style={styles.infoIconWrap}>
              <RemixIcon name="at-line" size={14} color="#0284C7" />
            </View>
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoValue}>
                {conversation.username
                  ? `@${conversation.username}`
                  : `@${conversation.name?.toLowerCase().replace(/\s+/g, '')}`}
              </Text>
              <Text style={styles.infoKey}>{isKh ? 'ឈ្មោះគណនី (Username)' : 'Username'}</Text>
            </View>
            <RemixIcon name="file-copy-line" size={13} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Only render Bio row if there is a real, non-empty Bio */}
          {Boolean(realBioText && realBioText.trim()) && (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#F8FAFC' }]}>
                <RemixIcon name="information-fill" size={14} color="#64748B" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoValue}>{realBioText}</Text>
                <Text style={styles.infoKey}>{isKh ? 'អំពី (Bio / About)' : 'Bio / About'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* 4. Shared Media & Content Tabs */}
        <View style={styles.mediaSection}>
          <View style={styles.mediaSectionHeader}>
            <Text style={styles.mediaSectionTitle}>{isKh ? 'មេឌៀ និងឯកសាររួម' : 'Shared Media'}</Text>
            {loadingMedia && <ActivityIndicator size="small" color="#0284C7" />}
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsRow}>
            {(isGroup || isChannel) && (
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
                onPress={() => setActiveTab('members')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
                  {isKh ? 'សមាជិក' : 'Members'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'media' && styles.tabBtnActive]}
              onPress={() => setActiveTab('media')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>
                {isKh ? 'រូបភាព' : 'Photos'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'files' && styles.tabBtnActive]}
              onPress={() => setActiveTab('files')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'files' && styles.tabTextActive]}>
                {isKh ? 'ឯកសារ' : 'Files'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'voice' && styles.tabBtnActive]}
              onPress={() => setActiveTab('voice')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'voice' && styles.tabTextActive]}>
                {isKh ? 'សំឡេង' : 'Voice'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'links' && styles.tabBtnActive]}
              onPress={() => setActiveTab('links')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'links' && styles.tabTextActive]}>
                {isKh ? 'តំណ' : 'Links'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 0: Members List (for groups / channels) */}
          {activeTab === 'members' && (
            <View style={styles.membersList}>
              {loadingParticipants ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#0284C7" />
                </View>
              ) : participants.length > 0 ? (
                participants.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <ModernAvatar
                      name={member.name}
                      avatarUrl={member.avatarUrl}
                      size={36}
                      showPresence={true}
                      isOnline={Boolean(member.isOnline)}
                    />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.name}
                        </Text>
                        {member.role === 'owner' ? (
                          <View style={styles.roleBadgeOwner}>
                            <Text style={styles.roleBadgeOwnerText}>{isKh ? 'មេក្រុម' : 'Owner'}</Text>
                          </View>
                        ) : member.role === 'admin' ? (
                          <View style={styles.roleBadgeAdmin}>
                            <Text style={styles.roleBadgeAdminText}>Admin</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.memberStatus} numberOfLines={1}>
                        {member.isOnline
                          ? (isKh ? 'កំពុងអនឡាញ' : 'online')
                          : member.username
                          ? `@${member.username}`
                          : (isKh ? 'បានឃើញថ្មីៗនេះ' : 'last seen recently')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <RemixIcon name="user-3-fill" size={28} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>{isKh ? 'មិនមានសមាជិកបង្ហាញទេ' : 'No members found'}</Text>
                </View>
              )}
            </View>
          )}

          {/* Tab 1: Photos Grid */}
          {activeTab === 'media' && (
            sharedMedia.length > 0 ? (
              <View style={styles.mediaGrid}>
                {sharedMedia.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridThumb}
                    onPress={() => setSelectedPhoto(item.url)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.url }} style={styles.thumbImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <RemixIcon name="image-line" size={24} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  {loadingMedia ? (isKh ? 'កំពុងទាញយករូបភាពពី Telegram...' : 'Fetching photos...') : (isKh ? 'មិនមានរូបភាពក្នុង Chat នេះទេ' : 'No shared photos')}
                </Text>
              </View>
            )
          )}

          {/* Tab 2: Files / Documents */}
          {activeTab === 'files' && (
            sharedFiles.length > 0 ? (
              <View style={styles.filesList}>
                {sharedFiles.map((file) => (
                  <TouchableOpacity
                    key={file.id}
                    style={styles.fileRow}
                    onPress={() => file.url && window.open(file.url, '_blank')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fileIconBox}>
                      <RemixIcon name="file-text-line" size={16} color="#0284C7" />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <Text style={styles.fileMeta}>{file.size} • {file.date}</Text>
                    </View>
                    <View style={styles.downloadIconBtn}>
                      <RemixIcon name="arrow-down-line" size={13} color="#64748B" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <RemixIcon name="file-text-line" size={24} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  {loadingMedia ? (isKh ? 'កំពុងទាញយកឯកសារពី Telegram...' : 'Fetching files...') : (isKh ? 'មិនមានឯកសារក្នុង Chat នេះទេ' : 'No shared files')}
                </Text>
              </View>
            )
          )}

          {/* Tab 3: Voice / Audio Notes */}
          {activeTab === 'voice' && (
            sharedVoice.length > 0 ? (
              <View style={styles.filesList}>
                {sharedVoice.map((voice) => (
                  <View key={voice.id} style={styles.fileRow}>
                    <TouchableOpacity
                      style={[styles.fileIconBox, { backgroundColor: '#F0FDF4' }]}
                      onPress={() => {
                        const audio = new Audio(voice.url);
                        audio.play().catch(() => toast.error('Error', 'Could not play voice note'));
                      }}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name="play-fill" size={14} color="#16A34A" />
                    </TouchableOpacity>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>Voice Message</Text>
                      <Text style={styles.fileMeta}>{voice.duration} • {voice.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <RemixIcon name="mic-line" size={24} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  {loadingMedia ? (isKh ? 'កំពុងទាញយកសារសំឡេងពី Telegram...' : 'Fetching voice notes...') : (isKh ? 'មិនមានសារសំឡេងក្នុង Chat នេះទេ' : 'No voice notes')}
                </Text>
              </View>
            )
          )}

          {/* Tab 4: Links / URLs */}
          {activeTab === 'links' && (
            sharedLinks.length > 0 ? (
              <View style={styles.filesList}>
                {sharedLinks.map((link) => (
                  <TouchableOpacity
                    key={link.id}
                    style={styles.fileRow}
                    onPress={() => window.open(link.url, '_blank')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.fileIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <RemixIcon name="link-line" size={14} color="#0284C7" />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>{link.title}</Text>
                      <Text style={styles.fileMeta} numberOfLines={1}>{link.url}</Text>
                    </View>
                    <RemixIcon name="arrow-right-line" size={12} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <RemixIcon name="link-line" size={24} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>
                  {loadingMedia ? (isKh ? 'កំពុងទាញយកតំណភ្ជាប់ពី Telegram...' : 'Fetching links...') : (isKh ? 'មិនមានតំណភ្ជាប់ក្នុង Chat នេះទេ' : 'No shared links')}
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* 5. Full-Screen Photo Lightbox Modal */}
      {selectedPhoto && (
        <Modal
          visible={Boolean(selectedPhoto)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.lightboxBackdrop}>
            <View style={styles.lightboxHeader}>
              <TouchableOpacity
                style={styles.lightboxActionBtn}
                onPress={() => window.open(selectedPhoto, '_blank')}
                activeOpacity={0.7}
              >
                <RemixIcon name="arrow-down-line" size={15} color="#FFFFFF" />
                <Text style={styles.lightboxBtnText}>{isKh ? 'ទាញយក' : 'Download'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lightboxCloseBtn}
                onPress={() => setSelectedPhoto(null)}
                activeOpacity={0.7}
              >
                <RemixIcon name="close-line" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.lightboxImageContainer}
              activeOpacity={1}
              onPress={() => setSelectedPhoto(null)}
            >
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scroll: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    textAlign: 'center',
  },
  typeBadge: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0284C7',
  },
  userStatus: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 4,
  },
  userStatusOnline: {
    color: '#16A34A',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 16,
    width: '100%',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: 'pointer',
  } as any,
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleMuted: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  actionLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0284C7',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as any,
  infoTextGroup: {
    flex: 1,
  },
  infoValue: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  infoKey: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  mediaSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mediaSectionTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridThumb: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  filesList: {
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  fileMeta: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  downloadIconBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyStateText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  membersList: {
    paddingVertical: 4,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  memberName: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  memberStatus: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  roleBadgeOwner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  roleBadgeOwnerText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#D97706',
  },
  roleBadgeAdmin: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  roleBadgeAdminText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0284C7',
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  lightboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    width: '100%',
    height: 48,
    paddingTop: 4,
    zIndex: 10,
  },
  lightboxActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    outlineStyle: 'none' as any,
  },
  lightboxBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
  },
  lightboxCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: 'none' as any,
  },
  lightboxImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lightboxImage: {
    maxWidth: '92%',
    maxHeight: '88%',
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});
