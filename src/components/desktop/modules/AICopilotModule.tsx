import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useTelegramStore } from '../../../store/useTelegramStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { RichMarkdownView } from '../../ui/RichMarkdownView';
import { CustomSelect } from '../../ui/CustomSelect';
import { toast } from '../../../store/useToastStore';

interface AttachmentItem {
  id: string;
  name: string;
  type: 'code' | 'doc' | 'image' | 'data';
  size: string;
}

const SLASH_COMMANDS = [
  { cmd: '/goal', desc: 'Break down a project or goal into subtasks', prompt: 'Break down my goal to: ' },
  { cmd: '/expense', desc: 'Parse and record a financial transaction', prompt: 'Spent $ for ' },
  { cmd: '/task', desc: 'Add priority task to daily planner', prompt: 'Create high priority task: ' },
  { cmd: '/code', desc: 'Ask for code architecture or review', prompt: 'Review and optimize this code: ' },
  { cmd: '/summary', desc: 'Generate daily work briefing', prompt: 'Summarize my work and focus areas for today.' },
];

export const AICopilotModule: React.FC = () => {
  const aiModels = useDesktopStore((state) => state.aiModels);
  const selectedModel = useDesktopStore((state) => state.selectedModel);
  const setSelectedModel = useDesktopStore((state) => state.setSelectedModel);
  const isAiOnline = useDesktopStore((state) => state.isAiOnline);
  const aiMessages = useDesktopStore((state) => state.aiMessages);
  const isAiThinking = useDesktopStore((state) => state.isAiThinking);
  const sendAiMessage = useDesktopStore((state) => state.sendAiMessage);
  const clearAiMessages = useDesktopStore((state) => state.clearAiMessages);
  const breakdownGoalWithAi = useDesktopStore((state) => state.breakdownGoalWithAi);
  const logExpenseWithAi = useDesktopStore((state) => state.logExpenseWithAi);
  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const marketItems = useDesktopStore((state) => state.marketItems);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);
  const ghostSettings = useTelegramStore((state) => state.ghostSettings);

  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const todaySpent = useMemo(() => finances.filter((f) => f.type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0), [finances]);
  const monthIncome = useMemo(() => finances.filter((f) => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0), [finances]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [input, setInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const recordingTimerRef = useRef<any>(null);

  const scrollToBottom = (animated = true) => {
    scrollRef.current?.scrollToEnd({ animated });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [aiMessages.length, isAiThinking]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isAiThinking) return;

    let fullText = input.trim();
    if (attachments.length > 0) {
      const attachInfo = attachments.map((a) => `[Attached: ${a.name} (${a.type})]`).join(' ');
      fullText = fullText ? `${fullText}\n\n${attachInfo}` : attachInfo;
    }

    setInput('');
    setAttachments([]);
    setShowSlashMenu(false);

    sendAiMessage(fullText);
    scrollToBottom(true);
  };

  const handleRegenerate = () => {
    if (isAiThinking) return;
    const userMsgs = aiMessages.filter((m) => m.role === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    sendAiMessage(lastUserMsg.content);
    scrollToBottom(true);
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_>-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddAttachment = () => {
    const sampleFiles: AttachmentItem[] = [
      { id: `att-${Date.now()}-1`, name: 'AppArchitecture.ts', type: 'code', size: '4.2 KB' },
      { id: `att-${Date.now()}-2`, name: 'Q3_Financial_Log.csv', type: 'data', size: '12.8 KB' },
      { id: `att-${Date.now()}-3`, name: 'ProjectRoadmap.pdf', type: 'doc', size: '180 KB' },
    ];
    const picked = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setAttachments((prev) => [...prev, picked]);
    toast.success('File Attached', `${picked.name} added as context.`);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setInput((prev) => (prev ? `${prev} [Voice note query]` : 'Review my daily priorities.'));
      toast.info('Voice Input', 'Audio transcribed to text.');
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    toast.success('Copied', 'Message content copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openShareTextModal = useTelegramStore((state) => state.openShareTextModal);
  const isTelegramConnected = useTelegramStore((state) => state.isConnected);

  const handleForwardToTelegram = (content: string) => {
    openShareTextModal(content, 'AI Copilot Response');
  };

  const promptSuggestions = [
    { label: 'Plan a goal', prompt: 'Break down my goal to launch a side project' },
    { label: 'Log expense', prompt: 'Spent $15 for lunch with team' },
    { label: 'Daily briefing', prompt: 'Give me my morning summary and task recommendations' },
    { label: 'Code architecture', prompt: 'Suggest clean architecture tips for a React Native macOS app' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Rail */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <Text style={styles.moduleTitle}>Copilot</Text>

          {/* Model Selector Pill */}
          <CustomSelect
            options={aiModels.map((m) => ({
              label: m,
              value: m,
              badgeColor: isAiOnline ? '#10B981' : '#F59E0B',
            }))}
            value={selectedModel}
            onChange={setSelectedModel}
            size="sm"
            variant="filled"
            menuWidth={210}
          />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.clearChatBtn}
            onPress={() => {
              clearAiMessages();
              toast.info('Chat Cleared', 'Conversation history reset.');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RemixIcon name="delete-bin-line" size={13} color="#64748B" />
            <Text style={styles.clearChatText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom(true)}
      >
        {/* If initial landing / welcome state: Show Executive Insight Cockpit */}
        {aiMessages.length <= 1 ? (
          <View style={styles.cockpitContainer}>
            {/* 1. Header Banner: Greeting & Live Status */}
            <View style={styles.cockpitBanner}>
              <View style={styles.cockpitBannerLeft}>
                <View style={styles.cockpitAvatarBadge}>
                  <RemixIcon name="sparkles-fill" size={16} color="#6366F1" />
                </View>
                <View>
                  <Text style={styles.cockpitGreetingTitle}>
                    {getGreeting()}, Dara
                  </Text>
                </View>
              </View>
              <View style={styles.cockpitStatusPills}>
                <View style={[styles.cockpitStatusPill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <View style={[styles.cockpitStatusDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={[styles.cockpitStatusPillText, { color: '#16A34A' }]}>{isAiOnline ? 'Gemini Active' : 'AI Offline'}</Text>
                </View>
                {ghostSettings?.enabled && (
                  <View style={[styles.cockpitStatusPill, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                    <View style={[styles.cockpitStatusDot, { backgroundColor: '#7C3AED' }]} />
                    <Text style={[styles.cockpitStatusPillText, { color: '#7C3AED' }]}>Ghost Mode</Text>
                  </View>
                )}
                <View style={[styles.cockpitStatusPill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <View style={[styles.cockpitStatusDot, { backgroundColor: '#0284C7' }]} />
                  <Text style={[styles.cockpitStatusPillText, { color: '#0284C7' }]}>{pendingTasks.length} Tasks Pending</Text>
                </View>
              </View>
            </View>

            {/* 2. Three-Column Live Insight Grid */}
            <View style={styles.insightGrid}>
              {/* Card 1: Today's Priorities */}
              <TouchableOpacity
                style={styles.insightCard}
                onPress={() => setActiveModule('planner')}
                activeOpacity={0.85}
              >
                <View style={styles.insightCardHeader}>
                  <View style={styles.insightHeaderTitleBox}>
                    <RemixIcon name="checkbox-circle-fill" size={14} color="#6366F1" />
                    <Text style={styles.insightCardTitle}>Daily Priorities</Text>
                  </View>
                  <View style={styles.insightCountBadge}>
                    <Text style={styles.insightCountBadgeText}>{pendingTasks.length}</Text>
                  </View>
                </View>
                <View style={styles.insightCardBody}>
                  {pendingTasks.slice(0, 3).map((task: any, idx: number) => (
                    <View key={task.id || idx} style={styles.insightRowItem}>
                      <View style={[styles.priorityDot, { backgroundColor: task.priority === 'HIGH' || task.priority === 'high' ? '#DC2626' : task.priority === 'MEDIUM' || task.priority === 'medium' ? '#D97706' : '#64748B' }]} />
                      <Text style={styles.insightRowText} numberOfLines={1}>
                        {task.title}
                      </Text>
                    </View>
                  ))}
                  {pendingTasks.length === 0 && (
                    <Text style={styles.insightEmptyText}>All tasks completed</Text>
                  )}
                </View>
                <View style={styles.insightCardFooter}>
                  <Text style={styles.insightFooterLink}>Open Planner</Text>
                  <RemixIcon name="arrow-right-line" size={11} color="#6366F1" />
                </View>
              </TouchableOpacity>

              {/* Card 2: Financial Pulse */}
              <TouchableOpacity
                style={styles.insightCard}
                onPress={() => setActiveModule('finances')}
                activeOpacity={0.85}
              >
                <View style={styles.insightCardHeader}>
                  <View style={styles.insightHeaderTitleBox}>
                    <RemixIcon name="bank-card-line" size={14} color="#059669" />
                    <Text style={styles.insightCardTitle}>Financial Pulse</Text>
                  </View>
                  <View style={[styles.insightCountBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.insightCountBadgeText, { color: '#059669' }]}>USD</Text>
                  </View>
                </View>
                <View style={styles.insightCardBody}>
                  <View style={styles.financeMetricRow}>
                    <Text style={styles.financeMetricLabel}>Today's Outflow</Text>
                    <Text style={[styles.financeMetricVal, { color: '#DC2626' }]}>-${todaySpent.toLocaleString()}</Text>
                  </View>
                  <View style={styles.financeMetricRow}>
                    <Text style={styles.financeMetricLabel}>Net Cashflow</Text>
                    <Text style={[styles.financeMetricVal, { color: '#16A34A' }]}>+${(monthIncome - todaySpent).toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.insightCardFooter}>
                  <Text style={[styles.insightFooterLink, { color: '#059669' }]}>Open Finances</Text>
                  <RemixIcon name="arrow-right-line" size={11} color="#059669" />
                </View>
              </TouchableOpacity>

              {/* Card 3: Market Radar Snipers */}
              <TouchableOpacity
                style={styles.insightCard}
                onPress={() => setActiveModule('market')}
                activeOpacity={0.85}
              >
                <View style={styles.insightCardHeader}>
                  <View style={styles.insightHeaderTitleBox}>
                    <RemixIcon name="shopping-bag-line" size={14} color="#0284C7" />
                    <Text style={styles.insightCardTitle}>Market Radar</Text>
                  </View>
                  <View style={[styles.insightCountBadge, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                    <Text style={[styles.insightCountBadgeText, { color: '#0284C7' }]}>Hot Deals</Text>
                  </View>
                </View>
                <View style={styles.insightCardBody}>
                  {marketItems.slice(0, 2).map((item, idx) => (
                    <View key={item.id || idx} style={styles.insightRowItem}>
                      <Text style={styles.marketPriceTag}>${item.price}</Text>
                      <Text style={styles.insightRowText} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                  ))}
                  {marketItems.length === 0 && (
                    <Text style={styles.insightEmptyText}>Scanning Khmer24</Text>
                  )}
                </View>
                <View style={styles.insightCardFooter}>
                  <Text style={[styles.insightFooterLink, { color: '#0284C7' }]}>Open Radar</Text>
                  <RemixIcon name="arrow-right-line" size={11} color="#0284C7" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 3. Four Quick AI Executive Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.quickActionsHeaderTitle}>Executive AI Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => sendAiMessage('Please give me a complete daily executive briefing summarizing my pending tasks, cashflow, and schedule recommendations for today.')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                    <RemixIcon name="sparkles-fill" size={14} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.quickActionTitle}>Daily Executive Memo</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => sendAiMessage('Help me break down my current active project milestone into 4 actionable sprint tasks with clear criteria.')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                    <RemixIcon name="list-check-line" size={14} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.quickActionTitle}>Break Down Milestone</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => sendAiMessage('Analyze my recent expenses and suggest optimization tips for my weekly budget and cashflow.')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <RemixIcon name="bank-card-line" size={14} color="#059669" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.quickActionTitle}>Audit Weekly Expenses</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => sendAiMessage('Suggest clean architecture and optimization tips for our React Native and MTProto Telegram stack.')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                    <RemixIcon name="code-line" size={14} color="#D97706" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.quickActionTitle}>Code Architecture Tips</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          aiMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowAssistant,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.assistantHeaderRow}>
                      <View style={styles.assistantMetaLeft}>
                        <View style={styles.geminiIconBadge}>
                          <RemixIcon name="sparkles-fill" size={11} color="#6366F1" />
                        </View>
                        <Text style={styles.assistantName}>Gemini</Text>
                        <View style={styles.modelTagPill}>
                          <Text style={styles.modelTagPillText}>{msg.model || selectedModel}</Text>
                        </View>
                      </View>
                      <Text style={styles.messageTimeTag}>{msg.timestamp}</Text>
                    </View>
                  )}

                  <RichMarkdownView content={msg.content} isUser={isUser} />

                  {isUser ? (
                    <View style={styles.bubbleFooter}>
                      <Text style={styles.timestampUser}>{msg.timestamp}</Text>
                    </View>
                  ) : (
                    <View style={styles.assistantActionToolbar}>
                      <TouchableOpacity
                        style={[styles.msgActionBtn, copiedId === msg.id && styles.msgActionBtnActive]}
                        onPress={() => handleCopyMessage(msg.id, msg.content)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon
                          name={copiedId === msg.id ? 'check-line' : 'file-copy-line'}
                          size={13}
                          color={copiedId === msg.id ? '#10B981' : '#64748B'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.msgActionBtn}
                        onPress={handleRegenerate}
                        activeOpacity={0.7}
                      >
                        <RemixIcon name="refresh-line" size={13} color="#64748B" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.msgActionBtn, speakingId === msg.id && styles.msgActionBtnActive]}
                        onPress={() => handleSpeakMessage(msg.id, msg.content)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon
                          name="volume-up-line"
                          size={13}
                          color={speakingId === msg.id ? '#6366F1' : '#64748B'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.msgActionBtn, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}
                        onPress={() => handleForwardToTelegram(msg.content)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon
                          name="telegram-official"
                          size={13}
                          color="#0284C7"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        {isAiThinking && (
          <View style={[styles.messageRow, styles.messageRowAssistant]}>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.thinkingBubble]}>
              <View style={styles.thinkingHeader}>
                <View style={styles.geminiIconBadge}>
                  <RemixIcon name="sparkles-fill" size={11} color="#6366F1" />
                </View>
                <Text style={styles.thinkingTitle}>Gemini AI is reasoning</Text>
                <View style={styles.modelTagPill}>
                  <Text style={styles.modelTagPillText}>{selectedModel}</Text>
                </View>
              </View>

              <View style={styles.thinkingBody}>
                <ActivityIndicator size="small" color="#6366F1" />
                <Text style={styles.thinkingText}>Generating response with live context...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestion Chips */}
      <View style={styles.suggestionsRail}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
        >
          {promptSuggestions.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              activeOpacity={0.75}
              onPress={() => {
                if (s.prompt.startsWith('Break down')) {
                  breakdownGoalWithAi('Launch mobile app product version 1.0');
                } else if (s.prompt.startsWith('Spent')) {
                  logExpenseWithAi('Spent $15 for lunch with team');
                } else {
                  sendAiMessage(s.prompt);
                }
              }}
            >
              <Text style={styles.suggestionText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Slash Commands Menu */}
      {showSlashMenu && (
        <View style={styles.slashMenuContainer}>
          <View style={styles.slashMenuHeader}>
            <Text style={styles.slashMenuTitle}>Quick Commands</Text>
            <TouchableOpacity onPress={() => setShowSlashMenu(false)}>
              <RemixIcon name="close-line" size={13} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          {SLASH_COMMANDS.map((cmd) => (
            <TouchableOpacity
              key={cmd.cmd}
              style={styles.slashMenuItem}
              onPress={() => {
                setInput(cmd.prompt);
                setShowSlashMenu(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.slashPill}>
                <Text style={styles.slashPillText}>{cmd.cmd}</Text>
              </View>
              <Text style={styles.slashDesc}>{cmd.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modern Clean Input Box */}
      <View style={styles.inputContainer}>
        {/* Attached Items Badges */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsRow}>
            {attachments.map((att) => (
              <View key={att.id} style={styles.attachmentBadge}>
                <RemixIcon
                  name={att.type === 'code' ? 'code-line' : 'file-text-line'}
                  size={12}
                  color="#2563EB"
                />
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

        {/* Main Input Box */}
        <View
          style={[
            styles.inputCard,
            isInputFocused && styles.inputCardFocused,
            isRecording && styles.inputCardRecording,
          ]}
        >
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={(text) => {
              setInput(text);
              if (text === '/') setShowSlashMenu(true);
            }}
            placeholder={
              isRecording
                ? `Recording audio (${recordingSeconds}s)... click mic icon to complete`
                : `Ask ${selectedModel} anything, type '/' for commands...`
            }
            placeholderTextColor="#94A3B8"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />

          {/* Action Toolbar Bottom Bar */}
          <View style={styles.inputToolbar}>
            <View style={styles.toolbarLeft}>
              {/* Attachment Button */}
              <TouchableOpacity
                style={styles.toolIconBtn}
                onPress={handleAddAttachment}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <RemixIcon name="attachment-line" size={14} color="#64748B" />
              </TouchableOpacity>

              {/* Slash Commands Button */}
              <TouchableOpacity
                style={[styles.toolIconBtn, showSlashMenu && styles.toolIconBtnActive]}
                onPress={() => setShowSlashMenu(!showSlashMenu)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <RemixIcon
                  name="code-line"
                  size={14}
                  color={showSlashMenu ? '#2563EB' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Voice / Mic Button */}
              <TouchableOpacity
                style={[styles.toolIconBtn, isRecording && styles.toolIconBtnRecording]}
                onPress={toggleRecording}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <RemixIcon
                  name="mic-line"
                  size={14}
                  color={isRecording ? '#EF4444' : '#64748B'}
                />
                {isRecording && <View style={styles.recordingPulseDot} />}
              </TouchableOpacity>
            </View>

            <View style={styles.toolbarRight}>
              <Text style={styles.shortcutHint}>↵ Send</Text>

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() && attachments.length === 0) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isAiThinking}
                activeOpacity={0.8}
              >
                <RemixIcon name="send-plane-fill" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  topRail: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  moduleTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  modelSelectorContainer: {
    position: 'relative',
  },
  modelSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modelText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 32,
    left: 0,
    width: 220,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 6,
    zIndex: 100,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  dropdownTitle: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 9.5,
    color: '#10B981',
    fontWeight: '600',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
  },
  dropdownItemTextActive: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#2563EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearChatText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 10,
    maxWidth: '88%',
  },
  bubbleUser: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomRightRadius: 2,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 2,
  },
  assistantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  assistantMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  geminiIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantName: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  modelTagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  modelTagPillText: {
    fontSize: 9.5,
    color: '#64748B',
    fontFamily: 'Krasar-Regular',
  },
  messageTimeTag: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'Krasar-Regular',
  },
  assistantActionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  msgActionBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer',
  } as any,
  msgActionBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  msgActionBtnText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  bubbleText: {
    fontSize: 12.5,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  bubbleTextUser: {
    color: '#F8FAFC',
    fontFamily: 'Krasar-Regular',
  },
  bubbleTextAssistant: {
    color: '#1E293B',
    fontFamily: 'Krasar-Regular',
  },
  bubbleFooter: {
    marginTop: 4,
  },
  timestamp: {
    fontSize: 9,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    fontFamily: 'Krasar-Regular',
  },
  timestampUser: {
    color: '#94A3B8',
    alignSelf: 'flex-end',
    fontSize: 9,
    fontFamily: 'Krasar-Regular',
  },
  thinkingBubble: {
    padding: 12,
    gap: 8,
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  thinkingTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  thinkingBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#6366F1',
  },
  suggestionsRail: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    fontWeight: '500',
  },
  slashMenuContainer: {
    position: 'absolute',
    bottom: 95,
    left: 16,
    width: 280,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 6,
    zIndex: 200,
  },
  slashMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  slashMenuTitle: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  slashMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  slashPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slashPillText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  slashDesc: {
    fontSize: 10.5,
    color: '#475569',
    fontFamily: 'Krasar-Regular',
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    borderRadius: 5,
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
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },
  inputCardFocused: {
    borderColor: '#2563EB',
  },
  inputCardRecording: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    paddingVertical: 2,
    paddingHorizontal: 0,
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
    borderTopColor: '#F8FAFC',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
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
    gap: 6,
  },
  shortcutHint: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'Krasar-Regular',
  },
  sendButton: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },

  /* Cockpit Dashboard Styles */
  cockpitContainer: {
    gap: 14,
    paddingBottom: 4,
  },
  cockpitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  cockpitBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cockpitAvatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cockpitGreetingTitle: {
    fontSize: 16,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  cockpitStatusPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cockpitStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  cockpitStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cockpitStatusPillText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
  },
  insightGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    gap: 10,
    cursor: 'pointer',
  } as any,
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  insightHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightCardTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  insightCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  insightCountBadgeText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#6366F1',
    fontWeight: '700',
  },
  insightCardBody: {
    gap: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  insightRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  marketPriceTag: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0284C7',
  },
  insightRowText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
  },
  insightEmptyText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  financeMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financeMetricLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  financeMetricVal: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  insightCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  insightFooterLink: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#6366F1',
    fontWeight: '600',
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  quickActionsHeaderTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  quickActionCard: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    cursor: 'pointer',
  } as any,
  quickActionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
});
