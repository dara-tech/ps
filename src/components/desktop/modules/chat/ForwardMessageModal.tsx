import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTelegramStore } from '../../../../store/useTelegramStore';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { RemixIcon } from '../../../ui/RemixIcon';
import { ModernAvatar } from '../../../ui/ModernAvatar';
import { TelegramDialog } from '../../../../services/telegramApi';

export const ForwardMessageModal: React.FC = () => {
  const isForwardModalOpen = useTelegramStore((state) => state.isForwardModalOpen);
  const forwardingMessage = useTelegramStore((state) => state.forwardingMessage);
  const forwardMessageIds = useTelegramStore((state) => state.forwardMessageIds);
  const shareText = useTelegramStore((state) => state.shareText);
  const shareTitle = useTelegramStore((state) => state.shareTitle);
  const closeForwardModal = useTelegramStore((state) => state.closeForwardModal);
  const forwardMessage = useTelegramStore((state) => state.forwardMessage);
  const dialogs = useTelegramStore((state) => state.dialogs);
  const currentChatId = useTelegramStore((state) => state.activeChatId);
  const isKh = useLanguageStore((state) => state.language === 'kh');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [hideAuthor, setHideAuthor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter dialogs by search query, excluding channel read-only if not permitted
  const filteredDialogs = useMemo(() => {
    if (!searchQuery.trim()) return dialogs;
    const q = searchQuery.toLowerCase().trim();
    return dialogs.filter((d) => d.name.toLowerCase().includes(q) || (d.username && d.username.toLowerCase().includes(q)));
  }, [dialogs, searchQuery]);

  const handleSend = async () => {
    if (!selectedChatId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await forwardMessage(selectedChatId, hideAuthor);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isForwardModalOpen || (!forwardingMessage && !shareText)) return null;

  const isShareMode = Boolean(shareText);
  const count = isShareMode ? 1 : (forwardMessageIds.length || 1);

  return (
    <Modal
      visible={isForwardModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={closeForwardModal}
    >
      <Pressable style={styles.backdrop} onPress={closeForwardModal}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* 1. Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isShareMode
                ? (isKh ? 'ផ្ញើទៅកាន់ Telegram' : 'Send to Telegram')
                : (isKh ? 'បញ្ជូនសារបន្តទៅកាន់' : 'Forward to')}
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeForwardModal}
              activeOpacity={0.7}
            >
              <RemixIcon name="close-line" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* 2. Search Input */}
          <View style={styles.searchWrapper}>
            <RemixIcon name="search-line" size={15} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder={isKh ? 'ស្វែងរកការសន្ទនា...' : 'Search chats...'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {Boolean(searchQuery) && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <RemixIcon name="close-line" size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Dialogs List */}
          <ScrollView style={styles.dialogsList} showsVerticalScrollIndicator={false}>
            {filteredDialogs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  {isKh ? 'មិនមានការសន្ទនាត្រូវបានរកឃើញទេ' : 'No chats found'}
                </Text>
              </View>
            ) : (
              filteredDialogs.map((d: TelegramDialog) => {
                const isSelected = selectedChatId === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dialogItem, isSelected && styles.dialogItemSelected]}
                    onPress={() => setSelectedChatId(d.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.avatarWrap}>
                      <ModernAvatar
                        avatarUrl={d.avatarUrl}
                        name={d.name}
                        size={40}
                        showPresence={Boolean(d.isOnline)}
                        isOnline={Boolean(d.isOnline)}
                      />
                    </View>

                    <View style={styles.dialogInfo}>
                      <View style={styles.dialogNameRow}>
                        <Text style={styles.dialogName} numberOfLines={1}>
                          {d.name}
                        </Text>
                        {d.isChannel && (
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>Channel</Text>
                          </View>
                        )}
                        {d.isGroup && (
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>Group</Text>
                          </View>
                        )}
                        {d.isBot && (
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>Bot</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.dialogUsername} numberOfLines={1}>
                        {d.username ? `@${d.username}` : (d.isUser ? (d.userStatus || 'Telegram User') : `${d.participantsCount || ''} members`)}
                      </Text>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <RemixIcon name="check-line" size={12} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* 4. Bottom Send Actions */}
          <View style={styles.footer}>
            {/* Toggle: Hide Author Name (Only in forward mode) */}
            {!isShareMode && (
              <TouchableOpacity
                style={styles.hideAuthorRow}
                onPress={() => setHideAuthor(!hideAuthor)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxBox, hideAuthor && styles.checkboxBoxChecked]}>
                  {hideAuthor && <RemixIcon name="check-line" size={10} color="#FFFFFF" />}
                </View>
                <Text style={styles.hideAuthorLabel}>
                  {isKh ? 'លាក់ឈ្មោះម្ចាស់សារដើម (Drop Author)' : 'Hide sender name (Drop author)'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Send / Cancel Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeForwardModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{isKh ? 'បោះបង់' : 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!selectedChatId || isSubmitting) && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!selectedChatId || isSubmitting}
                activeOpacity={0.8}
              >
                <RemixIcon name="share-forward-fill" size={14} color="#FFFFFF" />
                <Text style={styles.sendBtnText}>
                  {isSubmitting
                    ? (isKh ? 'កំពុងបញ្ជូន...' : 'Forwarding...')
                    : (isKh ? `បញ្ជូនទៅកាន់ (${count})` : `Forward (${count})`)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    outlineStyle: 'none' as any,
    padding: 0,
  },
  dialogsList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  dialogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 1,
  },
  dialogItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  avatarWrap: {
    width: 40,
    height: 40,
  },
  dialogInfo: {
    flex: 1,
    minWidth: 0,
  },
  dialogNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dialogName: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
    flexShrink: 1,
  },
  dialogUsername: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeBadgeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
    gap: 8,
  },
  hideAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  hideAuthorLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#0284C7',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
