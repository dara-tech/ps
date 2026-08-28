import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { CustomModal } from '../../../ui/CustomModal';
import { telegramApi } from '../../../../services/telegramApi';
import { chatStyles as styles } from './chatStyles';
import { formatMessageDate, renderFormattedMarkdown } from './chatHelpers';
import { QUICK_REACTION_EMOJIS, EMOJI_CATEGORIES } from './chatTypes';
import { toast } from '../../../../store/useToastStore';
import { useThemeStore } from '../../../../store/useThemeStore';
import { getBubbleBorderRadius } from '../../../../styles/theme';

interface ChatMessageListProps {
  messages: any[];
  currentUserId?: string;
  isTelegram: boolean;
  isGroup?: boolean;
  isKh: boolean;
  loadingMessages: boolean;
  loadingMoreMessages: boolean;
  hasMoreMessages: boolean;
  onLoadMoreMessages: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
  onReplyMessage: (msg: any) => void;
  onForwardMessage?: (msg: any) => void;
  onEditMessage: (msg: any) => void;
  onPinMessage: (msg: any) => void;
  onDeleteMessage: (msg: any) => void;
  onSendReaction: (msgId: number, emoji: string) => void;
  onPlayVoiceNote: (msgId: string | number, url: string, duration?: number) => void;
  playingAudioId: string | number | null;
  audioProgress: number;
  audioCurrentTime: number;
  onScroll: (e: any) => void;
  showScrollBottomBtn: boolean;
  onScrollToBottom: () => void;
  onPreviewPhoto: (url: string, albumItems?: { url: string; thumbUrl?: string; isVideo?: boolean }[], msgInfo?: any) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  isTelegram,
  isGroup,
  isKh,
  loadingMessages,
  loadingMoreMessages,
  hasMoreMessages,
  onLoadMoreMessages,
  scrollRef,
  onReplyMessage,
  onForwardMessage,
  onEditMessage,
  onPinMessage,
  onDeleteMessage,
  onSendReaction,
  onPlayVoiceNote,
  playingAudioId,
  audioProgress,
  audioCurrentTime,
  onScroll,
  showScrollBottomBtn,
  onScrollToBottom,
  onPreviewPhoto,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: any } | null>(null);
  const [showFullReactions, setShowFullReactions] = useState(false);
  const [seenModalMsg, setSeenModalMsg] = useState<any | null>(null);
  const [readParticipants, setReadParticipants] = useState<Array<{ id: string; name: string; avatarUrl?: string; date?: string }>>([]);
  const [loadingReadParticipants, setLoadingReadParticipants] = useState(false);
  const tokens = useThemeStore((state) => state.tokens);
  const mode = useThemeStore((state) => state.mode);
  const isDark = mode !== 'light';

  useEffect(() => {
    if (!seenModalMsg) {
      setReadParticipants([]);
      return;
    }
    if (isTelegram && seenModalMsg.chatId && seenModalMsg.id) {
      setLoadingReadParticipants(true);
      telegramApi
        .getMessageReadParticipants(seenModalMsg.chatId, seenModalMsg.id)
        .then((res) => {
          setReadParticipants(res || []);
        })
        .catch(() => {
          setReadParticipants([]);
        })
        .finally(() => {
          setLoadingReadParticipants(false);
        });
    }
  }, [seenModalMsg, isTelegram]);

  // Group consecutive photos/videos into albums when groupedId matches or sent consecutively
  const groupedItems = useMemo(() => {
    const result: any[] = [];
    let i = 0;
    while (i < messages.length) {
      const current = messages[i];
      const isMedia = (current.mediaType === 'photo' || current.mediaType === 'video') && Boolean(current.mediaUrl || current.thumbUrl);

      if (isMedia) {
        const albumPhotos: any[] = [current];
        let j = i + 1;
        while (j < messages.length) {
          const next = messages[j];
          const nextIsMedia = (next.mediaType === 'photo' || next.mediaType === 'video') && Boolean(next.mediaUrl || next.thumbUrl);
          const sameGroupedId = Boolean(current.groupedId && next.groupedId && current.groupedId === next.groupedId);
          const sameSenderConsecutive =
            !current.groupedId &&
            nextIsMedia &&
            next.senderId === current.senderId &&
            Math.abs((next.rawDate || 0) - (current.rawDate || 0)) < 60000;

          if (nextIsMedia && (sameGroupedId || sameSenderConsecutive)) {
            albumPhotos.push(next);
            j++;
          } else {
            break;
          }
        }

        if (albumPhotos.length > 1) {
          // Find any caption across all media items in the album
          const albumWithText = albumPhotos.find((p) => {
            const t = (p.text || p.caption || '').trim();
            return t && !/^\[(photo|document|voice|audio|video|sticker|file)\]$/i.test(t);
          });

          result.push({
            ...current,
            text: albumWithText?.text || albumWithText?.caption || current.text || '',
            isAlbum: true,
            albumPhotos,
            id: current.groupedId || `album-${current.id}`,
          });
          i = j;
          continue;
        }
      }

      result.push(current);
      i++;
    }
    return result;
  }, [messages]);

  const formatTimer = (sec?: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const s = Math.round(sec);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const rem = (s % 60).toString().padStart(2, '0');
    return `${m}:${rem}`;
  };

  const handleContextMenu = (e: any, msg: any) => {
    e.preventDefault();
    const clientX = e.clientX || (e.nativeEvent && e.nativeEvent.pageX) || 200;
    const clientY = e.clientY || (e.nativeEvent && e.nativeEvent.pageY) || 200;
    const menuWidth = 220;
    const menuHeight = 270;

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    let posX = clientX;
    if (posX + menuWidth > winW - 20) {
      posX = winW - menuWidth - 20;
    }

    let posY = clientY;
    // If opening in bottom half or near input bar, open upward
    if (posY + menuHeight > winH - 90) {
      posY = clientY - menuHeight;
      if (posY < 16) {
        posY = Math.max(16, winH - menuHeight - 90);
      }
    }

    setContextMenu({ x: Math.max(16, posX), y: Math.max(16, posY), msg });
    setShowFullReactions(false);
  };

  const prevContentHeightRef = useRef<number>(0);
  const isPrependingRef = useRef(false);

  useEffect(() => {
    if (loadingMoreMessages) {
      isPrependingRef.current = true;
    }
  }, [loadingMoreMessages]);

  const handleContentSizeChange = (_w: number, h: number) => {
    if (isPrependingRef.current && prevContentHeightRef.current > 0 && h > prevContentHeightRef.current) {
      const diff = h - prevContentHeightRef.current;
      (scrollRef as any)?.current?.scrollTo?.({ y: diff, animated: false });
      isPrependingRef.current = false;
    }
    prevContentHeightRef.current = h;
  };

  return (
    <View style={styles.feedContainer}>
      <ScrollView
        ref={scrollRef as any}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onContentSizeChange={handleContentSizeChange}
        {...({ maintainVisibleContentPosition: { minIndexForVisible: 1, autoscrollToTopThreshold: 10 } } as any)}
        scrollEventThrottle={16}
      >
        {/* Loading More Spinner at Top */}
        {loadingMoreMessages && (
          <View style={{ padding: 8, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#0284C7" />
          </View>
        )}

        {/* Telegram Instant Skeleton Shimmer when switching to a new chat */}
        {loadingMessages && groupedItems.length === 0 && (
          <View style={{ width: '100%', gap: 12, paddingVertical: 20 }}>
            <View style={{ width: 260, height: 42, borderRadius: 14, backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle, borderWidth: 1, alignSelf: 'flex-start' }} />
            <View style={{ width: 320, height: 180, borderRadius: 14, backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle, borderWidth: 1, alignSelf: 'flex-start' }} />
            <View style={{ width: 220, height: 38, borderRadius: 14, backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder, borderWidth: 1, alignSelf: 'flex-end' }} />
            <View style={{ width: 280, height: 50, borderRadius: 14, backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle, borderWidth: 1, alignSelf: 'flex-start' }} />
          </View>
        )}

        {groupedItems.map((msg, idx) => {
          const isMe = isTelegram ? msg.isOut : (msg.senderId === currentUserId || msg.isMe);
          const isVoice = msg.mediaType === 'voice' || msg.mediaType === 'audio';
          const isDoc = msg.mediaType === 'document';
          const isSticker = msg.mediaType === 'sticker';
          const isPhoto = msg.mediaType === 'photo';
          const isVideo = msg.mediaType === 'video';
          const isAlbum = Boolean(msg.isAlbum && msg.albumPhotos?.length > 1);

          // Extract real user text, filtering out automatic placeholders or filename labels
          const rawText = (msg.text || msg.content || '').trim();
          const isPlaceholder =
            /^\[(photo|document|voice|audio|video|sticker|file|voice message)\]$/i.test(rawText) ||
            rawText.startsWith('[File:') ||
            rawText.startsWith('voice_message') ||
            rawText.toLowerCase().endsWith('.ogg') ||
            rawText.toLowerCase().endsWith('.webm') ||
            rawText.toLowerCase().endsWith('.mp3') ||
            rawText.toLowerCase().endsWith('.wav') ||
            rawText.toLowerCase().endsWith('.mp4') ||
            rawText.toLowerCase().endsWith('.mov') ||
            rawText === msg.fileName ||
            (isVoice && !msg.caption);
          const captionText = isPlaceholder ? '' : rawText;

          // Strictly validate media and caption; do not render ghost/empty bubbles
          const hasValidMedia =
            (isPhoto && Boolean(msg.mediaUrl)) ||
            (isVideo && Boolean(msg.mediaUrl)) ||
            isAlbum ||
            (isVoice && Boolean(msg.mediaUrl)) ||
            (isDoc && Boolean(msg.mediaUrl)) ||
            (isSticker && (Boolean(msg.mediaUrl) || Boolean(msg.fileName)));

          if (!hasValidMedia && !captionText) {
            return null;
          }

          const isMediaOnly = (isPhoto || isAlbum || isVideo) && !captionText;
          const isMediaWithCaption = (isPhoto || isAlbum || isVideo) && Boolean(captionText);
          const isPhotoWithCaption = isMediaWithCaption;

          // Date Separator logic
          const prevMsg = idx > 0 ? groupedItems[idx - 1] : null;
          const currDate = msg.rawDate || msg.date || msg.timestamp || '';
          const prevDate = prevMsg ? (prevMsg.rawDate || prevMsg.date || prevMsg.timestamp || '') : '';
          const showDateSeparator = idx === 0 || (currDate && prevDate && formatMessageDate(currDate, isKh) !== formatMessageDate(prevDate, isKh));

          const bubbleBg = isMe ? tokens.bubbleOutgoing : tokens.bubbleIncoming;
          const bubbleBorder = isMe ? tokens.bubbleOutgoingBorder : tokens.bubbleIncomingBorder;
          const bubbleText = isMe ? tokens.bubbleOutgoingText : tokens.bubbleIncomingText;

          return (
            <React.Fragment key={`msg-${msg.id ?? ''}-${idx}`}>
              {showDateSeparator && (
                <View style={styles.dateSeparatorRow}>
                  <View style={[styles.dateSeparatorBadge, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle, borderWidth: 1 }]}>
                    <Text style={[styles.dateSeparatorText, { color: tokens.textSecondary }]}>
                      {formatMessageDate(currDate, isKh) || (isKh ? 'ថ្ងៃនេះ' : 'Today')}
                    </Text>
                  </View>
                </View>
              )}

              <View
                style={[styles.msgRow, isMe && styles.msgRowMe]}
                {...({
                  onContextMenu: (e: any) => handleContextMenu(e, msg),
                } as any)}
              >
                {Boolean(isGroup && !isMe) && (
                  <ModernAvatar
                    name={msg.senderName || 'User'}
                    avatarUrl={msg.senderAvatar}
                    size={28}
                  />
                )}

                <View style={styles.msgBubbleColumn}>
                  <View
                    style={[
                      isSticker
                        ? styles.msgBubbleSticker
                        : isMediaOnly
                        ? styles.msgBubblePhoto
                        : isMediaWithCaption
                        ? [
                            styles.msgBubbleWithCaption,
                            {
                              backgroundColor: bubbleBg,
                              borderColor: bubbleBorder,
                            },
                          ]
                        : [
                            styles.msgBubble,
                            getBubbleBorderRadius(tokens.bubbleStyle, isMe),
                            {
                              backgroundColor: bubbleBg,
                              borderColor: bubbleBorder,
                            },
                          ],
                      isVoice && styles.msgBubbleVoice,
                    ]}
                  >
                    {/* TikTok Character Corner Badges */}
                    {Boolean(isMe && tokens.tiktokBubbleDecor?.topLeft) && (
                      <Text style={styles.bubbleDecorTopLeft}>
                        {tokens.tiktokBubbleDecor?.topLeft}
                      </Text>
                    )}
                    {Boolean(isMe && tokens.tiktokBubbleDecor?.topRight) && (
                      <Text style={styles.bubbleDecorTopRight}>
                        {tokens.tiktokBubbleDecor?.topRight}
                      </Text>
                    )}
                    {Boolean(isMe && tokens.tiktokBubbleDecor?.bottomLeft) && (
                      <Text style={styles.bubbleDecorBottomLeft}>
                        {tokens.tiktokBubbleDecor?.bottomLeft}
                      </Text>
                    )}
                    {Boolean(isMe && tokens.tiktokBubbleDecor?.bottomRight) && (
                      <Text style={styles.bubbleDecorBottomRight}>
                        {tokens.tiktokBubbleDecor?.bottomRight}
                      </Text>
                    )}

                    {/* Forwarded from original sender */}
                    {Boolean(msg.fwdFrom) && (
                      <View style={styles.tgForwardHeader}>
                        <RemixIcon name="share-forward-line" size={12} color={isMe ? 'rgba(255, 255, 255, 0.85)' : tokens.accentColor} />
                        <Text style={[styles.tgForwardLabel, { color: isMe ? 'rgba(255, 255, 255, 0.85)' : tokens.textSecondary }]}>
                          {isKh ? 'បញ្ជូនបន្តពី' : 'Forwarded from'}{' '}
                          <Text style={[styles.tgForwardSender, { color: isMe ? '#FFFFFF' : tokens.accentColor }]}>
                            {msg.fwdFrom.senderName || 'Original Sender'}
                          </Text>
                        </Text>
                      </View>
                    )}

                    {/* Reply / Quote Preview */}
                    {Boolean(msg.replyToMsgId) && (
                      <View
                        style={[
                          styles.tgQuoteBox,
                          {
                            backgroundColor: isMe
                              ? 'rgba(0, 0, 0, 0.15)'
                              : tokens.surfaceMuted,
                            borderLeftColor: isMe ? '#FFFFFF' : tokens.accentColor,
                          },
                        ]}
                      >
                        <View style={[styles.tgQuoteAccent, { backgroundColor: isMe ? '#FFFFFF' : tokens.accentColor }]} />
                        <View style={styles.tgQuoteBody}>
                          <Text style={[styles.tgQuoteSender, { color: isMe ? '#FFFFFF' : tokens.accentColor }]} numberOfLines={1}>
                            {msg.replyToMsg?.senderName || 'Reply'}
                          </Text>
                          <Text style={[styles.tgQuoteText, { color: isMe ? 'rgba(255, 255, 255, 0.85)' : tokens.textSecondary }]} numberOfLines={1}>
                            {msg.replyToMsg?.text || 'Original message'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* 1. Document / File */}
                    {isDoc && (
                      <View style={styles.tgFileBubbleBlock}>
                        <View style={styles.tgFileMainRow}>
                          <TouchableOpacity
                            style={[styles.tgDownloadCircleBtn, { backgroundColor: isMe ? 'rgba(255, 255, 255, 0.2)' : tokens.accentColor }]}
                            onPress={() => msg.mediaUrl && window.open(msg.mediaUrl, '_blank')}
                            activeOpacity={0.8}
                          >
                            <RemixIcon name="arrow-down-line" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                          <View style={styles.tgFileInfoBox}>
                            <Text style={[styles.tgFileName, { color: bubbleText }]} numberOfLines={1}>
                              {msg.fileName || 'Document.pdf'}
                            </Text>
                            <View style={styles.tgFileSizeRow}>
                              <Text style={[styles.tgFileSize, { color: isMe ? 'rgba(255, 255, 255, 0.75)' : tokens.textSecondary }]}>{msg.fileSize || 'File'}</Text>
                              <Text style={[styles.tgFileDot, { color: isMe ? 'rgba(255, 255, 255, 0.6)' : tokens.textMuted }]}>•</Text>
                              <Text style={[styles.tgFileDownloadLink, { color: isMe ? '#FFFFFF' : tokens.accentColor }]}>Download</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.tgMsgMetaRow}>
                          {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color={isMe ? 'rgba(255, 255, 255, 0.85)' : tokens.accentColor} />}
                          {msg.isEdited && <Text style={[styles.tgEditedLabel, { color: isMe ? 'rgba(255, 255, 255, 0.7)' : tokens.textMuted }]}>edited</Text>}
                          <Text style={[styles.tgMsgTime, { color: isMe ? 'rgba(255, 255, 255, 0.75)' : tokens.textMuted }]}>
                            {msg.date || msg.timestamp}
                          </Text>
                          {isMe && (
                            <RemixIcon
                              name={msg.isSeen ? 'check-double-line' : 'check-line'}
                              size={13}
                              color="rgba(255, 255, 255, 0.9)"
                            />
                          )}
                        </View>
                      </View>
                    )}

                    {/* 2. Voice Note */}
                    {isVoice && (
                      <View style={styles.tgVoiceMainRow}>
                        <TouchableOpacity
                          style={[styles.tgVoicePlayBtn, { backgroundColor: tokens.accentColor }]}
                          onPress={() => onPlayVoiceNote(msg.id, msg.mediaUrl, msg.duration)}
                          activeOpacity={0.8}
                        >
                          <RemixIcon
                            name={playingAudioId === msg.id ? 'pause-fill' : 'play-fill'}
                            size={14}
                            color={tokens.accentFg}
                          />
                        </TouchableOpacity>

                        <View style={styles.tgVoiceRightCol}>
                          <View style={styles.tgVoiceWaveTrack}>
                            {[
                              2, 4, 8, 14, 8, 12, 4, 9, 15, 11, 6, 13, 8, 14, 10, 4, 12, 16, 6, 13,
                              10, 5, 11, 14, 8, 5, 10, 6, 13, 16, 9, 5, 12, 15, 10, 5, 11, 13, 7, 12,
                              9, 5, 10, 6
                            ].map((h, bIdx, arr) => {
                              const barProgress = bIdx / arr.length;
                              const isPlayed = playingAudioId === msg.id && barProgress <= audioProgress;
                              return (
                                <View
                                  key={bIdx}
                                  style={[
                                    styles.tgWaveBar,
                                    isMe ? styles.tgWaveBarMe : styles.tgWaveBarOther,
                                    isPlayed && (isMe ? styles.tgWaveBarMePlayed : styles.tgWaveBarOtherPlayed),
                                    { height: h }
                                  ]}
                                />
                              );
                            })}
                          </View>
                          <View style={styles.tgVoiceMetaRow}>
                            <Text style={[styles.tgVoiceDuration, { color: tokens.textSecondary }]}>
                              {playingAudioId === msg.id
                                ? formatTimer(audioCurrentTime)
                                : formatTimer(msg.duration)}
                            </Text>
                            <View style={styles.tgVoiceTimeBox}>
                              {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color={tokens.accentColor} />}
                              <Text style={[styles.tgVoiceTimeText, { color: tokens.textMuted }]}>
                                {msg.date || msg.timestamp}
                              </Text>
                              {isMe && (
                                <RemixIcon
                                  name={msg.isSeen ? 'check-double-line' : 'check-line'}
                                  size={12}
                                  color={isDark ? '#34D399' : '#16A34A'}
                                />
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* 3. Multi-Media Album Collage Grid */}
                    {isAlbum ? (
                      <View style={[styles.tgAlbumCollage, isMediaWithCaption && styles.tgAlbumCollageWithCaption]}>
                        {(() => {
                          const photos = msg.albumPhotos || [];
                          const count = photos.length;

                          const renderTile = (p: any, cellStyle: any, isLast = false, moreCount = 0) => {
                            if (!p) return null;
                            const isTileVideo = p.mediaType === 'video';
                            const tileUrl = p.thumbUrl || p.mediaUrl;

                            return (
                              <TouchableOpacity
                                key={p.id || `tile-${Math.random()}`}
                                style={[styles.tgAlbumCell, cellStyle]}
                                onPress={() =>
                                  onPreviewPhoto(
                                    p.mediaUrl,
                                    photos.map((item: any) => ({
                                      url: item.mediaUrl,
                                      thumbUrl: item.thumbUrl,
                                      isVideo: item.mediaType === 'video',
                                    })),
                                    msg
                                  )
                                }
                                activeOpacity={0.9}
                              >
                                {isTileVideo ? (
                                  <video
                                    src={p.mediaUrl}
                                    preload="metadata"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      pointerEvents: 'none',
                                      backgroundColor: '#0F172A',
                                    }}
                                  />
                                ) : (
                                  <Image source={{ uri: tileUrl }} style={styles.tgAlbumImage} resizeMode="cover" />
                                )}

                                {isTileVideo && (
                                  <>
                                    <View style={styles.tgVideoPlayOverlay}>
                                      <View style={[styles.tgVideoPlayBtn, { width: 34, height: 34, borderRadius: 17 }]}>
                                        <RemixIcon name="play-fill" size={16} color="#FFFFFF" />
                                      </View>
                                    </View>
                                    {Boolean(p.duration) && (
                                      <View style={[styles.tgVideoDurationBadge, { top: 4, left: 4, paddingHorizontal: 4, paddingVertical: 1 }]}>
                                        <Text style={[styles.tgVideoDurationText, { fontSize: 8.5 }]}>{formatTimer(p.duration)}</Text>
                                      </View>
                                    )}
                                  </>
                                )}
                                {isLast && moreCount > 0 && (
                                  <View style={styles.tgAlbumMoreOverlay}>
                                    <Text style={styles.tgAlbumMoreText}>+{moreCount}</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          };

                          if (count === 2) {
                            return (
                              <View style={[styles.tgAlbumRow, { height: 210 }]}>
                                {renderTile(photos[0], { borderTopLeftRadius: 11, borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                {renderTile(photos[1], { borderTopRightRadius: 11, borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 })}
                              </View>
                            );
                          }

                          if (count === 3) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 160 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 11, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[1], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[2], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          if (count === 4) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 140 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[1], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 140 }]}>
                                  {renderTile(photos[2], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[3], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          if (count === 5) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 160 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[1], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[2], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[3], { borderRadius: 3 })}
                                  {renderTile(photos[4], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          if (count === 6) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 135 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[1], { borderRadius: 3 })}
                                  {renderTile(photos[2], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 130 }]}>
                                  {renderTile(photos[3], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[4], { borderRadius: 3 })}
                                  {renderTile(photos[5], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          if (count === 7) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[1], { borderRadius: 3 })}
                                  {renderTile(photos[2], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[3], { borderRadius: 3 })}
                                  {renderTile(photos[4], { borderRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[5], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[6], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          if (count === 8) {
                            return (
                              <View style={{ width: '100%', gap: 3 }}>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[1], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[2], { borderRadius: 3 })}
                                  {renderTile(photos[3], { borderRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[4], { borderRadius: 3 })}
                                  {renderTile(photos[5], { borderRadius: 3 })}
                                </View>
                                <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                  {renderTile(photos[6], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                  {renderTile(photos[7], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 })}
                                </View>
                              </View>
                            );
                          }

                          // 9 or 10+ items (Exact match to Telegram Collage in Screenshot: Row 1 has 3 items, Row 2 has 2, Row 3 has 2, Row 4 has 2)
                          return (
                            <View style={{ width: '100%', gap: 3 }}>
                              <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                {renderTile(photos[0], { borderTopLeftRadius: 11, borderTopRightRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                                {renderTile(photos[1], { borderRadius: 3 })}
                                {renderTile(photos[2], { borderTopRightRadius: 11, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 })}
                              </View>
                              <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                {renderTile(photos[3], { borderRadius: 3 })}
                                {renderTile(photos[4], { borderRadius: 3 })}
                              </View>
                              <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                {renderTile(photos[5], { borderRadius: 3 })}
                                {renderTile(photos[6], { borderRadius: 3 })}
                              </View>
                              <View style={[styles.tgAlbumRow, { height: 120 }]}>
                                {renderTile(photos[7], { borderBottomLeftRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 })}
                                {renderTile(photos[8], { borderBottomRightRadius: isMediaWithCaption ? 3 : 11, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 3 }, count > 9, count - 9)}
                              </View>
                            </View>
                          );
                        })()}
                        
                        {/* Floating Time Pill only when NO caption */}
                        {!isPhotoWithCaption && (
                          <View style={styles.tgPhotoMetaPill}>
                            {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color="#FFFFFF" />}
                            <Text style={styles.tgPhotoTimeText}>{msg.date || msg.timestamp}</Text>
                            {isMe && (
                              <RemixIcon
                                name={msg.isSeen ? 'check-double-line' : 'check-line'}
                                size={12}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        )}
                      </View>
                    ) : /* Single Photo */
                    isPhoto && msg.mediaUrl ? (
                      isMediaOnly ? (
                        <TouchableOpacity
                          style={styles.tgPhotoContainer}
                          onPress={() => onPreviewPhoto(msg.mediaUrl, [{ url: msg.mediaUrl, thumbUrl: msg.thumbUrl, isVideo: false }], msg)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: msg.mediaUrl }} style={styles.tgPhotoImage} resizeMode="cover" />
                          <View style={styles.tgPhotoMetaPill}>
                            {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color="#FFFFFF" />}
                            <Text style={styles.tgPhotoTimeText}>{msg.date || msg.timestamp}</Text>
                            {isMe && (
                              <RemixIcon
                                name={msg.isSeen ? 'check-double-line' : 'check-line'}
                                size={12}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.tgPhotoCaptionContainer}
                          onPress={() => onPreviewPhoto(msg.mediaUrl, [{ url: msg.mediaUrl, thumbUrl: msg.thumbUrl, isVideo: false }], msg)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: msg.mediaUrl }} style={styles.tgPhotoImageWithCaption} resizeMode="cover" />
                        </TouchableOpacity>
                      )
                    ) : /* Video Message Card */
                    isVideo && msg.mediaUrl ? (
                      <TouchableOpacity
                        style={styles.tgVideoContainer}
                        onPress={() => onPreviewPhoto(msg.mediaUrl, [{ url: msg.mediaUrl, thumbUrl: msg.thumbUrl, isVideo: true }], msg)}
                        activeOpacity={0.9}
                      >
                        <video
                          src={msg.mediaUrl}
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none',
                            backgroundColor: '#0F172A',
                          }}
                        />
                        <View style={styles.tgVideoPlayOverlay}>
                          <View style={styles.tgVideoPlayBtn}>
                            <RemixIcon name="play-fill" size={24} color="#FFFFFF" />
                          </View>
                        </View>
                        {Boolean(msg.duration) && (
                          <View style={styles.tgVideoDurationBadge}>
                            <Text style={styles.tgVideoDurationText}>{formatTimer(msg.duration)}</Text>
                          </View>
                        )}
                        {!isMediaWithCaption && (
                          <View style={styles.tgPhotoMetaPill}>
                            {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color="#FFFFFF" />}
                            <Text style={styles.tgPhotoTimeText}>{msg.date || msg.timestamp}</Text>
                            {isMe && (
                              <RemixIcon
                                name={msg.isSeen ? 'check-double-line' : 'check-line'}
                                size={12}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : null}

                    {/* 4. Sticker */}
                    {isSticker && (
                      <View style={styles.tgStickerBox}>
                        {msg.mediaUrl ? (
                          <Image source={{ uri: msg.mediaUrl }} style={styles.tgStickerImage} resizeMode="contain" />
                        ) : (
                          <Text style={styles.tgStickerEmojiText}>
                            {msg.fileName && msg.fileName !== 'sticker' ? msg.fileName : '🌟'}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* 5. Real Text Content / Caption */}
                    {captionText && !isMediaOnly && !isSticker ? (
                      <View style={isMediaWithCaption ? styles.tgCaptionTextBox : null}>
                        <Text style={[styles.msgText, { color: bubbleText }]}>
                          {renderFormattedMarkdown(captionText, [styles.msgText, { color: bubbleText }], `msg-${msg.id}`)}
                        </Text>
                        {!isVoice && !isDoc && (
                          <View style={styles.tgMsgMetaRow}>
                            {msg.isPinned && <RemixIcon name="pushpin-fill" size={10} color={isMe ? 'rgba(255, 255, 255, 0.85)' : tokens.accentColor} />}
                            {msg.isEdited && <Text style={[styles.tgEditedLabel, { color: isMe ? 'rgba(255, 255, 255, 0.7)' : tokens.textMuted }]}>edited</Text>}
                            <Text style={[styles.tgMsgTime, { color: isMe ? 'rgba(255, 255, 255, 0.75)' : tokens.textMuted }]}>
                              {msg.date || msg.timestamp}
                            </Text>
                            {isMe && (
                              <RemixIcon
                                name={msg.isSeen ? 'check-double-line' : 'check-line'}
                                size={13}
                                color="rgba(255, 255, 255, 0.9)"
                              />
                            )}
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>

                  {/* Message Reactions Pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <View style={styles.tgReactionsRow}>
                      {msg.reactions.map((r: any, rIdx: number) => (
                        <TouchableOpacity
                          key={rIdx}
                          style={[
                            styles.tgReactionPill,
                            { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
                            r.isChosen && { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder },
                          ]}
                          onPress={() => onSendReaction(msg.id, r.emoticon)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.tgReactionEmoji}>{r.emoticon}</Text>
                          {r.count > 1 && (
                            <Text style={[styles.tgReactionCount, { color: tokens.textSecondary }, r.isChosen && { color: tokens.accentColor, fontWeight: '700' }]}>
                              {r.count}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Floating Scroll To Bottom Button */}
      {showScrollBottomBtn && (
        <TouchableOpacity
          style={[styles.floatingScrollBottomBtn, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}
          onPress={onScrollToBottom}
          activeOpacity={0.8}
        >
          <RemixIcon name="arrow-down-line" size={16} color={tokens.accentColor} />
        </TouchableOpacity>
      )}

      {/* Telegram Desktop Right-Click Context Menu */}
      {contextMenu && (
        <>
          <TouchableOpacity
            style={styles.tgContextMenuBackdrop}
            onPress={() => setContextMenu(null)}
            activeOpacity={1}
          />
          <View style={[styles.tgContextMenu, { top: contextMenu.y, left: contextMenu.x, backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
            {/* Quick Reactions Bar inside Menu */}
            <View style={[styles.tgContextMenuReactionsRow, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
              {QUICK_REACTION_EMOJIS.slice(0, 6).map((em) => (
                <TouchableOpacity
                  key={em}
                  style={styles.tgContextReactionBtn}
                  onPress={() => {
                    onSendReaction(contextMenu.msg.id, em);
                    setContextMenu(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tgContextReactionText}>{em}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.tgContextReactionBtn}
                onPress={() => setShowFullReactions(!showFullReactions)}
                activeOpacity={0.7}
              >
                <RemixIcon name="add-line" size={14} color={tokens.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Full Reactions Popout */}
            {showFullReactions && (
              <ScrollView style={{ maxHeight: 130, paddingVertical: 4, marginBottom: 4 }} showsVerticalScrollIndicator={false}>
                {EMOJI_CATEGORIES.map((cat, cIdx) => (
                  <View key={cIdx} style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Krasar-Bold', color: tokens.textMuted, marginBottom: 2 }}>{cat.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                      {cat.emojis.map((em, emIdx) => (
                        <TouchableOpacity
                          key={emIdx}
                          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                          onPress={() => {
                            onSendReaction(contextMenu.msg.id, em);
                            setContextMenu(null);
                          }}
                        >
                          <Text style={{ fontSize: 13 }}>{em}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={[styles.tgContextMenuDivider, { backgroundColor: tokens.borderSubtle }]} />

            {/* Reply */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                onReplyMessage(contextMenu.msg);
                setContextMenu(null);
              }}
              activeOpacity={0.7}
            >
              <RemixIcon name="reply-line" size={13} color={tokens.textSecondary} />
              <Text style={[styles.tgContextItemText, { color: tokens.textPrimary }]}>{isKh ? 'ឆ្លើយតប' : 'Reply'}</Text>
            </TouchableOpacity>

            {/* Forward */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                if (onForwardMessage) {
                  onForwardMessage(contextMenu.msg);
                }
                setContextMenu(null);
              }}
              activeOpacity={0.7}
            >
              <RemixIcon name="share-forward-line" size={13} color={tokens.textSecondary} />
              <Text style={[styles.tgContextItemText, { color: tokens.textPrimary }]}>{isKh ? 'បញ្ជូនបន្ត' : 'Forward'}</Text>
            </TouchableOpacity>

            {/* Copy Text */}
            {Boolean(contextMenu.msg.text || contextMenu.msg.content) && (
              <TouchableOpacity
                style={styles.tgContextMenuItem}
                onPress={() => {
                  const textToCopy = (contextMenu.msg.text || contextMenu.msg.content || '').trim();
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy);
                    toast.success(isKh ? 'បានចម្លង' : 'Copied', textToCopy);
                  }
                  setContextMenu(null);
                }}
                activeOpacity={0.7}
              >
                <RemixIcon name="file-copy-line" size={13} color={tokens.textSecondary} />
                <Text style={[styles.tgContextItemText, { color: tokens.textPrimary }]}>{isKh ? 'ចម្លងអត្ថបទ' : 'Copy Text'}</Text>
              </TouchableOpacity>
            )}

            {/* Pin / Unpin */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                onPinMessage(contextMenu.msg);
                setContextMenu(null);
              }}
              activeOpacity={0.7}
            >
              <RemixIcon
                name={contextMenu.msg.isPinned ? 'pushpin-fill' : 'pushpin-line'}
                size={13}
                color={contextMenu.msg.isPinned ? tokens.accentColor : tokens.textSecondary}
              />
              <Text style={[styles.tgContextItemText, { color: tokens.textPrimary }]}>
                {contextMenu.msg.isPinned ? (isKh ? 'ដក Pin សារ' : 'Unpin Message') : (isKh ? 'Pin សារនេះ' : 'Pin Message')}
              </Text>
            </TouchableOpacity>

            {/* Edit (if isMe) */}
            {((isTelegram && contextMenu.msg.isOut) || contextMenu.msg.senderId === currentUserId) &&
              Boolean(contextMenu.msg.text || contextMenu.msg.content) &&
              contextMenu.msg.mediaType !== 'voice' &&
              contextMenu.msg.mediaType !== 'sticker' && (
                <TouchableOpacity
                  style={styles.tgContextMenuItem}
                  onPress={() => {
                    onEditMessage(contextMenu.msg);
                    setContextMenu(null);
                  }}
                  activeOpacity={0.7}
                >
                  <RemixIcon name="pencil-line" size={13} color="#475569" />
                  <Text style={styles.tgContextItemText}>{isKh ? 'កែប្រែសារ' : 'Edit'}</Text>
                </TouchableOpacity>
              )}

            {/* Seen Info / Read Receipts */}
            <TouchableOpacity
              style={styles.tgContextMenuItem}
              onPress={() => {
                const targetMsg = contextMenu.msg;
                setContextMenu(null);
                setSeenModalMsg(targetMsg);
              }}
              activeOpacity={0.7}
            >
              <RemixIcon name="eye-line" size={13} color="#475569" />
              <Text style={styles.tgContextItemText}>
                {isKh
                  ? contextMenu.msg.views
                    ? `${contextMenu.msg.views} អ្នកបានមើល`
                    : 'ព័ត៌មានអ្នកបានមើល'
                  : contextMenu.msg.views
                  ? `${contextMenu.msg.views} Views`
                  : 'Seen / Read Info'}
              </Text>
            </TouchableOpacity>

            <View style={styles.tgContextMenuDivider} />

            {/* Delete */}
            <TouchableOpacity
              style={[styles.tgContextMenuItem, styles.tgContextMenuItemDanger]}
              onPress={() => {
                onDeleteMessage(contextMenu.msg);
                setContextMenu(null);
              }}
              activeOpacity={0.7}
            >
              <RemixIcon name="delete-bin-line" size={13} color="#EF4444" />
              <Text style={[styles.tgContextItemText, styles.tgContextItemTextDanger]}>
                {isKh ? 'លុបសារនេះ' : 'Delete Message'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Seen / Read Info Modal Dialog */}
      {seenModalMsg && (
        <CustomModal
          visible={Boolean(seenModalMsg)}
          onClose={() => setSeenModalMsg(null)}
          title={isKh ? 'ព័ត៌មានអ្នកបានមើល' : 'Message Seen & Read Info'}
          icon="eye-line"
          maxWidth={460}
        >
          <View style={styles.seenModalContent}>
            {/* Message Snippet Card */}
            <View style={styles.seenMessagePreviewCard}>
              <View style={styles.seenPreviewSenderRow}>
                <Text style={styles.seenPreviewSender}>
                  {seenModalMsg.senderName || (seenModalMsg.isOut ? 'You' : 'Sender')}
                </Text>
                <Text style={styles.seenPreviewTime}>{seenModalMsg.date || seenModalMsg.timestamp}</Text>
              </View>
              <Text style={styles.seenPreviewText} numberOfLines={3}>
                {seenModalMsg.text || seenModalMsg.content || `[${seenModalMsg.mediaType || 'Media Message'}]`}
              </Text>
            </View>

            {/* Overview Stats Badges */}
            <View style={styles.seenStatsRow}>
              <View style={styles.seenStatBadge}>
                <RemixIcon name="eye-line" size={13} color="#0284C7" />
                <Text style={styles.seenStatText}>
                  {seenModalMsg.views
                    ? `${seenModalMsg.views} ${isKh ? 'អ្នកបានមើល' : 'Views'}`
                    : readParticipants.length > 0
                    ? `${readParticipants.length} ${isKh ? 'អ្នកបានអាន' : 'Read'}`
                    : isKh
                    ? 'បានមើល'
                    : '1+ Views'}
                </Text>
              </View>

              <View style={styles.seenStatBadge}>
                <RemixIcon
                  name={seenModalMsg.isSeen ? 'check-double-line' : 'check-line'}
                  size={13}
                  color={seenModalMsg.isSeen ? '#10B981' : '#64748B'}
                />
                <Text
                  style={[
                    styles.seenStatText,
                    { color: seenModalMsg.isSeen ? '#059669' : '#64748B' },
                  ]}
                >
                  {seenModalMsg.isSeen
                    ? isKh
                      ? 'បានអាន (Delivered & Read)'
                      : 'Delivered & Read'
                    : isKh
                    ? 'បានផ្ញើ (Sent)'
                    : 'Sent'}
                </Text>
              </View>
            </View>

            {/* Read Participants Header & List */}
            <Text style={styles.seenListTitle}>
              {isKh ? 'សមាជិកដែលបានមើល (Seen Participants)' : 'Participants Who Read This'}
            </Text>

            {loadingReadParticipants ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0284C7" />
              </View>
            ) : readParticipants.length > 0 ? (
              <ScrollView style={styles.seenParticipantsScroll} showsVerticalScrollIndicator={false}>
                {readParticipants.map((p) => (
                  <View key={p.id} style={styles.seenParticipantItem}>
                    <ModernAvatar name={p.name} avatarUrl={p.avatarUrl} size={30} />
                    <View style={styles.seenParticipantInfo}>
                      <Text style={styles.seenParticipantName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      {p.date && <Text style={styles.seenParticipantTime}>{p.date}</Text>}
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: 'Krasar-Regular', color: '#94A3B8' }}>
                  {isKh
                    ? 'សារនេះត្រូវបានអានរួចរាល់ដោយសមាជិកក្នុង Group / Chat'
                    : 'This message has been read by participants in this chat.'}
                </Text>
              </View>
            )}
          </View>
        </CustomModal>
      )}
    </View>
  );
};
