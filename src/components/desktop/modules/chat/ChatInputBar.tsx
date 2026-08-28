import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { RemixIcon } from '../../../ui/RemixIcon';
import { toast } from '../../../../store/useToastStore';
import { useThemeStore } from '../../../../store/useThemeStore';
import { chatStyles as styles } from './chatStyles';
import { AttachmentItem, EMOJI_CATEGORIES } from './chatTypes';

export interface ChatInputBarProps {
  activeConvName: string;
  chatSource: 'team' | 'telegram';
  editingMessage: any;
  replyingToMessage: any;
  onClearEdit: () => void;
  onClearReply: () => void;
  onSend: (text: string) => Promise<void>;
  onSendVoice?: (base64Audio: string, durationSeconds: number) => Promise<void>;
  isKh: boolean;
  onTyping?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = React.memo(({
  activeConvName,
  chatSource,
  editingMessage,
  replyingToMessage,
  onClearEdit,
  onClearReply,
  onSend,
  onSendVoice,
  isKh,
  onTyping,
}) => {
  const tokens = useThemeStore((s) => s.tokens);
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiMarkupMenu, setShowAiMarkupMenu] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || '');
    }
  }, [editingMessage]);

  const applyManualFormat = (formatType: 'bold' | 'italic' | 'strike' | 'code' | 'codeblock' | 'quote' | 'bullet') => {
    if (!text.trim()) {
      const templates = {
        bold: '**bold text**',
        italic: '*italic text*',
        strike: '~~strikethrough~~',
        code: '`code`',
        codeblock: '```\ncode block\n```',
        quote: '> quote text',
        bullet: '• list item',
      };
      setText(templates[formatType]);
      return;
    }

    switch (formatType) {
      case 'bold':
        setText((prev) => `**${prev.trim()}**`);
        break;
      case 'italic':
        setText((prev) => `*${prev.trim()}*`);
        break;
      case 'strike':
        setText((prev) => `~~${prev.trim()}~~`);
        break;
      case 'code':
        setText((prev) => `\`${prev.trim()}\``);
        break;
      case 'codeblock':
        setText((prev) => `\`\`\`\n${prev.trim()}\n\`\`\``);
        break;
      case 'quote':
        setText((prev) => `> ${prev.trim()}`);
        break;
      case 'bullet':
        setText((prev) =>
          prev
            .split('\n')
            .map((line) => (line.startsWith('• ') ? line : `• ${line}`))
            .join('\n')
        );
        break;
    }
  };

  const handleAiTransform = async (
    mode: 'format' | 'professional' | 'fix' | 'translate' | 'summarize'
  ) => {
    if (!text.trim() || isAiProcessing) {
      toast.info('AI Markup', 'Please type a message first to use AI formatting.');
      return;
    }

    const prompts: Record<string, string> = {
      format:
        'You are an expert chat message editor. Format the following text cleanly using Telegram Markdown with bolding on important keywords, clean linebreaks, and bullet points where suitable. Return ONLY the formatted message with no commentary.',
      professional:
        'Rewrite the following message into a polite, professional, and clear workplace communication tone in the same language. Output ONLY the rewritten text with no quotes.',
      fix:
        'Correct all spelling, grammatical, and typographical errors in the following message. Preserve the original meaning and language (Khmer or English). Output ONLY the corrected text.',
      translate:
        'Translate the following text: If it is in Khmer, translate it to natural English. If it is in English or another language, translate it to natural Khmer. Output ONLY the translated message.',
      summarize:
        'Summarize the key information of the following text into concise, formatted bullet points. Output ONLY the summary.',
    };

    try {
      setIsAiProcessing(true);
      toast.info('Gemini AI', 'Formatting your message with AI...');
      const res = await fetch('http://localhost:4000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: `${prompts[mode]}\n\nText:\n${text.trim()}`,
            },
          ],
        }),
      });

      const json = await res.json();
      const content = json?.data?.message?.content;
      if (content && typeof content === 'string') {
        setText(content.trim());
        toast.success('AI Markup Complete', 'Message enhanced successfully!');
      } else {
        throw new Error('No AI response received');
      }
    } catch (err: any) {
      toast.error('AI Error', err?.message || 'Failed to process AI markup');
    } finally {
      setIsAiProcessing(false);
      setShowAiMarkupMenu(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && attachments.length === 0) return;
    let fullMsg = text.trim();
    if (attachments.length > 0) {
      const attachInfo = attachments.map((a) => `[File: ${a.name}]`).join(' ');
      fullMsg = fullMsg ? `${fullMsg} ${attachInfo}` : attachInfo;
    }
    setText('');
    setAttachments([]);
    setShowEmojiPicker(false);
    await onSend(fullMsg);
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
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

  // True Browser Audio Recording with MediaRecorder API
  const startRecording = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        toast.error('Microphone Error', 'Microphone recording not supported in this browser');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
      toast.info('Recording', 'Speak into your microphone...');
    } catch (err: any) {
      console.error('Audio record error', err);
      toast.error('Microphone Permission', 'Please allow microphone access to record voice notes');
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
    toast.info('Cancelled', 'Voice recording cancelled');
  };

  const finishAndSendRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = recordingSeconds || 1;
    setIsRecording(false);
    setRecordingSeconds(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const resultStr = reader.result as string;
          const base64Data = resultStr ? resultStr.split(',')[1] : '';
          if (base64Data && onSendVoice) {
            await onSendVoice(base64Data, duration);
          }
        };
      };
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
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
      <View style={[styles.inputBar, { backgroundColor: tokens.surfaceBg, borderTopColor: tokens.borderSubtle }]}>
        {/* Reply / Quote Docked Bar */}
        {replyingToMessage && (
          <View style={[styles.replyPreviewBar, { backgroundColor: tokens.surfaceMuted, borderBottomColor: tokens.borderSubtle }]}>
            <View style={[styles.replyPreviewAccent, { backgroundColor: tokens.accentColor }]} />
            <View style={styles.replyPreviewInfo}>
              <Text style={[styles.replyPreviewSender, { color: tokens.accentColor }]} numberOfLines={1}>
                {replyingToMessage.senderName || 'User'}
              </Text>
              <Text style={[styles.replyPreviewText, { color: tokens.textSecondary }]} numberOfLines={1}>
                {replyingToMessage.text || (replyingToMessage.mediaType ? `[${replyingToMessage.mediaType}]` : 'Message')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClearReply}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RemixIcon name="close-line" size={13} color={tokens.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Message Docked Bar */}
        {editingMessage && (
          <View style={[styles.editPreviewBar, { backgroundColor: tokens.surfaceMuted, borderBottomColor: tokens.borderSubtle }]}>
            <RemixIcon name="pencil-line" size={13} color={tokens.accentColor} />
            <View style={styles.editPreviewInfo}>
              <Text style={[styles.editPreviewLabel, { color: tokens.accentColor }]}>{isKh ? 'កំពុងកែប្រែសារ' : 'Editing Message'}</Text>
              <Text style={[styles.editPreviewText, { color: tokens.textSecondary }]} numberOfLines={1}>
                {editingMessage.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                onClearEdit();
                setText('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RemixIcon name="close-line" size={13} color={tokens.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Attached Items Badges */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsRow}>
            {attachments.map((att) => (
              <View key={att.id} style={[styles.attachmentBadge, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                <RemixIcon name="file-text-line" size={12} color={tokens.accentColor} />
                <Text style={[styles.attachmentName, { color: tokens.textPrimary }]} numberOfLines={1}>
                  {att.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeAttachment(att.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <RemixIcon name="close-line" size={11} color={tokens.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {isRecording ? (
          /* Live Real Voice Recording Mode */
          <View style={[styles.inputCard, styles.inputCardRecording, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' }} />
              <Text style={{ fontSize: 13, fontFamily: 'Krasar-Bold', fontWeight: '700', color: '#EF4444' }}>
                {formatTimer(recordingSeconds)}
              </Text>
              <Text style={{ fontSize: 11.5, fontFamily: 'Krasar-Regular', color: tokens.textSecondary }}>
                {isKh ? 'កំពុងថតសំឡេង...' : 'Recording audio...'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: tokens.surfaceMuted, borderWidth: 1, borderColor: '#FECACA' }}
                onPress={cancelRecording}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, fontFamily: 'Krasar-Regular', color: '#EF4444' }}>
                  {isKh ? 'បោះបង់' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              {/* Send Voice Note Button */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, backgroundColor: '#16A34A' }}
                onPress={finishAndSendRecording}
                activeOpacity={0.8}
              >
                <RemixIcon name="send-plane-fill" size={12} color="#FFFFFF" />
                <Text style={{ fontSize: 11, fontFamily: 'Krasar-Bold', fontWeight: '700', color: '#FFFFFF' }}>
                  {isKh ? 'ផ្ញើសំឡេង' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Normal Message Input Box */
          <View
            style={[
              styles.inputCard,
              { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
              isFocused && { borderColor: tokens.accentColor },
            ]}
          >
            {/* AI Markup & Formatting Menu */}
            {showAiMarkupMenu && (
              <View style={[styles.aiMarkupBar, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
                <View style={styles.aiMarkupTopRow}>
                  <View style={styles.aiMarkupTitleRow}>
                    <RemixIcon name="sparkles-fill" size={12} color={tokens.accentColor} />
                    <Text style={[styles.aiMarkupTitleText, { color: tokens.textPrimary }]}>AI Markup & Format</Text>
                  </View>

                  {/* Quick Format Shortcuts */}
                  <View style={styles.aiFormatGroup}>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('bold')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>B</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('italic')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>I</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('strike')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('code')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>&lt;&gt;</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('quote')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>&quot;</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiFormatBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => applyManualFormat('bullet')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.aiFormatBtnText, { color: tokens.textPrimary }]}>•</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* AI One-Click Transformation Actions */}
                <View style={styles.aiActionsRow}>
                  <TouchableOpacity
                    style={[styles.aiActionChip, { backgroundColor: tokens.accentSoft }, isAiProcessing && { opacity: 0.6 }]}
                    onPress={() => handleAiTransform('format')}
                    disabled={isAiProcessing}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="sparkles-fill" size={11} color={tokens.accentColor} />
                    <Text style={[styles.aiActionChipText, { color: tokens.accentColor }]}>{isKh ? 'រៀបចំ Markdown' : 'Auto Markdown'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.aiActionChip, { backgroundColor: tokens.accentSoft }, isAiProcessing && { opacity: 0.6 }]}
                    onPress={() => handleAiTransform('professional')}
                    disabled={isAiProcessing}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="briefcase-line" size={11} color={tokens.accentColor} />
                    <Text style={[styles.aiActionChipText, { color: tokens.accentColor }]}>{isKh ? 'ភាសាផ្លូវការ' : 'Professional'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.aiActionChip, { backgroundColor: tokens.accentSoft }, isAiProcessing && { opacity: 0.6 }]}
                    onPress={() => handleAiTransform('fix')}
                    disabled={isAiProcessing}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="check-double-line" size={11} color={tokens.accentColor} />
                    <Text style={[styles.aiActionChipText, { color: tokens.accentColor }]}>{isKh ? 'កែអក្ខរាវិរុទ្ធ' : 'Fix Grammar'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.aiActionChip, { backgroundColor: tokens.accentSoft }, isAiProcessing && { opacity: 0.6 }]}
                    onPress={() => handleAiTransform('translate')}
                    disabled={isAiProcessing}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="chat-3-line" size={11} color={tokens.accentColor} />
                    <Text style={[styles.aiActionChipText, { color: tokens.accentColor }]}>{isKh ? 'បកប្រែ KH ⇄ EN' : 'Translate'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.aiActionChip, { backgroundColor: tokens.accentSoft }, isAiProcessing && { opacity: 0.6 }]}
                    onPress={() => handleAiTransform('summarize')}
                    disabled={isAiProcessing}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="task-line" size={11} color={tokens.accentColor} />
                    <Text style={[styles.aiActionChipText, { color: tokens.accentColor }]}>{isKh ? 'សង្ខេប' : 'Summarize'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TextInput
              style={[styles.textInput, { color: tokens.textPrimary }]}
              value={text}
              onChangeText={(val) => {
                setText(val);
                if (onTyping) onTyping();
              }}
              placeholder={`Message ${activeConvName}...`}
              placeholderTextColor={tokens.textMuted}
              onSubmitEditing={handleSend}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <View style={[styles.inputToolbar, { borderTopColor: tokens.borderSubtle }]}>
              <View style={styles.toolbarLeft}>
                {/* Emoji Button */}
                <TouchableOpacity
                  style={[styles.toolIconBtn, { backgroundColor: tokens.surfaceMuted }, showEmojiPicker && { backgroundColor: tokens.accentSoft }]}
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <RemixIcon
                    name="emotion-line"
                    size={15}
                    color={showEmojiPicker ? tokens.accentColor : tokens.textSecondary}
                  />
                </TouchableOpacity>

                {/* Attachment Button */}
                <TouchableOpacity
                  style={[styles.toolIconBtn, { backgroundColor: tokens.surfaceMuted }]}
                  onPress={handleAddAttachment}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <RemixIcon name="attachment-line" size={15} color={tokens.textSecondary} />
                </TouchableOpacity>

                {/* Voice Mic Button */}
                <TouchableOpacity
                  style={[styles.toolIconBtn, { backgroundColor: tokens.surfaceMuted }]}
                  onPress={startRecording}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <RemixIcon name="mic-line" size={15} color={tokens.textSecondary} />
                </TouchableOpacity>

                {/* AI Markup Button */}
                <TouchableOpacity
                  style={[
                    styles.toolIconBtn,
                    { backgroundColor: tokens.surfaceMuted },
                    showAiMarkupMenu && { backgroundColor: tokens.accentSoft },
                  ]}
                  onPress={() => setShowAiMarkupMenu(!showAiMarkupMenu)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <RemixIcon
                    name="sparkles-fill"
                    size={14}
                    color={tokens.accentColor}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.toolbarRight}>
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    { backgroundColor: tokens.accentColor },
                    (!text.trim() && attachments.length === 0) && { backgroundColor: tokens.surfaceMuted, borderWidth: 1, borderColor: tokens.borderSubtle },
                  ]}
                  onPress={handleSend}
                  disabled={!text.trim() && attachments.length === 0}
                  activeOpacity={0.8}
                >
                  <RemixIcon
                    name="send-plane-fill"
                    size={13}
                    color={(!text.trim() && attachments.length === 0) ? tokens.textMuted : tokens.accentFg}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
});
