import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { RemixIcon } from '../ui/RemixIcon';
import { MultiColorSidebarIcon } from '../ui/MultiColorSidebarIcon';

export const PersonalContextDrawer: React.FC = () => {
  const language = useLanguageStore((state) => state.language);
  const isRightPanelVisible = useDesktopStore((state) => state.isRightPanelVisible);
  const toggleRightPanel = useDesktopStore((state) => state.toggleRightPanel);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);
  const githubConfig = useDesktopStore((state) => state.githubConfig);
  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const calendarEvents = useDesktopStore((state) => state.calendarEvents);

  if (!isRightPanelVisible) return null;

  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const handleOpenSettings = () => {
    setActiveModule('settings');
  };

  return (
    <View style={styles.drawer}>
      {/* Top Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerHeaderLeft}>
          <View style={styles.iconBox}>
            <MultiColorSidebarIcon name="context" size={16} />
          </View>
          <Text style={styles.drawerTitle}>
            {language === 'kh' ? 'បរិបទផ្ទាល់ខ្លួន' : 'Personal Context'}
          </Text>
        </View>

        <View style={styles.drawerHeaderRight}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={toggleRightPanel}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <RemixIcon name="close-line" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Content Scroll */}
      <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
        {/* User Identity Context Card */}
        <View style={styles.card}>
          <View style={styles.identityRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.userName}>Dara (dara-tech)</Text>
              <Text style={styles.userRole}>Lead Software Architect</Text>
            </View>
          </View>
          <View style={styles.tagWrap}>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>Expo & RN</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>Node & Express</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>Electron Mac</Text>
            </View>
          </View>
        </View>

        {/* Live Workspace Signals (4 mini cards) */}
        <Text style={styles.sectionTitle}>
          {language === 'kh' ? 'សញ្ញាទិន្នន័យផ្ទាល់ (Live Signals)' : 'Live Signal Streams'}
        </Text>
        <View style={styles.signalsGrid}>
          {/* Signal 1: Git */}
          <View style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <RemixIcon name="github-fill" size={12} color="#0F172A" />
              <Text style={styles.signalLabel}>GitHub</Text>
            </View>
            <Text style={styles.signalVal} numberOfLines={1}>
              {githubConfig.username || 'dara-tech'}/{githubConfig.repo || 'ps'}
            </Text>
            <Text style={styles.signalSub}>{githubConfig.syncedCount || 921} items synced</Text>
          </View>

          {/* Signal 2: Tasks */}
          <View style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <RemixIcon name="task-line" size={12} color="#16A34A" />
              <Text style={styles.signalLabel}>Planner</Text>
            </View>
            <Text style={styles.signalVal}>{pendingTasks} Pending</Text>
            <Text style={styles.signalSub}>{urgentTasks} urgent tasks</Text>
          </View>

          {/* Signal 3: Finances */}
          <View style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <RemixIcon name="bank-card-line" size={12} color="#D97706" />
              <Text style={styles.signalLabel}>Finances</Text>
            </View>
            <Text style={styles.signalVal}>${totalExpense.toFixed(0)}</Text>
            <Text style={styles.signalSub}>{finances.length} records</Text>
          </View>

          {/* Signal 4: Calendar */}
          <View style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <RemixIcon name="calendar-line" size={12} color="#2563EB" />
              <Text style={styles.signalLabel}>Calendar</Text>
            </View>
            <Text style={styles.signalVal}>{calendarEvents.length} Events</Text>
            <Text style={styles.signalSub}>Synced schedule</Text>
          </View>
        </View>

        {/* Permanent Guidelines & Design Rules */}
        <Text style={styles.sectionTitle}>
          {language === 'kh' ? 'ច្បាប់រចនា & អង្គចងចាំ' : 'Active Design Constraints'}
        </Text>
        <View style={styles.card}>
          <View style={styles.ruleItem}>
            <RemixIcon name="checkbox-circle-fill" size={13} color="#10B981" />
            <Text style={styles.ruleText}>Strictly NO SHADOWS (Clean 1px borders)</Text>
          </View>
          <View style={styles.ruleItem}>
            <RemixIcon name="checkbox-circle-fill" size={13} color="#10B981" />
            <Text style={styles.ruleText}>Krasar & Kantumruy Pro Typography</Text>
          </View>
          <View style={styles.ruleItem}>
            <RemixIcon name="checkbox-circle-fill" size={13} color="#10B981" />
            <Text style={styles.ruleText}>16px Standard Padded Modules</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={handleOpenSettings}
          activeOpacity={0.8}
        >
          <RemixIcon name="settings-3-line" size={13} color="#0F172A" />
          <Text style={styles.settingsBtnText}>
            {language === 'kh' ? 'គ្រប់គ្រង Context ក្នុង Settings' : 'Configure Context in Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    flexDirection: 'column',
    height: '100%',
  },
  drawerHeader: {
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#16A34A',
    fontWeight: '700',
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBody: {
    flex: 1,
    padding: 12,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  identityInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tagPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  signalCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    gap: 2,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalLabel: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  signalVal: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  signalSub: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
    flex: 1,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 24,
  },
  settingsBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
});
