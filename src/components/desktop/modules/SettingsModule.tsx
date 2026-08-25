import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { RemixIcon, RemixIconName } from '../../ui/RemixIcon';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { LanguageToggle } from '../../ui/LanguageToggle';
import { BiometricAuthModal } from '../BiometricAuthModal';
import { toast } from '../../../store/useToastStore';

type SettingCategoryId = 'github' | 'security' | 'ai' | 'general' | 'language' | 'notifications';

interface SettingCategory {
  id: SettingCategoryId;
  titleKh: string;
  titleEn: string;
  descKh: string;
  descEn: string;
  icon: RemixIconName;
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

  const [activeCategory, setActiveCategory] = useState<SettingCategoryId>('github');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);

  // GitHub Local State
  const [ghUsername, setGhUsername] = useState(githubConfig.username);
  const [ghRepo, setGhRepo] = useState(githubConfig.repo);
  const [ghAutoSync, setGhAutoSync] = useState(githubConfig.autoSync);
  const [syncCommits, setSyncCommits] = useState(true);
  const [syncMilestones, setSyncMilestones] = useState(true);
  const [syncReleases, setSyncReleases] = useState(true);
  const [isSyncingGh, setIsSyncingGh] = useState(false);

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

  const categories: SettingCategory[] = [
    {
      id: 'github',
      titleKh: 'GitHub & Auto-Sync',
      titleEn: 'GitHub & Auto-Sync',
      descKh: 'Sync កាលបរិច្ឆេទ Commits & Milestones ចូល Calendar',
      descEn: 'Auto-sync commits and milestones directly to calendar',
      icon: 'github-fill',
      badge: ghAutoSync ? 'Active' : undefined,
    },
    {
      id: 'security',
      titleKh: 'សុវត្ថិភាព & Touch ID',
      titleEn: 'Security & Touch ID',
      descKh: 'ស្កេនម្រាមដៃ និងការការពារគណនី',
      descEn: 'Biometric fingerprint unlock & password settings',
      icon: 'fingerprint-line',
    },
    {
      id: 'ai',
      titleKh: 'ម៉ូដែល Gemini AI',
      titleEn: 'Gemini AI Engine',
      descKh: 'ជ្រើសរើស LLM Model និង Copilot Speed',
      descEn: 'Select intelligent cloud model & prompt creativity',
      icon: 'sparkles-fill',
    },
    {
      id: 'general',
      titleKh: 'ទូទៅ & Workspace',
      titleEn: 'General & Workspace',
      descKh: 'ឈ្មោះ Workspace និងទិដ្ឋភាពដើម',
      descEn: 'Workspace name, default module & profile headline',
      icon: 'building-line',
    },
    {
      id: 'language',
      titleKh: 'ភាសា & ការបង្ហាញ',
      titleEn: 'Language & Region',
      descKh: 'ប្តូរភាសាបង្ហាញ ខ្មែរ / English',
      descEn: 'Display language, date formatting & currency',
      icon: 'emotion-line',
    },
    {
      id: 'notifications',
      titleKh: 'ការជូនដំណឹង & សំឡេង',
      titleEn: 'Notifications & Alerts',
      descKh: 'សំឡេងរោទិ៍ និងការរំលឹកកាលវិភាគ',
      descEn: 'Sound alerts, desktop banner & calendar triggers',
      icon: 'bell-line',
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
      autoSync: ghAutoSync,
    });
    await syncGithubEvents(false);
    setIsSyncingGh(false);
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

      {/* Two-Column Master-Detail Layout (Like Chat Module) */}
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
                      <RemixIcon
                        name={item.icon}
                        size={16}
                        color={isActive ? '#0F172A' : '#64748B'}
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
                          <View style={styles.itemBadge}>
                            <Text style={styles.itemBadgeText}>{item.badge}</Text>
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
                    <RemixIcon name="github-fill" size={28} color="#0F172A" />
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
                        placeholder="e.g. cheolsovandara"
                        icon="user-line"
                        size="md"
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'Repository Name (ស្រេចចិត្ត)' : 'Repository Name (Optional)'}
                      </Text>
                      <CustomTextInput
                        value={ghRepo}
                        onChangeText={setGhRepo}
                        placeholder="e.g. EPR or personal-os"
                        icon="folder-line"
                        size="md"
                      />
                    </View>
                  </View>

                  {/* Sync Filters */}
                  <View style={styles.syncOptionsWrap}>
                    <Text style={styles.syncOptionsTitle}>
                      {language === 'kh' ? 'ទិន្នន័យដែលត្រូវ Sync៖' : 'Activity types to include:'}
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
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? '📦 Daily Commits' : '📦 Commits'}
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
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? '🎯 Milestones' : '🎯 Milestones'}
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
                        <Text style={styles.chipLabel}>
                          {language === 'kh' ? '🚀 Releases' : '🚀 Releases'}
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

            {/* 2. SECURITY & TOUCH ID */}
            {activeCategory === 'security' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ការផ្ទៀងផ្ទាត់ស្កេនម្រាមដៃ (Biometric Touch ID)' : 'Biometric Fingerprint Unlock'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <View style={styles.labelWithIcon}>
                        <RemixIcon name="fingerprint-line" size={15} color="#0F172A" />
                        <Text style={styles.prefTitle}>
                          {language === 'kh' ? 'បើកប្រើ Touch ID' : 'Touch ID / Fingerprint'}
                        </Text>
                      </View>
                      <Text style={styles.prefSub}>
                        {language === 'kh'
                          ? 'ដោះសោ Workspace និង Sign In ភ្លាមៗដោយស្កេនម្រាមដៃ 1-Click Instant'
                          : 'Instant passwordless authentication on this device'}
                      </Text>
                    </View>

                    <View style={styles.actionGroup}>
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

                      {biometricEnabled && (
                        <TouchableOpacity
                          style={styles.testBtn}
                          onPress={() => setShowBiometricModal(true)}
                          activeOpacity={0.8}
                        >
                          <RemixIcon name="fingerprint-line" size={12} color="#2563EB" />
                          <Text style={styles.testBtnText}>
                            {language === 'kh' ? 'សាកល្បងស្កេន' : 'Test Scan'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Password Management */}
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ផ្លាស់ប្តូរលេខសម្ងាត់' : 'Change Account Password'}
                  </Text>

                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'លេខសម្ងាត់បច្ចុប្បន្ន' : 'Current Password'}
                      </Text>
                      <CustomTextInput
                        value="••••••••••••"
                        placeholder="Current password"
                        icon="lock-line"
                        size="md"
                        editable={false}
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'លេខសម្ងាត់ថ្មី' : 'New Password'}
                      </Text>
                      <CustomTextInput
                        value=""
                        placeholder={language === 'kh' ? 'បញ្ចូលលេខសម្ងាត់ថ្មី...' : 'Enter new password...'}
                        icon="lock-fill"
                        size="md"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 3. GEMINI AI ENGINE */}
            {activeCategory === 'ai' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ម៉ូដែលបញ្ញាសិប្បនិម្មិត Gemini' : 'Google Gemini Intelligence'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'ម៉ូដែល LLM សកម្ម' : 'Active Gemini AI Model'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh'
                          ? 'ជ្រើសរើសម៉ូដែលឆ្លាតវៃសម្រាប់ Copilot និងជំនួយការ'
                          : 'Cloud model for goal breakdown, expense extraction, and copilot reasoning'}
                      </Text>
                    </View>

                    <View style={{ width: 200 }}>
                      <CustomSelect
                        options={AI_MODEL_OPTIONS}
                        value={selectedModel}
                        onChange={setSelectedModel}
                        size="md"
                        variant="filled"
                        menuWidth={220}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 4. GENERAL & WORKSPACE */}
            {activeCategory === 'general' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ព័ត៌មាន Workspace' : 'Workspace Details'}
                  </Text>

                  <View style={styles.formGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ឈ្មោះ Workspace' : 'Workspace Name'}
                      </Text>
                      <CustomTextInput
                        value={workspaceName}
                        onChangeText={setWorkspaceName}
                        placeholder="Personal Workspace"
                        icon="building-line"
                        size="md"
                      />
                    </View>

                    <View style={styles.formField}>
                      <Text style={styles.inputLabel}>
                        {language === 'kh' ? 'ទំព័រដើម (Default Landing Page)' : 'Default Landing Module'}
                      </Text>
                      <CustomSelect
                        options={DEFAULT_VIEW_OPTIONS}
                        value={defaultView}
                        onChange={setDefaultView}
                        size="md"
                        variant="filled"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 5. LANGUAGE & REGION */}
            {activeCategory === 'language' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ភាសាកម្មវិធី' : 'Display Language'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'ជ្រើសរើសភាសា' : 'Select Interface Language'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'ប្តូររវាង ភាសាខ្មែរ និង English' : 'Toggle between Khmer and English'}
                      </Text>
                    </View>

                    <LanguageToggle />
                  </View>
                </View>
              </View>
            )}

            {/* 6. NOTIFICATIONS & ALERTS */}
            {activeCategory === 'notifications' && (
              <View style={styles.settingCardWrapper}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeaderTitle}>
                    {language === 'kh' ? 'ការជូនដំណឹង & ការរំលឹក' : 'Notifications & Lead Time'}
                  </Text>

                  <View style={styles.prefRow}>
                    <View style={styles.prefLeft}>
                      <Text style={styles.prefTitle}>
                        {language === 'kh' ? 'សំឡេងជូនដំណឹង' : 'Sound Alerts'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'បន្លឺសំឡេងពេលមានសារ ឬព្រឹត្តិការណ៍' : 'Play audio chime on new reminders'}
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
                        {language === 'kh' ? 'រំលឹកកាលវិភាគមុនពេល' : 'Calendar Reminder Lead Time'}
                      </Text>
                      <Text style={styles.prefSub}>
                        {language === 'kh' ? 'កំណត់ម៉ោងរំលឹកមុនកាលបរិច្ឆេទ' : 'Trigger notification ahead of event'}
                      </Text>
                    </View>

                    <View style={{ width: 180 }}>
                      <CustomSelect
                        options={REMINDER_OPTIONS}
                        value={calReminderMinutes}
                        onChange={setCalReminderMinutes}
                        size="sm"
                        variant="filled"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Biometric Touch ID Modal */}
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={() => setBiometricEnabled(true)}
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
    height: 48,
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
    gap: 12,
  },
  collapseBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
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
    color: '#475569',
    fontWeight: '600',
  },
  masterDetailBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 260,
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
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconBoxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
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
  rightContentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  settingCardWrapper: {
    maxWidth: 720,
    gap: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    gap: 14,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    gap: 14,
  },
  sectionHeaderTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
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
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
  },
  prefSub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#0F172A',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingHorizontal: 16,
    paddingVertical: 7.5,
    borderRadius: 6,
  },
  savePrimaryBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
