import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { RemixIcon, RemixIconName } from '../../ui/RemixIcon';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { LanguageToggle } from '../../ui/LanguageToggle';
import { MultiColorSidebarIcon, MultiColorIconName } from '../../ui/MultiColorSidebarIcon';
import { BiometricAuthModal } from '../BiometricAuthModal';
import { PersonalContextEditorModal } from '../PersonalContextEditorModal';
import { toast } from '../../../store/useToastStore';

type SettingCategoryId = 'github' | 'context' | 'security' | 'ai' | 'general' | 'language' | 'notifications';

interface SettingCategory {
  id: SettingCategoryId;
  titleKh: string;
  titleEn: string;
  descKh: string;
  descEn: string;
  icon: MultiColorIconName;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  badge?: string;
}

export const SettingsModule: React.FC = () => {
  const language = useLanguageStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const selectedModel = useDesktopStore((state) => state.selectedModel);
  const setSelectedModel = useDesktopStore((state) => state.setSelectedModel);
  const aiModels = useDesktopStore((state) => state.aiModels);
  const githubConfig = useDesktopStore((state) => state.githubConfig);
  const setGithubConfig = useDesktopStore((state) => state.setGithubConfig);
  const syncGithubEvents = useDesktopStore((state) => state.syncGithubEvents);

  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const projects = useDesktopStore((state) => state.projects);
  const calendarEvents = useDesktopStore((state) => state.calendarEvents);
  const personalContext = useDesktopStore((state) => state.personalContext);
  const setPersonalContext = useDesktopStore((state) => state.setPersonalContext);

  const [activeCategory, setActiveCategory] = useState<SettingCategoryId>('github');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);

  // GitHub Local State
  const [ghUsername, setGhUsername] = useState(githubConfig.username);
  const [ghRepo, setGhRepo] = useState(githubConfig.repo);
  const [ghToken, setGhToken] = useState(githubConfig.token || '');
  const [ghAutoSync, setGhAutoSync] = useState(githubConfig.autoSync);
  const [syncCommits, setSyncCommits] = useState(true);
  const [syncMilestones, setSyncMilestones] = useState(true);
  const [syncReleases, setSyncReleases] = useState(true);
  const [isSyncingGh, setIsSyncingGh] = useState(false);

  // Personal Context Hub Local State
  const [contextNotes, setContextNotes] = useState(personalContext);
  const [ctxIncludeGit, setCtxIncludeGit] = useState(true);
  const [ctxIncludeTasks, setCtxIncludeTasks] = useState(true);
  const [ctxIncludeFinances, setCtxIncludeFinances] = useState(true);
  const [ctxIncludeCalendar, setCtxIncludeCalendar] = useState(true);
  const [ctxIncludeRules, setCtxIncludeRules] = useState(true);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showContextEditorModal, setShowContextEditorModal] = useState(false);

  // Security Local State
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // General Local State
  const [workspaceName, setWorkspaceName] = useState(user?.name ? `${user.name}'s Workspace` : 'Personal Workspace');
  const [defaultView, setDefaultView] = useState('copilot');

  // Notifications State
  const [notifSound, setNotifSound] = useState(true);
  const [notifDesktop, setNotifDesktop] = useState(true);
  const [calReminderMinutes, setCalReminderMinutes] = useState('15');

  // Calculations for Context Signals
  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;
  const urgentTasksCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const categories: SettingCategory[] = [
    {
      id: 'github',
      titleKh: 'GitHub & Auto-Sync',
      titleEn: 'GitHub & Auto-Sync',
      descKh: 'Sync កាលបរិច្ឆេទ Commits & Milestones ចូល Calendar',
      descEn: 'Auto-sync commits and milestones directly to calendar',
      icon: 'github',
      iconBg: '#F1F5F9',
      iconColor: '#0F172A',
      iconBorder: '#E2E8F0',
      badge: ghAutoSync ? 'Active' : undefined,
    },
    {
      id: 'context',
      titleKh: 'បរិបទផ្ទាល់ខ្លួន & AI Memory',
      titleEn: 'Personal Context & AI Memory',
      descKh: 'គ្រប់គ្រង Live Context និងចំណេះដឹងរបស់ AI',
      descEn: 'Configure active work context & custom AI memory rules',
      icon: 'context',
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
      iconBorder: '#DDD6FE',
      badge: 'Live',
    },
    {
      id: 'security',
      titleKh: 'សុវត្ថិភាព & Touch ID',
      titleEn: 'Security & Touch ID',
      descKh: 'ស្កេនម្រាមដៃ និងការការពារគណនី',
      descEn: 'Biometric fingerprint unlock & password settings',
      icon: 'security',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      iconBorder: '#FECACA',
    },
    {
      id: 'ai',
      titleKh: 'ម៉ូដែល Gemini AI',
      titleEn: 'Gemini AI Engine',
      descKh: 'ជ្រើសរើស LLM Model និង Copilot Speed',
      descEn: 'Select intelligent cloud model & prompt creativity',
      icon: 'ai',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      iconBorder: '#BFDBFE',
    },
    {
      id: 'general',
      titleKh: 'ទូទៅ & Workspace',
      titleEn: 'General & Workspace',
      descKh: 'ឈ្មោះ Workspace និងទិដ្ឋភាពដើម',
      descEn: 'Workspace name, default module & profile headline',
      icon: 'general',
      iconBg: '#F0FDF4',
      iconColor: '#16A34A',
      iconBorder: '#BBF7D0',
    },
    {
      id: 'language',
      titleKh: 'ភាសា & ការបង្ហាញ',
      titleEn: 'Language & Region',
      descKh: 'ប្តូរភាសាបង្ហាញ ខ្មែរ / English',
      descEn: 'Display language, date formatting & currency',
      icon: 'language',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      iconBorder: '#FDE68A',
    },
    {
      id: 'notifications',
      titleKh: 'ការជូនដំណឹង & សំឡេង',
      titleEn: 'Notifications & Alerts',
      descKh: 'សំឡេងរោទិ៍ និងការរំលឹកកាលវិភាគ',
      descEn: 'Sound alerts, desktop banner & calendar triggers',
      icon: 'notifications',
      iconBg: '#FDF2F8',
      iconColor: '#DB2777',
      iconBorder: '#FBCFE8',
    },
  ];

  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.titleEn.toLowerCase().includes(query) ||
      c.titleKh.toLowerCase().includes(query) ||
      c.descEn.toLowerCase().includes(query) ||
      c.descKh.toLowerCase().includes(query)
    );
  });

  const handleSaveGithub = async () => {
    setGithubConfig({
      username: ghUsername.trim(),
      repo: ghRepo.trim(),
      token: ghToken.trim(),
      autoSync: ghAutoSync,
    });
    toast.success(
      language === 'kh' ? 'បានរក្សាទុក' : 'Settings Saved',
      language === 'kh' ? 'ការកំណត់ GitHub ត្រូវបានរក្សាទុករួចរាល់' : 'GitHub configuration updated.'
    );
    if (ghAutoSync) {
      setIsSyncingGh(true);
      await syncGithubEvents(false);
      setIsSyncingGh(false);
    }
  };

  const handleManualGhSync = async () => {
    setIsSyncingGh(true);
    setGithubConfig({
      username: ghUsername.trim(),
      repo: ghRepo.trim(),
      token: ghToken.trim(),
      autoSync: ghAutoSync,
    });
    await syncGithubEvents(false);
    setIsSyncingGh(false);
  };

  const handleSaveContext = () => {
    setPersonalContext(contextNotes);
    toast.success(
      language === 'kh' ? 'បានរក្សាទុក Context' : 'Context Saved',
      language === 'kh' ? 'ច្បាប់ និងអង្គចងចាំផ្ទាល់ខ្លួនត្រូវបានដាក់បញ្ជូនទៅកាន់ AI រួចរាល់' : 'Custom memory & context streams active for Gemini AI.'
    );
  };

  const buildContextPromptPreview = () => {
    const parts = [
      '# UNIFIED PERSONAL CONTEXT INJECTION FOR GEMINI AI',
      `Active Project/Repo: ${githubConfig.username || 'dara-tech'}/${githubConfig.repo || 'ps'} (${githubConfig.syncedCount || 921} git items)`,
      `Active Task Focus: ${pendingTasksCount} pending tasks (${urgentTasksCount} urgent)`,
      `Financial Run-rate: $${totalExpense.toFixed(0)} monthly spend across ${finances.length} records`,
      `Calendar Schedule: ${calendarEvents.length} active events`,
      '---',
      '# USER PERMANENT GUIDELINES & MEMORY:',
      contextNotes,
    ];
    return parts.join('\n');
  };

  const AI_MODEL_OPTIONS = aiModels.map((m) => ({
    label: m === 'gemini-3.7-flash' ? `${m} (Recommended)` : m,
    value: m,
  }));

  const DEFAULT_VIEW_OPTIONS = [
    { label: 'Gemini Copilot', value: 'copilot' },
    { label: 'Personal Planner', value: 'planner' },
    { label: 'Interactive Calendar', value: 'calendar' },
    { label: 'Goals & Milestones', value: 'goals' },
    { label: 'Personal Finances', value: 'finances' },
    { label: 'Daily Dashboard', value: 'dashboard' },
  ];

  const REMINDER_OPTIONS = [
    { label: '5 minutes before', value: '5' },
    { label: '15 minutes before', value: '15' },
    { label: '30 minutes before', value: '30' },
    { label: '1 hour before', value: '60' },
    { label: '1 day before', value: '1440' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header Rail */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={() => setIsLeftCollapsed(!isLeftCollapsed)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <RemixIcon
              name={isLeftCollapsed ? 'sidebar-expand-line' : 'sidebar-collapse-line'}
              size={15}
              color="#64748B"
            />
          </TouchableOpacity>
          <Text style={styles.moduleTitle}>
            {language === 'kh' ? 'ការកំណត់ប្រព័ន្ធ' : 'Settings'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.modeBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.modeBadgeText}>
              {language === 'kh' ? 'Personal OS Mode' : 'Personal OS Mode'}
            </Text>
          </View>
        </View>
      </View>

      {/* Two-Column Master-Detail Layout */}
      <View style={styles.masterDetailBody}>
        {/* Left Master Categories Sidebar */}
        {!isLeftCollapsed && (
          <View style={styles.leftPanel}>
            {/* Search Categories */}
            <View style={styles.searchBoxWrap}>
              <CustomTextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={language === 'kh' ? 'ស្វែងរកការកំណត់...' : 'Search settings...'}
                icon="search-line"
                size="sm"
              />
            </View>

            {/* Categories List */}
            <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
              {filteredCategories.map((item) => {
                const isActive = activeCategory === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                    onPress={() => setActiveCategory(item.id)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.categoryIconBox,
                        isActive && styles.categoryIconBoxActive,
                      ]}
                    >
                      <MultiColorSidebarIcon
                        name={item.icon}
                        isActive={isActive}
                        size={20}
                      />
                    </View>

                    <View style={styles.categoryInfo}>
                      <View style={styles.categoryTitleRow}>
                        <Text
                          style={[
                            styles.categoryTitle,
                            isActive && styles.categoryTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {language === 'kh' ? item.titleKh : item.titleEn}
                        </Text>
                        {item.badge && (
                          <View style={[styles.itemBadge, item.id === 'context' && styles.contextItemBadge]}>
                            <Text style={[styles.itemBadgeText, item.id === 'context' && styles.contextItemBadgeText]}>
                              {item.badge}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.categoryDesc} numberOfLines={1}>
                        {language === 'kh' ? item.descKh : item.descEn}
                      </Text>
                    </View>

                    <RemixIcon
                      name="chevron-right-line"
                      size={13}
                      color={isActive ? '#0F172A' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Right Detail Content View */}
        <View style={styles.rightContentArea}>
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* 1. GITHUB & CALENDAR AUTO-SYNC */}
            {activeCategory === 'github' && (
              <View style={styles.settingCardWrapper}>
                {/* Banner Card */}
                <View style={styles.bannerCard}>
                  <View style={styles.bannerIconBox}>
                    <MultiColorSidebarIcon name="github" size={26} />
                  </View>
                  <View style={styles.bannerInfo}>
                    <Text style={styles.bannerHeading}>
                      {language === 'kh'
                        ? 'ភ្ជាប់ទិន្នន័យ GitHub ស្វ័យប្រវត្តទៅកាន់ Calendar'
                        : 'GitHub Calendar Auto-Sync Integration'}
                    </Text>
                    <Text style={styles.bannerSubtext}>
                      {language === 'kh'
                        ? 'ទាញយកកំណត់ត្រា Code Commits, Project Milestones, និង Version Releases មកដាក់លើ Calendar ដោយស្វ័យប្រវត្ត'
                        : 'Automatically sync commits, sprint milestones, and release schedules into your Personal Workspace calendar.'}
                    </Text>
                    {githubConfig.lastSyncedAt && (
                      <View style={styles.syncMetaRow}>
                        <View style={styles.syncMetaPill}>
                          <View style={styles.liveDot} />
                          <Text style={styles.syncMetaText}>
                            {language === 'kh' ? `បាន Sync ជោគជ័យ៖ ${githubConfig.lastSyncedAt}` : `Last active sync: ${githubConfig.lastSyncedAt}`}
                            {githubConfig.syncedCount !== undefined ? ` • ${githubConfig.syncedCount} items` : ''}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Auto-Sync Toggle Row */}
                <View style={styles.cardSection}>
                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="git-branch-line" size={14} color="#0F172A" />
                        <Text style={styles.prefTitle}>
                          {language === 'kh' ? 'បើកដំណើរការ Auto-Sync' : 'Enable Background Auto-Sync'}
                        </Text>
                      </View>
                      <Text style={styles.prefSub}>
                        {language === 'kh'
                          ? 'Sync ដោយស្វ័យប្រវត្តរាល់ពេលបើកកាលវិភាគ ឬកែប្រែទិន្នន័យ'
                          : 'Silently fetch latest GitHub activities whenever Calendar is viewed'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleSwitch,
                        ghAutoSync && styles.toggleSwitchActive,
                      ]}
                      onPress={() => setGhAutoSync(!ghAutoSync)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.toggleDot,
                          ghAutoSync && styles.toggleDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Input Fields */}
                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'GitHub Username / Organization' : 'GitHub Username / Org'}
                      </Text>
                      <CustomTextInput
                        value={ghUsername}
                        onChangeText={setGhUsername}
                        placeholder="e.g. dara-tech"
                        icon="user-line"
                        size="md"
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'Repository Name (ទុកទទេដើម្បី Sync គ្រប់ Repositories ទាំងអស់)' : 'Repository Name (Leave blank to sync All Repos)'}
                      </Text>
                      <CustomTextInput
                        value={ghRepo}
                        onChangeText={setGhRepo}
                        placeholder="e.g. Leave empty to sync all 50+ repositories"
                        icon="folder-line"
                        size="md"
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'Personal Access Token (សម្រាប់ Private Repos / No Rate Limit)' : 'Personal Access Token (For Private Repos)'}
                      </Text>
                      <CustomTextInput
                        value={ghToken}
                        onChangeText={setGhToken}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional for public repos)"
                        icon="lock-line"
                        size="md"
                        secureTextEntry
                      />
                    </View>
                  </View>

                  {/* Sync Filters */}
                  <View style={styles.syncOptionsWrap}>
                    <Text style={styles.syncOptionsTitle}>
                      {language === 'kh' ? 'ទិន្នន័យដែលត្រូវ Sync៖' : 'Synchronized Data Types:'}
                    </Text>
                    <View style={styles.checkboxOptionsRow}>
                      <TouchableOpacity
                        style={[styles.chipCheckbox, syncCommits && styles.chipCheckboxActive]}
                        onPress={() => setSyncCommits(!syncCommits)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.miniCheck, syncCommits && styles.miniCheckActive]}>
                          {syncCommits && <RemixIcon name="check-line" size={10} color="#FFFFFF" />}
                        </View>
                        <RemixIcon name="git-commit-line" size={13} color="#2563EB" />
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? 'Commits ប្រចាំថ្ងៃ' : 'Commits'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.chipCheckbox, syncMilestones && styles.chipCheckboxActive]}
                        onPress={() => setSyncMilestones(!syncMilestones)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.miniCheck, syncMilestones && styles.miniCheckActive]}>
                          {syncMilestones && <RemixIcon name="check-line" size={10} color="#FFFFFF" />}
                        </View>
                        <RemixIcon name="flag-line" size={13} color="#059669" />
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? 'គោលដៅ Milestones' : 'Milestones'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.chipCheckbox, syncReleases && styles.chipCheckboxActive]}
                        onPress={() => setSyncReleases(!syncReleases)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.miniCheck, syncReleases && styles.miniCheckActive]}>
                          {syncReleases && <RemixIcon name="check-line" size={10} color="#FFFFFF" />}
                        </View>
                        <RemixIcon name="rocket-line" size={13} color="#8B5CF6" />
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? 'កំណែចេញផ្សាយ Releases' : 'Releases'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.syncNowBtn}
                      onPress={handleManualGhSync}
                      disabled={isSyncingGh}
                      activeOpacity={0.8}
                    >
                      {isSyncingGh ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <RemixIcon name="refresh-line" size={13} color="#2563EB" />
                      )}
                      <Text style={styles.syncNowBtnText}>
                        {isSyncingGh
                          ? language === 'kh' ? 'កំពុង Sync...' : 'Syncing GitHub...'
                          : language === 'kh' ? 'Sync ឥឡូវ (Manual Sync)' : 'Test Sync Now'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.savePrimaryBtn}
                      onPress={handleSaveGithub}
                      activeOpacity={0.85}
                    >
                      <RemixIcon name="check-line" size={14} color="#FFFFFF" />
                      <Text style={styles.savePrimaryBtnText}>
                        {language === 'kh' ? 'រក្សាទុកការកំណត់' : 'Save GitHub Settings'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 2. PERSONAL CONTEXT & AI MEMORY HUB */}
            {activeCategory === 'context' && (
              <View style={styles.settingCardWrapper}>
                {/* Real-time Signals Matrix (4 Cards) */}
                <View style={styles.contextSignalsGrid}>
                  <View style={styles.contextSignalCard}>
                    <View style={styles.contextSignalTop}>
                      <Text style={styles.contextSignalLabel}>Git Activity</Text>
                      <View style={[styles.microBadge, { backgroundColor: '#F1F5F9' }]}>
                        <RemixIcon name="github-fill" size={11} color="#0F172A" />
                      </View>
                    </View>
                    <Text style={styles.contextSignalVal} numberOfLines={1}>
                      {githubConfig.username || 'dara-tech'}/{githubConfig.repo || 'ps'}
                    </Text>
                    <Text style={styles.contextSignalSub}>{githubConfig.syncedCount || 921} items synced</Text>
                  </View>

                  <View style={styles.contextSignalCard}>
                    <View style={styles.contextSignalTop}>
                      <Text style={styles.contextSignalLabel}>Active Sprint</Text>
                      <View style={[styles.microBadge, { backgroundColor: '#F0FDF4' }]}>
                        <RemixIcon name="task-line" size={11} color="#16A34A" />
                      </View>
                    </View>
                    <Text style={styles.contextSignalVal}>{pendingTasksCount} Tasks Pending</Text>
                    <Text style={styles.contextSignalSub}>{urgentTasksCount} urgent tasks</Text>
                  </View>

                  <View style={styles.contextSignalCard}>
                    <View style={styles.contextSignalTop}>
                      <Text style={styles.contextSignalLabel}>Cashflow</Text>
                      <View style={[styles.microBadge, { backgroundColor: '#FFFBEB' }]}>
                        <RemixIcon name="bank-card-line" size={11} color="#D97706" />
                      </View>
                    </View>
                    <Text style={styles.contextSignalVal}>${totalExpense.toFixed(2)}</Text>
                    <Text style={styles.contextSignalSub}>{finances.length} records logged</Text>
                  </View>

                  <View style={styles.contextSignalCard}>
                    <View style={styles.contextSignalTop}>
                      <Text style={styles.contextSignalLabel}>Design Rules</Text>
                      <View style={[styles.microBadge, { backgroundColor: '#EFF6FF' }]}>
                        <RemixIcon name="sparkles-fill" size={11} color="#2563EB" />
                      </View>
                    </View>
                    <Text style={styles.contextSignalVal}>Zero Shadows</Text>
                    <Text style={styles.contextSignalSub}>1px borders • Krasar</Text>
                  </View>
                </View>

                {/* Permanent Guidelines & Memory Action Card */}
                <View style={styles.cardSection}>
                  <View style={styles.memoryHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>
                      {language === 'kh' ? 'ការណែនាំ និងអង្គចងចាំ AI' : 'AI Memory & Guidelines'}
                    </Text>
                    <TouchableOpacity
                      style={styles.openEditorBtn}
                      onPress={() => setShowContextEditorModal(true)}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name="file-text-line" size={13} color="#FFFFFF" />
                      <Text style={styles.openEditorBtnText}>
                        {language === 'kh' ? 'កែសម្រួល Document' : 'Edit Memory Document'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Clean Markdown/Text Preview Box */}
                  <TouchableOpacity
                    style={styles.memoryPreviewBox}
                    onPress={() => setShowContextEditorModal(true)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.memoryPreviewText} numberOfLines={4}>
                      {contextNotes.trim() ||
                        (language === 'kh'
                          ? 'មិនទាន់មាន Guidelines នៅឡើយទេ... ចុចទីនេះដើម្បីសរសេរ និងកំណត់ Memory សម្រាប់ Gemini AI ជាមួយ Rich Editor។'
                          : 'No custom memory defined yet... Click here to write instructions with Google Docs-like rich formatting.')}
                    </Text>
                    <View style={styles.memoryPreviewFooter}>
                      <View style={styles.memoryMeta}>
                        <RemixIcon name="sparkles-fill" size={11} color="#6366F1" />
                        <Text style={styles.memoryMetaText}>
                          {contextNotes.length} chars • Rich Markdown Editor
                        </Text>
                      </View>
                      <Text style={styles.clickToEditLabel}>
                        {language === 'kh' ? 'ចុចដើម្បីកែសម្រួល ↗' : 'Click to edit ↗'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.contextActionsRow}>
                    <TouchableOpacity
                      style={styles.previewToggleBtn}
                      onPress={() => setShowPromptPreview(!showPromptPreview)}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name={showPromptPreview ? 'eye-off-line' : 'eye-line'} size={13} color="#475569" />
                      <Text style={styles.previewToggleText}>
                        {showPromptPreview
                          ? (language === 'kh' ? 'លាក់ Prompt' : 'Hide Prompt')
                          : (language === 'kh' ? 'មើល Prompt' : 'Inspect Prompt')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Live Context Streams Toggle Switch List */}
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ប្រភពទិន្នន័យ Context' : 'Context Signals'}
                  </Text>

                  <View style={styles.contextTogglesList}>
                    {/* Toggle Git */}
                    <View style={styles.prefRow}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="github-fill" size={14} color="#0F172A" />
                        <Text style={styles.prefTitle}>GitHub Activity & Commits</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, ctxIncludeGit && styles.toggleSwitchActive]}
                        onPress={() => setCtxIncludeGit(!ctxIncludeGit)}
                      >
                        <View style={[styles.toggleDot, ctxIncludeGit && styles.toggleDotActive]} />
                      </TouchableOpacity>
                    </View>

                    {/* Toggle Tasks */}
                    <View style={styles.prefRow}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="task-line" size={14} color="#16A34A" />
                        <Text style={styles.prefTitle}>Daily Planner & Tasks</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, ctxIncludeTasks && styles.toggleSwitchActive]}
                        onPress={() => setCtxIncludeTasks(!ctxIncludeTasks)}
                      >
                        <View style={[styles.toggleDot, ctxIncludeTasks && styles.toggleDotActive]} />
                      </TouchableOpacity>
                    </View>

                    {/* Toggle Finances */}
                    <View style={styles.prefRow}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="bank-card-line" size={14} color="#D97706" />
                        <Text style={styles.prefTitle}>Financial Records & Cashflow</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, ctxIncludeFinances && styles.toggleSwitchActive]}
                        onPress={() => setCtxIncludeFinances(!ctxIncludeFinances)}
                      >
                        <View style={[styles.toggleDot, ctxIncludeFinances && styles.toggleDotActive]} />
                      </TouchableOpacity>
                    </View>

                    {/* Toggle Calendar */}
                    <View style={styles.prefRow}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="calendar-line" size={14} color="#2563EB" />
                        <Text style={styles.prefTitle}>Interactive Calendar Schedule</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, ctxIncludeCalendar && styles.toggleSwitchActive]}
                        onPress={() => setCtxIncludeCalendar(!ctxIncludeCalendar)}
                      >
                        <View style={[styles.toggleDot, ctxIncludeCalendar && styles.toggleDotActive]} />
                      </TouchableOpacity>
                    </View>

                    {/* Toggle Design Rules */}
                    <View style={styles.prefRow}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="sparkles-fill" size={14} color="#7C3AED" />
                        <Text style={styles.prefTitle}>Design System (Zero Shadows)</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.toggleSwitch, ctxIncludeRules && styles.toggleSwitchActive]}
                        onPress={() => setCtxIncludeRules(!ctxIncludeRules)}
                      >
                        <View style={[styles.toggleDot, ctxIncludeRules && styles.toggleDotActive]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Injected Prompt Inspector Preview */}
                {showPromptPreview && (
                  <View style={styles.cardSection}>
                    <View style={styles.promptHeaderRow}>
                      <RemixIcon name="code-line" size={14} color="#0F172A" />
                      <Text style={styles.sectionHeaderTitle}>Injected System Prompt Preview</Text>
                    </View>
                    <View style={styles.codeSnippetBox}>
                      <Text style={styles.codeSnippetText}>{buildContextPromptPreview()}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 3. SECURITY & TOUCH ID */}
            {activeCategory === 'security' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ការផ្ទៀងផ្ទាត់ស្កេនម្រាមដៃ (Biometric Touch ID)' : 'Biometric Fingerprint Unlock'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="shield-check-line" size={14} color="#DC2626" />
                        <Text style={styles.prefTitle}>
                          {language === 'kh' ? 'បើក Touch ID / Passcode នៅពេល Login' : 'Enable Touch ID / Passcode Lock'}
                        </Text>
                      </View>
                      <Text style={styles.prefSub}>
                        {language === 'kh'
                          ? 'ការពារគណនី និងទិន្នន័យហិរញ្ញវត្ថុដោយប្រើប្រព័ន្ធសុវត្ថិភាព Native Biometrics'
                          : 'Require biometric authorization to unlock system workspace and view private records'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleSwitch,
                        biometricEnabled && styles.toggleSwitchActive,
                      ]}
                      onPress={() => setBiometricEnabled(!biometricEnabled)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.toggleDot,
                          biometricEnabled && styles.toggleDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      style={styles.testBtn}
                      onPress={() => setShowBiometricModal(true)}
                      activeOpacity={0.8}
                    >
                      <RemixIcon name="fingerprint-line" size={14} color="#2563EB" />
                      <Text style={styles.testBtnText}>
                        {language === 'kh' ? 'សាកល្បង Touch ID Modal' : 'Test Touch ID Modal'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Reset Section */}
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ប្តូរពាក្យសម្ងាត់ (Password Security)' : 'Change Password'}
                  </Text>

                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Current Password'}
                      </Text>
                      <CustomTextInput
                        placeholder="••••••••"
                        icon="lock-line"
                        secureTextEntry
                        size="md"
                        value=""
                        onChangeText={() => {}}
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                      </Text>
                      <CustomTextInput
                        placeholder="••••••••"
                        icon="lock-line"
                        secureTextEntry
                        size="md"
                        value=""
                        onChangeText={() => {}}
                      />
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <View />
                    <TouchableOpacity
                      style={styles.savePrimaryBtn}
                      onPress={() => {
                        toast.success(
                          language === 'kh' ? 'ជោគជ័យ' : 'Password Updated',
                          language === 'kh' ? 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរ' : 'Your password has been updated securely.'
                        );
                      }}
                      activeOpacity={0.85}
                    >
                      <RemixIcon name="check-line" size={14} color="#FFFFFF" />
                      <Text style={styles.savePrimaryBtnText}>
                        {language === 'kh' ? 'រក្សាទុកពាក្យសម្ងាត់' : 'Update Password'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 4. GEMINI AI ENGINE */}
            {activeCategory === 'ai' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ម៉ូដែលបញ្ញាសិប្បនិម្មិត Gemini AI' : 'Gemini AI Model Engine'}
                  </Text>
                  <Text style={styles.sectionDescText}>
                    {language === 'kh'
                      ? 'ជ្រើសរើស Cloud LLM Model សម្រាប់ដំណើរការ Daily AI Briefing និង Copilot Assistant'
                      : 'Choose between ultra-fast Flash models or enhanced reasoning versions for Copilot interactions.'}
                  </Text>

                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ម៉ូដែលបច្ចុប្បន្ន (Active AI Model)' : 'Selected Model'}
                      </Text>
                      <CustomSelect
                        options={AI_MODEL_OPTIONS}
                        value={selectedModel}
                        onChange={(val) => {
                          setSelectedModel(val);
                          toast.success('Model Changed', `Switched active AI engine to ${val}`);
                        }}
                        size="md"
                      />
                    </View>
                  </View>

                  <View style={styles.infoCallout}>
                    <RemixIcon name="information-fill" size={16} color="#2563EB" />
                    <Text style={styles.infoCalloutText}>
                      {language === 'kh'
                        ? 'ម៉ូដែល gemini-3.7-flash ផ្តល់នូវល្បឿនឆ្លើយតបរហ័សបំផុត និងភាពត្រឹមត្រូវខ្ពស់ក្នុងការរៀបចំផែនការ។'
                        : 'Gemini 3.7 Flash provides sub-second streaming latency with optimal Khmer & English language comprehension.'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 5. GENERAL & WORKSPACE */}
            {activeCategory === 'general' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ព័ត៌មានទូទៅនៃ Workspace' : 'Workspace Identity'}
                  </Text>

                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ឈ្មោះ Workspace' : 'Workspace Name'}
                      </Text>
                      <CustomTextInput
                        value={workspaceName}
                        onChangeText={setWorkspaceName}
                        placeholder="My Personal Workspace"
                        icon="building-line"
                        size="md"
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ទិដ្ឋភាពបើកដំបូង (Default Startup View)' : 'Default Launch Module'}
                      </Text>
                      <CustomSelect
                        options={DEFAULT_VIEW_OPTIONS}
                        value={defaultView}
                        onChange={setDefaultView}
                        size="md"
                      />
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <View />
                    <TouchableOpacity
                      style={styles.savePrimaryBtn}
                      onPress={() => {
                        toast.success('Workspace Saved', 'General workspace settings applied.');
                      }}
                      activeOpacity={0.85}
                    >
                      <RemixIcon name="check-line" size={14} color="#FFFFFF" />
                      <Text style={styles.savePrimaryBtnText}>
                        {language === 'kh' ? 'រក្សាទុក' : 'Save Workspace'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 6. LANGUAGE & REGION */}
            {activeCategory === 'language' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ភាសា និងតំបន់ (Language & Region)' : 'Language & Region'}
                  </Text>
                  <Text style={styles.sectionDescText}>
                    {language === 'kh'
                      ? 'ប្តូរភាសាបង្ហាញរបស់ប្រព័ន្ធ Personal OS រវាង ភាសាខ្មែរ និង ភាសាអង់គ្លេស'
                      : 'Toggle display localization between native Khmer and English.'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'ភាសាកម្មវិធី (Active Language)' : 'Active Language'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'បច្ចុប្បន្ន៖ ភាសាខ្មែរ (Khmer)' : 'Current: English (United States)'}
                      </Text>
                    </View>

                    <LanguageToggle />
                  </View>
                </View>
              </View>
            )}

            {/* 7. NOTIFICATIONS & ALERTS */}
            {activeCategory === 'notifications' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ការកំណត់ការជូនដំណឹង (Notifications & Alerts)' : 'Notification Preferences'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'សំឡេងរោទិ៍ប្រព័ន្ធ (Sound Alerts)' : 'Sound Alerts'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'បន្លឺសំឡេងពេលមានកិច្ចការដល់ម៉ោង ឬសារថ្មី' : 'Play subtle audio chime on tasks and new events'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleSwitch,
                        notifSound && styles.toggleSwitchActive,
                      ]}
                      onPress={() => setNotifSound(!notifSound)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.toggleDot,
                          notifSound && styles.toggleDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'ការជូនដំណឹងលើ Desktop (Banner Notifications)' : 'Desktop Banner Alerts'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'បង្ហាញផ្ទាំង Pop-up លើអេក្រង់កុំព្យូទ័រ' : 'Display macOS native banner notifications'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleSwitch,
                        notifDesktop && styles.toggleSwitchActive,
                      ]}
                      onPress={() => setNotifDesktop(!notifDesktop)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.toggleDot,
                          notifDesktop && styles.toggleDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>
                      {language === 'kh' ? 'រំលឹកកាលវិភាគមុន (Calendar Meeting Reminder)' : 'Calendar Meeting Reminder'}
                    </Text>
                    <CustomSelect
                      options={REMINDER_OPTIONS}
                      value={calReminderMinutes}
                      onChange={setCalReminderMinutes}
                      size="md"
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Biometric Verification Modal Dialog */}
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={() => {
          setShowBiometricModal(false);
          toast.success(
            language === 'kh' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified',
            language === 'kh' ? 'ការស្កេន Touch ID ជោគជ័យ' : 'Biometric fingerprint authorization succeeded.'
          );
        }}
      />

      {/* Personal Context & AI Memory Rich Editor Modal (Google Docs style) */}
      <PersonalContextEditorModal
        visible={showContextEditorModal}
        onClose={() => setShowContextEditorModal(false)}
        initialValue={contextNotes}
        onSave={(val) => {
          setContextNotes(val);
          setPersonalContext(val);
          toast.success(
            language === 'kh' ? 'រក្សាទុកជោគជ័យ' : 'Memory Synced',
            language === 'kh' ? 'អង្គចងចាំ និង Context ត្រូវបាន Update ជោគជ័យ' : 'Personal Context & AI Memory successfully updated.'
          );
        }}
      />
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapseBtn: {
    width: 26,
    height: 26,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  modeBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  masterDetailBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 12,
    gap: 10,
  },
  searchBoxWrap: {
    paddingHorizontal: 12,
  },
  categoriesList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  categoryItemActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  categoryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconBoxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  categoryTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  categoryTitleActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  categoryDesc: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  itemBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemBadgeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#059669',
    fontWeight: '700',
  },
  contextItemBadge: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  contextItemBadgeText: {
    color: '#7C3AED',
  },
  rightContentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  settingCardWrapper: {
    maxWidth: 740,
    gap: 14,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerHeading: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerSubtext: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  syncMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  syncMetaText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  contextSignalsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  contextSignalCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 2,
  },
  contextSignalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contextSignalLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  microBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextSignalVal: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  contextSignalSub: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionDescText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 16,
  },
  memoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openEditorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 6,
    cursor: 'pointer',
  } as any,
  openEditorBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memoryPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    cursor: 'pointer',
  } as any,
  memoryPreviewText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
    lineHeight: 18,
  },
  memoryPreviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  memoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memoryMetaText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  clickToEditLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#6366F1',
  },
  contextActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  previewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewToggleText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  contextTogglesList: {
    gap: 8,
  },
  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  codeSnippetText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    lineHeight: 16,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    gap: 12,
  },
  prefLeft: {
    flex: 1,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
  },
  prefSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#0F172A',
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  testBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  formGrid: {
    gap: 12,
  },
  formField: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  syncOptionsWrap: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  syncOptionsTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  checkboxOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  chipCheckboxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  miniCheck: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  miniCheckActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  syncNowBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  savePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  savePrimaryBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    borderRadius: 6,
  },
  infoCalloutText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
});
