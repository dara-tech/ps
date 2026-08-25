import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { RemixIcon } from '../../ui/RemixIcon';

export const LifeDashboardModule: React.FC = () => {
  const selectedModel = useDesktopStore((state) => state.selectedModel);
  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const projects = useDesktopStore((state) => state.projects);
  const isAiOnline = useDesktopStore((state) => state.isAiOnline);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);

  const [briefing, setBriefing] = useState<{ summary: string; focusSuggestion: string; productivityScore: number } | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const fetchBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/ai/daily-briefing?model=${selectedModel}`);
      const json = await res.json();
      setBriefing(json.data);
    } catch (e) {
      setBriefing({
        summary: `You have ${pendingTasks} active tasks on your agenda today.`,
        focusSuggestion: pendingTasks > 0 ? 'Start with your top priority task during your peak energy hours.' : 'All clear! Great time to relax or brainstorm new ideas.',
        productivityScore: 88,
      });
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [selectedModel]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Morning AI Briefing Banner */}
        <View style={styles.aiBriefingCard}>
          <View style={styles.briefingHeader}>
            <View style={styles.briefingTitleRow}>
              <Text style={styles.briefingTitle}>Daily AI Briefing</Text>
              <View style={styles.modelTag}>
                <Text style={styles.modelTagText}>{selectedModel}</Text>
              </View>
            </View>

            <Pressable style={styles.refreshBtn} onPress={fetchBriefing}>
              <RemixIcon name="refresh-line" size={12} color="#64748B" />
            </Pressable>
          </View>

          {loadingBriefing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.loadingText}>Generating personalized briefing with {selectedModel}...</Text>
            </View>
          ) : (
            <View style={styles.briefingBody}>
              <Text style={styles.briefingSummary}>
                {briefing?.summary || 'Good day! All systems are synced.'}
              </Text>
              <View style={styles.focusPill}>
                <RemixIcon name="lightbulb-line" size={12} color="#D97706" />
                <Text style={styles.focusText}>{briefing?.focusSuggestion}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Core KPI Matrix */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>Productivity Velocity</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                <RemixIcon name="task-line" size={13} color="#059669" />
              </View>
            </View>
            <Text style={styles.kpiValue}>{completionRate}%</Text>
            <Text style={styles.kpiSub}>{completedTasks} of {tasks.length} tasks completed</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>Total Expenses</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FEF2F2' }]}>
                <RemixIcon name="bank-card-line" size={13} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.kpiValue}>${totalExpense.toFixed(0)}</Text>
            <Text style={styles.kpiSub}>{finances.length} transactions logged</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <Text style={styles.kpiTitle}>Active Goals</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
                <RemixIcon name="folder-line" size={13} color="#6366F1" />
              </View>
            </View>
            <Text style={styles.kpiValue}>{projects.length}</Text>
            <Text style={styles.kpiSub}>Milestones on track</Text>
          </View>
        </View>

        {/* Quick Launchpad Action Bar */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Launchpad</Text>
          <View style={styles.launchpadGrid}>
            <Pressable style={styles.launchBtn} onPress={() => setActiveModule('copilot')}>
              <View style={[styles.launchIconBox, { backgroundColor: '#EEF2FF' }]}>
                <RemixIcon name="sparkles-fill" size={16} color="#6366F1" />
              </View>
              <Text style={styles.launchBtnTitle}>Open AI Copilot</Text>
              <Text style={styles.launchBtnSub}>Ask questions or brainstorm</Text>
            </Pressable>

            <Pressable style={styles.launchBtn} onPress={() => setActiveModule('planner')}>
              <View style={[styles.launchIconBox, { backgroundColor: '#ECFDF5' }]}>
                <RemixIcon name="task-line" size={16} color="#059669" />
              </View>
              <Text style={styles.launchBtnTitle}>Daily Planner</Text>
              <Text style={styles.launchBtnSub}>Organize today's to-dos</Text>
            </Pressable>

            <Pressable style={styles.launchBtn} onPress={() => setActiveModule('finances')}>
              <View style={[styles.launchIconBox, { backgroundColor: '#FEF3C7' }]}>
                <RemixIcon name="bank-card-line" size={16} color="#D97706" />
              </View>
              <Text style={styles.launchBtnTitle}>Log Expense</Text>
              <Text style={styles.launchBtnSub}>Track daily cash flow</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  aiBriefingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  briefingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  briefingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  briefingTitle: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  modelTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  modelTagText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  refreshBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  briefingBody: {
    gap: 10,
  },
  briefingSummary: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
    lineHeight: 18,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  focusText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#B45309',
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    fontWeight: '600',
  },
  kpiIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  launchpadGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  launchBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  launchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  launchBtnTitle: {
    fontSize: 12,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  launchBtnSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
});
