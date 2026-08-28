import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { chatStyles as styles } from './chatStyles';
import { getConversationStatusText } from './chatHelpers';
import { useTelegramStore } from '../../../../store/useTelegramStore';
import { useThemeStore } from '../../../../store/useThemeStore';

interface ChatHeaderProps {
  activeConv: any;
  chatSource: 'team' | 'telegram';
  isKh: boolean;
  showProfileSidebar: boolean;
  onToggleProfileSidebar: () => void;
  onOpenSettingsModal: () => void;
  onSearchInChat: () => void;
  onCall: () => void;
  onVideo: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeConv,
  chatSource,
  isKh,
  showProfileSidebar,
  onToggleProfileSidebar,
  onOpenSettingsModal,
  onSearchInChat,
  onCall,
  onVideo,
}) => {
  const typingStatus = useTelegramStore((s) => s.typingStatus);
  const tokens = useThemeStore((s) => s.tokens);

  if (!activeConv) return null;

  const isTelegram = chatSource === 'telegram';
  const statusText = getConversationStatusText(activeConv, isTelegram, isKh);
  const isDirectOnline = Boolean(
    activeConv.isOnline && !activeConv.isGroup && !activeConv.isChannel && !activeConv.isBot
  );

  const typingInfo = typingStatus[activeConv.id];
  const isTyping = Boolean(typingInfo?.isTyping);
  const isRecording = typingInfo?.action === 'recording';
  const isUploading = typingInfo?.action === 'uploading';
  const typingLabel = isRecording
    ? (isKh ? 'កំពុងថតសំឡេង...' : 'recording voice...')
    : isUploading
    ? (isKh ? 'កំពុងផ្ញើឯកសារ...' : 'uploading file...')
    : (isKh ? 'កំពុងវាយអក្សរ...' : 'typing...');

  const pinnedMsg = activeConv.messages?.find((m: any) => m.isPinned);

  return (
    <>
      {/* Top Header Bar */}
      <View style={[styles.detailHeader, { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle }]}>
        <TouchableOpacity
          style={styles.detailHeaderLeft}
          onPress={onToggleProfileSidebar}
          activeOpacity={0.7}
        >
          <ModernAvatar
            name={activeConv.name}
            avatarUrl={activeConv.avatar || activeConv.avatarUrl}
            size={28}
            showPresence={true}
            isOnline={Boolean(activeConv.isOnline)}
          />

          <View>
            <Text style={[styles.detailTitle, { color: tokens.textPrimary }]}>{activeConv.name}</Text>
            {isTyping ? (
              <Text style={[styles.detailSub, { color: tokens.accentColor, fontFamily: 'Krasar-Bold' }]}>
                {typingLabel}
              </Text>
            ) : (
              <Text style={[styles.detailSub, { color: tokens.textSecondary }, isDirectOnline && styles.detailSubOnline]}>
                {statusText}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.detailHeaderRight}>
          {isTelegram ? (
            <>
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                onPress={onSearchInChat}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon name="search-line" size={14} color={tokens.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                onPress={onOpenSettingsModal}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon name="settings-3-line" size={14} color={tokens.accentColor} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.headerActionBtn,
                  { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                  showProfileSidebar && { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder },
                ]}
                onPress={onToggleProfileSidebar}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon
                  name="information-fill"
                  size={14}
                  color={showProfileSidebar ? tokens.accentColor : tokens.textSecondary}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                onPress={onCall}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon name="phone-line" size={14} color={tokens.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                onPress={onVideo}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon name="vidicon-line" size={14} color={tokens.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.headerActionBtn,
                  { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                  showProfileSidebar && { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder },
                ]}
                onPress={onToggleProfileSidebar}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RemixIcon
                  name="more-2-fill"
                  size={13}
                  color={showProfileSidebar ? '#0F172A' : '#64748B'}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Pinned Message Top Banner */}
      {pinnedMsg && (
        <View style={styles.pinnedBanner}>
          <View style={styles.pinnedAccentBar} />
          <View style={styles.pinnedInfo}>
            <Text style={styles.pinnedLabel}>{isKh ? 'សារបាន Pin' : 'Pinned Message'}</Text>
            <Text style={styles.pinnedText} numberOfLines={1}>
              {pinnedMsg.content || pinnedMsg.text || `[${pinnedMsg.mediaType || 'Media'}]`}
            </Text>
          </View>
          <RemixIcon name="pushpin-fill" size={13} color="#0284C7" />
        </View>
      )}
    </>
  );
};
