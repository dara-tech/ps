import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { CustomModal } from '../../ui/CustomModal';
import { TaskPriority } from '../../../../shared';

export const PersonalPlannerModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const tasks = useDesktopStore((state) => state.tasks);
  const createTask = useDesktopStore((state) => state.createTask);
  const updateTaskStatus = useDesktopStore((state) => state.updateTaskStatus);
  const breakdownGoalWithAi = useDesktopStore((state) => state.breakdownGoalWithAi);

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'low', badgeColor: '#94A3B8' },
    { label: 'Medium', value: 'medium', badgeColor: '#3B82F6' },
    { label: 'High', value: 'high', badgeColor: '#F59E0B' },
    { label: 'Urgent', value: 'urgent', badgeColor: '#EF4444' },
  ];

  const handleQuickAdd = async () => {
    if (!taskInput.trim()) return;
    await createTask({
      title: taskInput.trim(),
      priority: taskPriority,
      status: 'todo',
      dueDate: new Date().toISOString(),
    });
    setTaskInput('');
  };

  const handleAiBreakdown = async () => {
    if (!aiGoalInput.trim() || isAiPlanning) return;
    try {
      setIsAiPlanning(true);
      await breakdownGoalWithAi(aiGoalInput.trim());
      setAiGoalInput('');
      setShowAiModal(false);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <View style={styles.tabGroup}>
          {(['all', 'todo', 'in_progress', 'done'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, filter === tab && styles.tabActive]}
              onPress={() => {
                setFilter(tab);
                setPage(1);
              }}
            >
              <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                {tab === 'all' ? t.planAll : tab === 'todo' ? t.planTodo : tab === 'in_progress' ? t.planInProgress : t.planCompleted}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.aiBreakdownBtn}
          onPress={() => setShowAiModal(true)}
        >
          <RemixIcon name="task-line" size={12} color="#2563EB" />
          <Text style={styles.aiBreakdownText}>{t.planBreakdown}</Text>
        </Pressable>
      </View>

      {/* Quick Task Input Bar */}
      <View style={styles.quickAddBar}>
        <CustomTextInput
          containerStyle={styles.quickInputContainer}
          value={taskInput}
          onChangeText={setTaskInput}
          placeholder={t.planQuickAddPlaceholder}
          onSubmitEditing={handleQuickAdd}
          icon="add-line"
          size="md"
          rightElement={
            <View style={styles.quickRightActions}>
              <CustomSelect
                options={PRIORITY_OPTIONS}
                value={taskPriority}
                onChange={(val) => setTaskPriority(val as TaskPriority)}
                size="sm"
                variant="filled"
                menuWidth={140}
              />
              <Pressable
                style={[styles.addBtn, !taskInput.trim() && styles.addBtnDisabled]}
                onPress={handleQuickAdd}
                disabled={!taskInput.trim()}
              >
                <Text style={styles.addBtnText}>Add Task</Text>
              </Pressable>
            </View>
          }
        />
      </View>

      {/* AI Goal Breakdown Modal Dialog */}
      <CustomModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="Break down Goal"
        icon="task-line"
        maxWidth={460}
      >
        <Text style={styles.modalSub}>
          Enter a high-level goal, and Gemini will decompose it into structured, prioritized subtasks.
        </Text>

        <CustomTextInput
          containerStyle={styles.modalInputContainer}
          value={aiGoalInput}
          onChangeText={setAiGoalInput}
          placeholder="e.g. Build native macOS dashboard in React Native"
          onSubmitEditing={handleAiBreakdown}
          autoFocus={true}
          size="md"
        />

        <View style={styles.modalActions}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => setShowAiModal(false)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.planBtn, (!aiGoalInput.trim() || isAiPlanning) && styles.planBtnDisabled]}
            onPress={handleAiBreakdown}
            disabled={!aiGoalInput.trim() || isAiPlanning}
          >
            {isAiPlanning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.planBtnText}>Generate Subtasks</Text>
            )}
          </Pressable>
        </View>
      </CustomModal>

      {/* Tasks List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={[styles.listContent, filteredTasks.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <RemixIcon name="task-line" size={24} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>{t.planNoTasks}</Text>
            <Text style={styles.emptySub}>{t.planCreateTaskSub}</Text>
          </View>
        ) : (
          <View style={styles.tasksWrapper}>
            {paginatedTasks.map((t) => {
              const isDone = t.status === 'done';
              return (
                <View key={t.id} style={styles.taskCard}>
                  <Pressable
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                    onPress={() => updateTaskStatus(t.id, isDone ? 'todo' : 'done')}
                  >
                    {isDone && <RemixIcon name="check-line" size={11} color="#FFFFFF" />}
                  </Pressable>

                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                      {t.title}
                    </Text>
                    {t.description ? (
                      <Text style={styles.taskDesc} numberOfLines={1}>
                        {t.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>{t.priority.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Pagination */}
      <DesktopPagination
        currentPage={page}
        totalItems={filteredTasks.length}
        itemsPerPage={pageSize}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tabText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  aiBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  aiBreakdownText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#6366F1',
  },
  quickAddBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickInputContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  quickRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  addBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSub: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  modalInputContainer: {
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  planBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  planBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  planBtnText: {
    fontSize: 11.5,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  tasksWrapper: {
    gap: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  taskCardDone: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  priorityText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
});
