import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Project } from '../../../../shared';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';

export const ProjectsModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const projects = useDesktopStore((state) => state.projects);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHealth, setSelectedHealth] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHealth = selectedHealth === 'All' || p.health === selectedHealth;
    return matchesSearch && matchesHealth;
  });

  const paginatedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on_track':
        return { bg: '#ECFDF5', text: '#059669', label: t.goalsOnTrack };
      case 'at_risk':
        return { bg: '#FFFBEB', text: '#D97706', label: t.goalsAtRisk };
      case 'delayed':
        return { bg: '#FEF2F2', text: '#EF4444', label: t.goalsDelayed };
      default:
        return { bg: '#EEF2FF', text: '#6366F1', label: t.goalsCompleted };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Filter & View Switcher Bar */}
      <View style={styles.topControlBar}>
        {/* Search */}
        <CustomTextInput
          containerStyle={styles.searchBox}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.goalsSearchPlaceholder}
          icon="search-line"
          size="sm"
        />

        {/* Health Filter Chips */}
        <View style={styles.chipsRow}>
          {['All', 'on_track', 'at_risk', 'delayed', 'completed'].map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.chip, selectedHealth === h && styles.chipActive]}
              onPress={() => {
                setSelectedHealth(h);
                setPage(1);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedHealth === h && styles.chipTextActive]}>
                {h === 'All'
                  ? t.goalsAll
                  : h === 'on_track'
                  ? t.goalsOnTrack
                  : h === 'at_risk'
                  ? t.goalsAtRisk
                  : h === 'delayed'
                  ? t.goalsDelayed
                  : t.goalsCompleted}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid <-> List Toggle */}
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'grid' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.7}
          >
            <RemixIcon name="grid-line" size={13} color={viewMode === 'grid' ? '#0F172A' : '#94A3B8'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'table' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('table')}
            activeOpacity={0.7}
          >
            <RemixIcon name="list-check-line" size={13} color={viewMode === 'table' ? '#0F172A' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, filteredProjects.length === 0 && styles.contentEmpty]}
        showsVerticalScrollIndicator={false}
      >
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="folder-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>{t.goalsNoProjects}</Text>
            <Text style={styles.emptySub}>{t.goalsNoProjectsSub}</Text>
          </View>
        ) : viewMode === 'grid' ? (
          // Grid View
          <View style={styles.grid}>
            {paginatedProjects.map((proj) => {
              const badge = getHealthBadge(proj.health);
              return (
                <View key={proj.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleBox}>
                      <Text style={styles.projTitle}>{proj.name}</Text>
                      <Text style={styles.projCategory}>Personal Venture</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.projDesc} numberOfLines={2}>
                    {proj.description}
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressBlock}>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>Milestones Progress</Text>
                      <Text style={styles.progressVal}>{proj.progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${proj.progress}%` }]} />
                    </View>
                  </View>

                  {/* Milestones List */}
                  <View style={styles.milestonesList}>
                    {proj.milestones?.map((m) => (
                      <View key={m.id} style={styles.milestoneItem}>
                        <RemixIcon 
                          name={m.completed ? 'checkbox-circle-fill' : 'time-line'} 
                          size={13} 
                          color={m.completed ? '#10B981' : '#94A3B8'} 
                        />
                        <Text style={[styles.milestoneText, m.completed && styles.milestoneTextDone]} numberOfLines={1}>
                          {m.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          // Dense Table View
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 2.5 }]}>GOAL / VENTURE</Text>
              <Text style={[styles.th, { flex: 1 }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>PROGRESS</Text>
            </View>

            {paginatedProjects.map((proj) => {
              const badge = getHealthBadge(proj.health);
              return (
                <View key={proj.id} style={styles.tableRow}>
                  <View style={{ flex: 2.5 }}>
                    <Text style={styles.tdProjName} numberOfLines={1}>{proj.name}</Text>
                    <Text style={styles.tdProjDesc} numberOfLines={1}>{proj.description}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                    <Text style={styles.tdProgressVal}>{proj.progress}%</Text>
                    <View style={styles.tableProgressBg}>
                      <View style={[styles.tableProgressFill, { width: `${proj.progress}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Pagination */}
      <DesktopPagination
        totalItems={filteredProjects.length}
        itemsPerPage={pageSize}
        currentPage={page}
        onPageChange={setPage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topControlBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 240,
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  viewToggleBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  contentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
    gap: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    flex: 1,
    minWidth: 260,
    maxWidth: '49%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleBox: {
    flex: 1,
  },
  projTitle: {
    fontSize: 13,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
  },
  projCategory: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  projDesc: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  progressBlock: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  progressVal: {
    fontSize: 10,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  milestonesList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    flex: 1,
  },
  milestoneTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdProjName: {
    fontSize: 12,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
  },
  tdProjDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  tdProgressVal: {
    fontSize: 11,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  tableProgressBg: {
    width: 60,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  tableProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
});
