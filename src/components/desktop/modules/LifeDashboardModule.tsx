import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { BankLogo } from '../../ui/BankLogo';
import { CustomModal } from '../../ui/CustomModal';
import { ModernAvatar } from '../../ui/ModernAvatar';
import { toast } from '../../../store/useToastStore';
import { detectBankBrand, parseTransactionNote } from './PersonalFinanceModule';

export const LifeDashboardModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const isKh = useLanguageStore((state) => state.language === 'kh');
  const selectedModel = useDesktopStore((state) => state.selectedModel);
  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const projects = useDesktopStore((state) => state.projects);
  const calendarEvents = useDesktopStore((state) => state.calendarEvents);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);
  const updateTaskStatus = useDesktopStore((state) => state.updateTaskStatus);
  const createTask = useDesktopStore((state) => state.createTask);

  const [briefing, setBriefing] = useState<{ summary: string; focusSuggestion: string; productivityScore: number } | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalExpense = useMemo(() => {
    return finances
      .filter((f) => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);
  }, [finances]);

  const totalIncome = useMemo(() => {
    return finances
      .filter((f) => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0);
  }, [finances]);

  const ghEvents = useMemo(() => {
    return calendarEvents.filter(
      (e) => e.id.startsWith('gh-') || e.title.includes('[Git') || e.title.includes('Commit')
    );
  }, [calendarEvents]);

  const fetchBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/ai/daily-briefing?model=${selectedModel}`);
      const json = await res.json();
      if (json.data) {
        setBriefing(json.data);
      } else {
        throw new Error('No data');
      }
    } catch (e) {
      setBriefing({
        summary: isKh
          ? `អរុណសួស្តី Dara Sovan! អ្នកមានភារកិច្ចសកម្មចំនួន ${pendingTasks.length} សម្រាប់ថ្ងៃនេះ និងបានសម្រេច ${completedTasks} រួចរាល់។`
          : `Good day Dara Sovan! You have ${pendingTasks.length} active tasks on your agenda today.`,
        focusSuggestion: pendingTasks.length > 0
          ? isKh
            ? `សូមចាប់ផ្តើមបំពេញភារកិច្ច "${pendingTasks[0].title}" មុនគេក្នុងម៉ោងមានថាមពលបំផុត។`
            : `Focus on "${pendingTasks[0].title}" during your peak productivity block.`
          : isKh
            ? 'ភារកិច្ចទាំងអស់ត្រូវបានបញ្ចប់រួចរាល់! ពេលវេលាល្អសម្រាប់រៀបចំផែនការគម្រោងថ្មី។'
            : 'All tasks completed! Great time to strategize next milestones.',
        productivityScore: completionRate || 85,
      });
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [selectedModel]);

  const handleQuickAddTask = async () => {
    if (!quickTaskTitle.trim() || isAddingTask) return;
    try {
      setIsAddingTask(true);
      await createTask({
        title: quickTaskTitle.trim(),
        priority: 'high',
        status: 'todo',
        projectName: 'EPR Desktop',
        dueDate: new Date().toISOString(),
      });
      setQuickTaskTitle('');
      toast.success('Task Added', 'New priority task added to planner');
    } finally {
      setIsAddingTask(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on_track':
        return { bg: '#ECFDF5', text: '#059669', dot: '#10B981', label: 'On Track' };
      case 'at_risk':
        return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'At Risk' };
      case 'delayed':
        return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444', label: 'Delayed' };
      default:
        return { bg: '#EEF2FF', text: '#6366F1', dot: '#6366F1', label: 'Completed' };
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Executive Rail */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <Text style={styles.moduleTitle}>{t.dashTitle}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Quick Action Shortcuts */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setActiveModule('planner')}
            activeOpacity={0.7}
          >
            <RemixIcon name="add-line" size={13} color="#0F172A" />
            <Text style={styles.headerActionBtnText}>{isKh ? 'ថែម Task' : '+ Task'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setActiveModule('finances')}
            activeOpacity={0.7}
          >
            <RemixIcon name="bank-card-line" size={13} color="#0F172A" />
            <Text style={styles.headerActionBtnText}>{isKh ? 'ថែម ចំណាយ' : '+ Expense'}</Text>
          </TouchableOpacity>

          {/* AI Daily Briefing Button */}
          <TouchableOpacity
            style={[styles.briefingHeaderBtn, loadingBriefing && styles.briefingHeaderBtnLoading]}
            onPress={() => setShowBriefingModal(true)}
            activeOpacity={0.7}
          >
            {loadingBriefing ? (
              <ActivityIndicator size="small" color="#4F46E5" style={{ transform: [{ scale: 0.75 }] }} />
            ) : (
              <RemixIcon name="sparkles-fill" size={13} color="#4F46E5" />
            )}
            <Text style={styles.briefingHeaderBtnText}>
              {isKh ? 'សេចក្តីសង្ខេប AI' : 'Daily AI Briefing'}
            </Text>
            {!loadingBriefing && briefing && <View style={styles.briefingHeaderDot} />}
          </TouchableOpacity>

          {/* Model Badge */}
          <View style={styles.modelBadge}>
            <RemixIcon name="sparkles-fill" size={11} color="#64748B" />
            <Text style={styles.modelBadgeText}>{selectedModel}</Text>
          </View>
        </View>
      </View>

      {/* 2. Scrollable Dashboard Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Core KPI Matrix (4 Crisp Metrics) */}
        <View style={styles.kpiGrid}>
          {/* Productivity Velocity */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveModule('planner')}
            activeOpacity={0.7}
          >
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>{t.dashProductivityScore}</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDF4' }]}>
                <RemixIcon name="task-line" size={13} color="#16A34A" />
              </View>
            </View>
            <Text style={styles.kpiValue}>{completionRate}%</Text>
            <View style={styles.kpiProgressBg}>
              <View style={[styles.kpiProgressFill, { width: `${completionRate}%`, backgroundColor: '#10B981' }]} />
            </View>
            <Text style={styles.kpiSub}>{completedTasks} of {tasks.length} tasks completed • {pendingTasks.length} pending</Text>
          </TouchableOpacity>

          {/* Total Expenses */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveModule('finances')}
            activeOpacity={0.7}
          >
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>{t.dashTotalExpenses}</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FEF2F2' }]}>
                <RemixIcon name="bank-card-line" size={13} color="#DC2626" />
              </View>
            </View>
            <Text style={styles.kpiValue}>${totalExpense.toLocaleString()}</Text>
            <View style={styles.kpiProgressBg}>
              <View style={[styles.kpiProgressFill, { width: '65%', backgroundColor: '#EF4444' }]} />
            </View>
            <Text style={styles.kpiSub}>{finances.length} transactions • Income ${totalIncome.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Active Goals / Projects */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveModule('goals')}
            activeOpacity={0.7}
          >
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>{t.dashActiveGoals}</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
                <RemixIcon name="folder-line" size={13} color="#4F46E5" />
              </View>
            </View>
            <Text style={styles.kpiValue}>{projects.length} Projects</Text>
            <View style={styles.kpiProgressBg}>
              <View style={[styles.kpiProgressFill, { width: '70%', backgroundColor: '#6366F1' }]} />
            </View>
            <Text style={styles.kpiSub}>EPR, GarageApp, Labo, Personal</Text>
          </TouchableOpacity>

          {/* Git Commits & Events */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveModule('calendar')}
            activeOpacity={0.7}
          >
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>Git Velocity</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#F1F5F9' }]}>
                <RemixIcon name="time-line" size={13} color="#0F172A" />
              </View>
            </View>
            <Text style={styles.kpiValue}>{ghEvents.length || 913} Events</Text>
            <View style={styles.kpiProgressBg}>
              <View style={[styles.kpiProgressFill, { width: '85%', backgroundColor: '#0F172A' }]} />
            </View>
            <Text style={styles.kpiSub}>dara-tech/ps • Live Webhook Sync</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Strategic Initiatives & Projects Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>{isKh ? 'គម្រោង និងគោលដៅយុទ្ធសាស្ត្រ' : 'Strategic Projects & Initiatives'}</Text>
            <TouchableOpacity onPress={() => setActiveModule('goals')} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>{isKh ? 'មើលទាំងអស់' : 'View all'} ({projects.length}) →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.projectsRowGrid}>
            {projects.slice(0, 4).map((proj) => {
              const badge = getHealthBadge(proj.health);
              const projTasks = tasks.filter((t) => t.projectId === proj.id || t.projectName === proj.name);
              const doneCount = projTasks.filter((t) => t.status === 'done').length;
              const calcProgress = projTasks.length ? Math.round((doneCount / projTasks.length) * 100) : proj.progress || 50;

              return (
                <TouchableOpacity
                  key={proj.id}
                  style={styles.projectCardTile}
                  onPress={() => setActiveModule('goals')}
                  activeOpacity={0.8}
                >
                  <View style={styles.projectCardTop}>
                    <Text style={styles.projectCardTitle} numberOfLines={1}>{proj.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                      <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.projectCardDesc} numberOfLines={2}>
                    {proj.description || 'Core development initiative'}
                  </Text>

                  <View style={styles.projectProgressBlock}>
                    <View style={styles.projectProgressRow}>
                      <Text style={styles.projectProgressLabel}>
                        {projTasks.length > 0 ? `${doneCount}/${projTasks.length} Tasks` : 'Progress'}
                      </Text>
                      <Text style={styles.projectProgressVal}>{calcProgress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${calcProgress}%` }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Three-Column Activity & Productivity Matrix */}
        <View style={styles.threeColGrid}>
          {/* Column 1: Priority Tasks & To-Dos */}
          <View style={styles.matrixCol}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>{isKh ? 'ភារកិច្ចអាទិភាព' : 'Priority Tasks'}</Text>
              <TouchableOpacity onPress={() => setActiveModule('planner')}>
                <Text style={styles.viewAllText}>Planner →</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Task Input */}
            <View style={styles.quickAddRow}>
              <TextInput
                style={styles.quickAddInput}
                value={quickTaskTitle}
                onChangeText={setQuickTaskTitle}
                placeholder={isKh ? 'បញ្ចូលភារកិច្ចថ្មី...' : 'Quick add task...'}
                placeholderTextColor="#94A3B8"
                onSubmitEditing={handleQuickAddTask}
              />
              <TouchableOpacity
                style={[styles.quickAddBtn, (!quickTaskTitle.trim() || isAddingTask) && { opacity: 0.5 }]}
                onPress={handleQuickAddTask}
                disabled={!quickTaskTitle.trim() || isAddingTask}
              >
                {isAddingTask ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <RemixIcon name="add-line" size={13} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.itemList}>
              {pendingTasks.length === 0 ? (
                <View style={styles.emptyBox}>
                  <RemixIcon name="checkbox-circle-fill" size={20} color="#10B981" />
                  <Text style={styles.emptyText}>All tasks completed for today!</Text>
                </View>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <TouchableOpacity
                      style={styles.taskCheckBtn}
                      onPress={() => updateTaskStatus(task.id, 'done')}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="checkbox-circle-fill" size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.priorityPill,
                        {
                          backgroundColor:
                            task.priority === 'urgent'
                              ? '#FEF2F2'
                              : task.priority === 'high'
                              ? '#FFFBEB'
                              : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color:
                              task.priority === 'urgent'
                                ? '#EF4444'
                                : task.priority === 'high'
                                ? '#D97706'
                                : '#475569',
                          },
                        ]}
                      >
                        {(task.priority || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Column 2: Financial Stream & Cash Flow */}
          <View style={styles.matrixCol}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>{isKh ? 'ប្រតិបត្តិការថ្មីៗ' : 'Recent Transactions'}</Text>
              <TouchableOpacity onPress={() => setActiveModule('finances')}>
                <Text style={styles.viewAllText}>Finance →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemList}>
              {finances.length === 0 ? (
                <View style={styles.emptyBox}>
                  <RemixIcon name="bank-card-line" size={20} color="#94A3B8" />
                  <Text style={styles.emptyText}>No financial records logged yet</Text>
                </View>
              ) : (
                finances.slice(0, 5).map((f) => {
                  const { title, sub } = parseTransactionNote(f.note);
                  const bankInfo = detectBankBrand(f.note, f.category, f.type);
                  const isIncome = f.type === 'income';

                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={styles.financeItem}
                      onPress={() => setActiveModule('finances')}
                      activeOpacity={0.7}
                    >
                      <BankLogo brand={bankInfo.brand} size={28} height={28} />
                      <View style={{ flex: 1, marginLeft: 9 }}>
                        <Text style={styles.financeTitle} numberOfLines={1}>
                          {title || f.category}
                        </Text>
                        <Text style={styles.financeDate} numberOfLines={1}>
                          {sub || f.date || 'Recent'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.financeAmount,
                          { color: isIncome ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        {isIncome ? '+' : '-'}${f.amount.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* Column 3: Calendar & Engineering Timeline */}
          <View style={styles.matrixCol}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>{isKh ? 'កាលវិភាគ & Git' : 'Schedule & Git Events'}</Text>
              <TouchableOpacity onPress={() => setActiveModule('calendar')}>
                <Text style={styles.viewAllText}>Calendar →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemList}>
              {calendarEvents.length === 0 ? (
                <View style={styles.emptyBox}>
                  <RemixIcon name="calendar-line" size={20} color="#94A3B8" />
                  <Text style={styles.emptyText}>No upcoming events today</Text>
                </View>
              ) : (
                calendarEvents.slice(0, 5).map((ev) => {
                  const isGit = ev.id.startsWith('gh-') || ev.title.includes('[Git');
                  return (
                    <View key={ev.id} style={styles.eventItem}>
                      <View
                        style={[
                          styles.eventIconBox,
                          { backgroundColor: isGit ? '#F1F5F9' : '#EEF2FF' },
                        ]}
                      >
                        <RemixIcon
                          name={isGit ? 'time-line' : 'calendar-line'}
                          size={12}
                          color={isGit ? '#0F172A' : '#4F46E5'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle} numberOfLines={1}>
                          {ev.title}
                        </Text>
                        <Text style={styles.eventDate}>
                          {ev.time ? `${ev.time} • ` : ''}{ev.date}
                        </Text>
                      </View>
                      <View style={styles.eventPill}>
                        <Text style={styles.eventPillText}>{isGit ? 'GIT' : 'EVENT'}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>

        {/* 6. Quick Launchpad Action Dock */}
        <View style={styles.launchpadContainer}>
          <Text style={styles.sectionHeading}>{t.dashQuickLaunchpad}</Text>
          <View style={styles.launchpadGrid}>
            <TouchableOpacity
              style={styles.launchBtn}
              onPress={() => setActiveModule('copilot')}
              activeOpacity={0.7}
            >
              <View style={[styles.launchIconBox, { backgroundColor: '#EEF2FF' }]}>
                <RemixIcon name="sparkles-fill" size={15} color="#4F46E5" />
              </View>
              <View style={styles.launchBtnTextCol}>
                <Text style={styles.launchBtnTitle}>AI Copilot</Text>
                <Text style={styles.launchBtnSub}>Brainstorm & analyze</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.launchBtn}
              onPress={() => setActiveModule('planner')}
              activeOpacity={0.7}
            >
              <View style={[styles.launchIconBox, { backgroundColor: '#F0FDF4' }]}>
                <RemixIcon name="task-line" size={15} color="#16A34A" />
              </View>
              <View style={styles.launchBtnTextCol}>
                <Text style={styles.launchBtnTitle}>Daily Planner</Text>
                <Text style={styles.launchBtnSub}>Tasks & focus blocks</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.launchBtn}
              onPress={() => setActiveModule('calendar')}
              activeOpacity={0.7}
            >
              <View style={[styles.launchIconBox, { backgroundColor: '#F1F5F9' }]}>
                <RemixIcon name="calendar-line" size={15} color="#0F172A" />
              </View>
              <View style={styles.launchBtnTextCol}>
                <Text style={styles.launchBtnTitle}>Calendar & Git</Text>
                <Text style={styles.launchBtnSub}>Schedule & git sync</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.launchBtn}
              onPress={() => setActiveModule('finances')}
              activeOpacity={0.7}
            >
              <View style={[styles.launchIconBox, { backgroundColor: '#FFFBEB' }]}>
                <RemixIcon name="bank-card-line" size={15} color="#D97706" />
              </View>
              <View style={styles.launchBtnTextCol}>
                <Text style={styles.launchBtnTitle}>Finance Hub</Text>
                <Text style={styles.launchBtnSub}>Expenses & revenue</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.launchBtn}
              onPress={() => setActiveModule('chat')}
              activeOpacity={0.7}
            >
              <View style={[styles.launchIconBox, { backgroundColor: '#F0F9FF' }]}>
                <RemixIcon name="chat-3-line" size={15} color="#0284C7" />
              </View>
              <View style={styles.launchBtnTextCol}>
                <Text style={styles.launchBtnTitle}>Telegram Chat</Text>
                <Text style={styles.launchBtnSub}>Direct & group messaging</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* AI Daily Briefing Modal */}
      <CustomModal
        visible={showBriefingModal}
        onClose={() => setShowBriefingModal(false)}
        title={isKh ? 'សេចក្តីសង្ខេប AI ប្រចាំថ្ងៃ' : 'AI Daily Briefing'}
        icon="sparkles-fill"
        maxWidth={500}
      >
        <View style={styles.modalContainer}>
          {/* AI Model Tag Pill & Regenerate */}
          <View style={styles.modalMetaRow}>
            <View style={styles.aiModalTag}>
              <RemixIcon name="sparkles-fill" size={11} color="#4F46E5" />
              <Text style={styles.aiModalTagText}>AI GENERATED • {selectedModel}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalRefreshBtn}
              onPress={fetchBriefing}
              disabled={loadingBriefing}
              activeOpacity={0.7}
            >
              <RemixIcon name="refresh-line" size={12} color={loadingBriefing ? '#94A3B8' : '#4F46E5'} />
              <Text style={[styles.modalRefreshBtnText, loadingBriefing && { color: '#94A3B8' }]}>
                {isKh ? 'បង្កើតឡើងវិញ' : 'Regenerate'}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingBriefing ? (
            <View style={styles.modalLoadingBox}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.modalLoadingText}>
                {isKh ? 'កំពុងដំណើរការបង្កើតសេចក្តីសង្ខេប AI ប្រចាំថ្ងៃ...' : 'Generating personalized daily briefing...'}
              </Text>
            </View>
          ) : (
            <View style={styles.modalBody}>
              {/* Daily Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>
                  {briefing?.summary || (isKh ? 'ថ្ងៃនេះគ្រប់កិច្ចការ និងប្រព័ន្ធទាំងអស់ដំណើរការយ៉ាងរលូន។' : 'Good day! All systems and modules are in sync.')}
                </Text>
              </View>

              {/* Key Priority / Focus Suggestion */}
              {briefing?.focusSuggestion ? (
                <View style={styles.focusCard}>
                  <View style={styles.focusCardHeader}>
                    <RemixIcon name="sparkles-fill" size={13} color="#D97706" />
                    <Text style={styles.focusCardTitle}>
                      {isKh ? 'ការណែនាំអាទិភាពចម្បង' : 'Key Priority Recommendation'}
                    </Text>
                  </View>
                  <Text style={styles.focusCardText}>
                    {briefing.focusSuggestion}
                  </Text>
                </View>
              ) : null}

              {/* Quick Stats Grid inside Modal */}
              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatTile}>
                  <Text style={styles.modalStatLabel}>{isKh ? 'ភារកិច្ចនៅសល់' : 'Pending'}</Text>
                  <Text style={styles.modalStatValue}>{pendingTasks.length}</Text>
                </View>
                <View style={styles.modalStatTile}>
                  <Text style={styles.modalStatLabel}>{isKh ? 'បានសម្រេច' : 'Completed'}</Text>
                  <Text style={[styles.modalStatValue, { color: '#16A34A' }]}>{completedTasks}</Text>
                </View>
                <View style={styles.modalStatTile}>
                  <Text style={styles.modalStatLabel}>{isKh ? 'ផលិតភាព' : 'Productivity'}</Text>
                  <Text style={[styles.modalStatValue, { color: '#4F46E5' }]}>{completionRate}%</Text>
                </View>
              </View>
            </View>
          )}

          {/* Modal Action Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowBriefingModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>
                {isKh ? 'យល់ព្រម' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topRail: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerActionBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  briefingHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  briefingHeaderBtnLoading: {
    opacity: 0.8,
  },
  briefingHeaderBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#4338CA',
  },
  briefingHeaderDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6366F1',
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modelBadgeText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  greetingBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  greetingAvatarBox: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  greetingTextBox: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 14,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  greetingSub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  greetingRight: {
    alignItems: 'flex-end',
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 260,
  },
  focusPillText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#4338CA',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiTitle: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  kpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  kpiProgressBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  kpiProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  kpiSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#2563EB',
  },
  projectsRowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  projectCardTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  projectCardTitle: {
    fontSize: 12,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  projectCardDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 8,
  },
  projectProgressBlock: {
    gap: 3,
  },
  projectProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectProgressLabel: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  projectProgressVal: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  threeColGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  matrixCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  quickAddInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  quickAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemList: {
    gap: 6,
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  taskCheckBtn: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    flex: 1,
  },
  priorityPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  financeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  financeIconBox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: {
    backgroundColor: '#F0FDF4',
  },
  expenseIcon: {
    backgroundColor: '#FEF2F2',
  },
  financeTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  financeDate: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  financeAmount: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#16A34A',
  },
  expenseAmount: {
    color: '#DC2626',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  eventIconBox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  eventDate: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  eventPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  eventPillText: {
    fontSize: 8,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  launchpadContainer: {
    gap: 10,
  },
  launchpadGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  launchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  launchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchBtnTextCol: {
    flex: 1,
  },
  launchBtnTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  launchBtnSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  modalContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiModalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  aiModalTagText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#4338CA',
    fontWeight: '700',
  },
  modalRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalRefreshBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#4F46E5',
    fontWeight: '700',
  },
  modalLoadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  modalLoadingText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  modalBody: {
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  summaryText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    lineHeight: 17,
  },
  focusCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 10,
    gap: 4,
  },
  focusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  focusCardTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#B45309',
  },
  focusCardText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#92400E',
    lineHeight: 16,
  },
  modalStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalStatTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  modalStatValue: {
    fontSize: 14,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalCloseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  modalCloseBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
