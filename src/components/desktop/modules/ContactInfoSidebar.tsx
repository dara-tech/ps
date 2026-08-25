import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChatConversation } from '../../../../shared';
import { RemixIcon } from '../../ui/RemixIcon';
import { ModernAvatar } from '../../ui/ModernAvatar';
import { toast } from '../../../store/useToastStore';

interface ContactInfoSidebarProps {
  conversation: ChatConversation;
  onClose: () => void;
}

export const ContactInfoSidebar: React.FC<ContactInfoSidebarProps> = ({
  conversation,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'links' | 'media'>('files');
  const [isMuted, setIsMuted] = useState(false);

  const sharedFiles = [
    { id: '1', name: 'Q3_Sprint_Roadmap.pdf', size: '2.4 MB', date: 'Today, 10:30 AM', icon: 'file-text-line' },
    { id: '2', name: 'Backend_Architecture_v2.docx', size: '1.8 MB', date: 'Yesterday', icon: 'file-text-line' },
    { id: '3', name: 'Enterprise_API_Schema.json', size: '450 KB', date: 'Aug 22', icon: 'file-text-line' },
    { id: '4', name: 'Design_Tokens_2027.fig', size: '14.2 MB', date: 'Aug 19', icon: 'file-text-line' },
  ];

  const sharedLinks = [
    { id: '1', title: 'Quantum Enterprise Figma', url: 'https://figma.com/file/quantum-2027' },
    { id: '2', title: 'Backend REST API Swagger', url: 'http://localhost:4000/docs' },
    { id: '3', title: 'Sprint Board Milestones', url: 'https://linear.app/quantum/sprint-3' },
  ];

  const handleCall = () => {
    toast.info('Audio Call', `Calling ${conversation.name}...`);
  };

  const handleVideo = () => {
    toast.info('Video Call', `Starting encrypted video call with ${conversation.name}...`);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Unmuted' : 'Muted', `${conversation.name} notifications ${isMuted ? 'enabled' : 'muted'}`);
  };

  return (
    <View style={styles.sidebar}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Info</Text>
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
        {/* 2. Large Avatar & Identity */}
        <View style={styles.profileSection}>
          <ModernAvatar
            name={conversation.name}
            avatarUrl={conversation.avatar}
            size={60}
            showPresence={true}
            isOnline={conversation.isOnline}
          />
          <Text style={styles.userName}>{conversation.name}</Text>
          <Text style={[styles.userStatus, conversation.isOnline && styles.userStatusOnline]}>
            {conversation.isOnline ? 'online' : 'offline'}
          </Text>

          {/* Quick Actions Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionPill} onPress={handleCall} activeOpacity={0.75}>
              <View style={styles.actionIconBox}>
                <RemixIcon name="phone-line" size={15} color="#2A9D8F" />
              </View>
              <Text style={styles.actionLabel}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill} onPress={handleVideo} activeOpacity={0.75}>
              <View style={styles.actionIconBox}>
                <RemixIcon name="vidicon-line" size={15} color="#3B82F6" />
              </View>
              <Text style={styles.actionLabel}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill} onPress={handleToggleMute} activeOpacity={0.75}>
              <View style={[styles.actionIconBox, isMuted && styles.actionIconBoxMuted]}>
                <RemixIcon
                  name={isMuted ? 'notification-off-line' : 'bell-line'}
                  size={15}
                  color={isMuted ? '#EF4444' : '#64748B'}
                />
              </View>
              <Text style={styles.actionLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. User Details Card */}
        <View style={styles.infoCard}>
          {conversation.phone && (
            <View style={styles.infoRow}>
              <RemixIcon name="phone-line" size={13} color="#94A3B8" />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoValue}>{conversation.phone}</Text>
                <Text style={styles.infoKey}>Mobile</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <RemixIcon name="mail-line" size={13} color="#94A3B8" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoValue}>
                {conversation.email || `${conversation.name.toLowerCase().replace(' ', '.')}@quantumcorp.io`}
              </Text>
              <Text style={styles.infoKey}>Work Email</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <RemixIcon name="user-line" size={13} color="#94A3B8" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoValue}>@{conversation.name.toLowerCase().replace(' ', '')}</Text>
              <Text style={styles.infoKey}>Username</Text>
            </View>
          </View>
        </View>

        {/* 4. Telegram-style Shared Media & Files */}
        <View style={styles.mediaSection}>
          {/* Tab Selector */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'files' && styles.tabBtnActive]}
              onPress={() => setActiveTab('files')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'files' && styles.tabTextActive]}>
                Files
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'links' && styles.tabBtnActive]}
              onPress={() => setActiveTab('links')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'links' && styles.tabTextActive]}>
                Links
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'media' && styles.tabBtnActive]}
              onPress={() => setActiveTab('media')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>
                Media
              </Text>
            </TouchableOpacity>
          </View>

          {/* Files List */}
          {activeTab === 'files' && (
            <View style={styles.itemsList}>
              {sharedFiles.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileItem}
                  activeOpacity={0.75}
                  onPress={() => toast.success('Download Started', `Downloading ${file.name}`)}
                >
                  <View style={styles.fileIconBox}>
                    <RemixIcon name="file-text-line" size={14} color="#2A9D8F" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <Text style={styles.fileMeta}>{file.size} • {file.date}</Text>
                  </View>
                  <RemixIcon name="download-line" size={13} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Links List */}
          {activeTab === 'links' && (
            <View style={styles.itemsList}>
              {sharedLinks.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={styles.fileItem}
                  activeOpacity={0.75}
                  onPress={() => toast.info('Open Link', link.url)}
                >
                  <View style={[styles.fileIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <RemixIcon name="link-line" size={14} color="#3B82F6" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{link.title}</Text>
                    <Text style={styles.fileMeta} numberOfLines={1}>{link.url}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Media Grid Placeholder */}
          {activeTab === 'media' && (
            <View style={styles.mediaEmpty}>
              <RemixIcon name="image-line" size={24} color="#CBD5E1" />
              <Text style={styles.mediaEmptyText}>No shared photos or videos</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    height: '100%',
  },
  header: {
    height: 44,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 24,
    height: 24,
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userName: {
    fontSize: 14.5,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
    letterSpacing: -0.2,
  },
  userStatus: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  userStatusOnline: {
    color: '#10B981',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
  },
  actionPill: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBoxMuted: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#64748B',
  },
  infoCard: {
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoValue: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#0F172A',
  },
  infoKey: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  mediaSection: {
    padding: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    padding: 2,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 5,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tabText: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  itemsList: {
    gap: 6,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  fileIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#334155',
  },
  fileMeta: {
    fontSize: 9.5,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
  mediaEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  mediaEmptyText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
});
