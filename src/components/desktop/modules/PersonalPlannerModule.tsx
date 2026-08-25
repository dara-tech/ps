import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { CustomModal } from '../../ui/CustomModal';
import { TaskPriority, TaskStatus } from '../../../../shared';

export const PersonalPlannerModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const tasks = useDesktopStore((state) => state.tasks);
  const calendarEvents = useDesktopStore((state) => state.calendarEvents);
  const createTask = useDesktopStore((state) => state.createTask);
  const updateTaskStatus = useDesktopStore((state) => state.updateTaskStatus);
  const updateTask = useDesktopStore((state) => state.updateTask);
  const deleteTask = useDesktopStore((state) => state.deleteTask);
  const toggleCalendarEvent = useDesktopStore((state) => state.toggleCalendarEvent);
  const updateCalendarEvent = useDesktopStore((state) => state.updateCalendarEvent);
  const deleteCalendarEvent = useDesktopStore((state) => state.deleteCalendarEvent);
  const breakdownGoalWithAi = useDesktopStore((state) => state.breakdownGoalWithAi);

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiPlanning, setIsAiPlanning] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<PlannerUnifiedItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editStatus, setEditStatus] = useState<TaskStatus | 'todo' | 'in_progress' | 'done'>('todo');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'low', badgeColor: '#94A3B8' },
    { label: 'Medium', value: 'medium', badgeColor: '#3B82F6' },
    { label: 'High', value: 'high', badgeColor: '#F59E0B' },
    { label: 'Urgent', value: 'urgent', badgeColor: '#EF4444' },
  ];

  const STATUS_OPTIONS = [
    { label: 'To Do', value: 'todo', badgeColor: '#64748B' },
    { label: 'In Progress', value: 'in_progress', badgeColor: '#3B82F6' },
    { label: 'Completed', value: 'done', badgeColor: '#10B981' },
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

  const openEditModal = (item: PlannerUnifiedItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditPriority(item.priority);
    setEditStatus(item.status || (item.isCompleted ? 'done' : 'todo'));
    setEditDate(item.date || '');
    setEditTime(item.time || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editTitle.trim() || isSavingEdit) return;
    try {
      setIsSavingEdit(true);
      if (editingItem.source === 'task') {
        await updateTask(editingItem.id, {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          status: editStatus as TaskStatus,
          dueDate: editDate || undefined,
        });
      } else {
        await updateCalendarEvent(editingItem.id, {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          isCompleted: editStatus === 'done',
          date: editDate || editingItem.date,
          time: editTime || editingItem.time,
        });
      }
      setEditingItem(null);
    } finally {
      setIsSavingEdit(false);
    }
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

  interface PlannerUnifiedItem {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus | 'todo' | 'in_progress' | 'done';
    isCompleted: boolean;
    source: 'task' | 'calendar';
    date?: string;
    time?: string;
    type?: string;
  }

  // Non-git calendar events scheduled by user or AI
  const userCalendarItems: PlannerUnifiedItem[] = calendarEvents
    .filter((e) => !e.id.startsWith('gh-') && !e.title.startsWith('[Git'))
    .map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      priority: (e.priority as TaskPriority) || 'medium',
      status: e.isCompleted ? 'done' : 'todo',
      isCompleted: Boolean(e.isCompleted),
      source: 'calendar' as const,
      date: e.date,
      time: e.time,
      type: e.type,
    }));

  const regularTaskItems: PlannerUnifiedItem[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority || 'medium',
    status: t.status,
    isCompleted: t.status === 'done',
    source: 'task' as const,
    date: t.dueDate,
  }));

  const allPlannerItems: PlannerUnifiedItem[] = [...regularTaskItems, ...userCalendarItems];

  const filteredTasks = allPlannerItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'done') return item.isCompleted;
    if (filter === 'in_progress') return item.status === 'in_progress';
    if (filter === 'todo') return !item.isCompleted && item.status !== 'in_progress';
    return true;
  });

  const maxPage = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const activePage = Math.min(page, maxPage);
  const paginatedTasks = filteredTasks.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <View style={styles.container}>
      {/* Top Standard Header Rail (44px) - Clean Title Only on Left */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <Text style={styles.moduleTitle}>{t.planTitle}</Text>
        </View>

        <View style={styles.headerRight}>
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

          <TouchableOpacity
            style={styles.aiBreakdownBtn}
            onPress={() => setShowAiModal(true)}
            activeOpacity={0.8}
          >
            <RemixIcon name="sparkles-fill" size={12} color="#2563EB" />
            <Text style={styles.aiBreakdownText}>{t.planBreakdown}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Task Input Bar */}
      <View style={styles.quickAddBar}>
        <View style={styles.quickInputWrapper}>
          <RemixIcon name="add-line" size={15} color="#64748B" />
          <TextInput
            style={styles.quickTextInput}
            value={taskInput}
            onChangeText={setTaskInput}
            placeholder={t.planQuickAddPlaceholder}
            placeholderTextColor="#94A3B8"
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
          />
          <View style={styles.quickRightActions}>
            <CustomSelect
              options={PRIORITY_OPTIONS}
              value={taskPriority}
              onChange={(val) => setTaskPriority(val as TaskPriority)}
              size="sm"
              variant="outline"
              menuWidth={130}
            />
            <TouchableOpacity
              style={[styles.addBtn, !taskInput.trim() && styles.addBtnDisabled]}
              onPress={handleQuickAdd}
              disabled={!taskInput.trim()}
              activeOpacity={0.75}
            >
              <Text style={styles.addBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Edit Item Modal Dialog */}
      <CustomModal
        visible={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.source === 'calendar' ? 'កែសម្រួល Event' : 'កែសម្រួល Task'}
        icon="pencil-line"
        maxWidth={480}
      >
        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>Title</Text>
          <CustomTextInput
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Item title..."
            size="md"
            containerStyle={styles.modalInputSpacing}
          />

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCol}>
              <Text style={styles.inputLabel}>Priority</Text>
              <CustomSelect
                options={PRIORITY_OPTIONS}
                value={editPriority}
                onChange={(val) => setEditPriority(val as TaskPriority)}
                size="md"
                variant="outline"
              />
            </View>
            <View style={styles.dateTimeCol}>
              <Text style={styles.inputLabel}>Status</Text>
              <CustomSelect
                options={STATUS_OPTIONS}
                value={editStatus}
                onChange={(val) => setEditStatus(val as any)}
                size="md"
                variant="outline"
              />
            </View>
          </View>

          {editingItem?.source === 'calendar' && (
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeCol}>
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <CustomTextInput
                  value={editDate}
                  onChangeText={setEditDate}
                  placeholder="2026-08-27"
                  size="md"
                />
              </View>
              <View style={styles.dateTimeCol}>
                <Text style={styles.inputLabel}>Time</Text>
                <CustomTextInput
                  value={editTime}
                  onChangeText={setEditTime}
                  placeholder="09:00 AM"
                  size="md"
                />
              </View>
            </View>
          )}

          <Text style={styles.inputLabel}>Description / Notes</Text>
          <CustomTextInput
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Add details, notes, or description..."
            multiline
            numberOfLines={3}
            size="md"
            containerStyle={styles.modalInputSpacing}
          />
        </View>

        <View style={styles.modalActions}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => setEditingItem(null)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.planBtn, (!editTitle.trim() || isSavingEdit) && styles.planBtnDisabled]}
            onPress={handleSaveEdit}
            disabled={!editTitle.trim() || isSavingEdit}
          >
            {isSavingEdit ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.planBtnText}>Save Changes</Text>
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
          <View style={styles.tasksContainerCard}>
            {paginatedTasks.map((t, idx) => {
              const isDone = t.isCompleted;
              const isLast = idx === paginatedTasks.length - 1;
              return (
                <View
                  key={t.id}
                  style={[
                    styles.taskRow,
                    isLast && styles.taskRowLast,
                    isDone && styles.taskRowDone,
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      if (t.source === 'task') {
                        updateTaskStatus(t.id, isDone ? 'todo' : 'done');
                      } else {
                        toggleCalendarEvent(t.id);
                      }
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    {isDone && <RemixIcon name="check-line" size={11} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <Pressable
                    style={styles.taskInfo}
                    onPress={() => openEditModal(t)}
                  >
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                      {t.title}
                    </Text>
                    {t.description ? (
                      <Text style={styles.taskDesc} numberOfLines={1}>
                        {t.description}
                      </Text>
                    ) : null}
                  </Pressable>

                  <View style={styles.taskActionsRight}>
                    {t.source === 'calendar' && (
                      <View style={styles.calendarTag}>
                        <RemixIcon name="calendar-line" size={11} color="#6366F1" />
                        <Text style={styles.calendarTagText}>
                          {t.date}{t.time ? ` • ${t.time}` : ''}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.priorityBadge,
                        t.priority === 'urgent' && styles.priorityUrgent,
                        t.priority === 'high' && styles.priorityHigh,
                        t.priority === 'medium' && styles.priorityMedium,
                        t.priority === 'low' && styles.priorityLow,
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          t.priority === 'urgent' && { backgroundColor: '#EF4444' },
                          t.priority === 'high' && { backgroundColor: '#F59E0B' },
                          t.priority === 'medium' && { backgroundColor: '#3B82F6' },
                          t.priority === 'low' && { backgroundColor: '#94A3B8' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          t.priority === 'urgent' && styles.priorityTextUrgent,
                          t.priority === 'high' && styles.priorityTextHigh,
                          t.priority === 'medium' && styles.priorityTextMedium,
                          t.priority === 'low' && styles.priorityTextLow,
                        ]}
                      >
                        {t.priority.toUpperCase()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.editTaskBtn}
                      onPress={() => openEditModal(t)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.6}
                    >
                      <RemixIcon
                        name="pencil-line"
                        size={13}
                        color="#64748B"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteTaskBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (t.source === 'task') {
                          deleteTask(t.id);
                        } else {
                          deleteCalendarEvent(t.id);
                        }
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.6}
                    >
                      <RemixIcon
                        name="delete-bin-line"
                        size={13}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Pagination */}
      <DesktopPagination
        currentPage={activePage}
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
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  quickInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingLeft: 12,
    paddingRight: 5,
    height: 38,
    gap: 8,
  },
  quickTextInput: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    height: '100%',
    padding: 0,
    outlineStyle: 'none',
  } as any,
  quickRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
  },
  addBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    borderRadius: 4,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  addBtnText: {
    fontSize: 10.5,
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
  tasksContainerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
    minHeight: 52,
  },
  taskRowLast: {
    borderBottomWidth: 0,
  },
  taskRowDone: {
    backgroundColor: '#F8FAFC',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskInfo: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 19,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  calendarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 5,
  },
  calendarTagText: {
    fontSize: 10.5,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#475569',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  priorityUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  priorityHigh: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  priorityMedium: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  priorityLow: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  priorityText: {
    fontSize: 9.5,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priorityTextUrgent: {
    color: '#DC2626',
  },
  priorityTextHigh: {
    color: '#D97706',
  },
  priorityTextMedium: {
    color: '#2563EB',
  },
  priorityTextLow: {
    color: '#64748B',
  },
  taskActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editTaskBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTaskBtn: {
    width: 28,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    gap: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  modalInputSpacing: {
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCol: {
    flex: 1,
    gap: 4,
  },
});
