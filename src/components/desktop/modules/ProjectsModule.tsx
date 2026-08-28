import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { Project, Milestone, Task, TaskPriority } from '../../../../shared';
import { RemixIcon } from '../../ui/RemixIcon';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomModal } from '../../ui/CustomModal';
import { CustomSelect } from '../../ui/CustomSelect';
import { toast } from '../../../store/useToastStore';

export const ProjectsModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const isKh = useLanguageStore((state) => state.language === 'kh');
  const tokens = useThemeStore((state) => state.tokens);
  const projects = useDesktopStore((state) => state.projects);
  const tasks = useDesktopStore((state) => state.tasks);
  const createProject = useDesktopStore((state) => state.createProject);
  const updateProject = useDesktopStore((state) => state.updateProject);
  const deleteProject = useDesktopStore((state) => state.deleteProject);
  const createTask = useDesktopStore((state) => state.createTask);
  const updateTaskStatus = useDesktopStore((state) => state.updateTaskStatus);
  const breakdownGoalWithAi = useDesktopStore((state) => state.breakdownGoalWithAi);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHealth, setSelectedHealth] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [drillDownProject, setDrillDownProject] = useState<Project | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formHealth, setFormHealth] = useState<'on_track' | 'at_risk' | 'delayed' | 'completed'>('on_track');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Modal State
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isAiPlanning, setIsAiPlanning] = useState(false);

  // Inline task in drill-down state
  const [newProjectTaskTitle, setNewProjectTaskTitle] = useState('');
  const [newProjectTaskPriority, setNewProjectTaskPriority] = useState<TaskPriority>('medium');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const DEPARTMENT_OPTIONS = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Mobile Development', value: 'Mobile Development' },
    { label: 'Data Pipeline', value: 'Data Pipeline' },
    { label: 'Personal Venture', value: 'Personal Venture' },
    { label: 'Operations', value: 'Operations' },
  ];

  const HEALTH_OPTIONS = [
    { label: isKh ? 'ដំណើរការល្អ (On Track)' : 'On Track', value: 'on_track', badgeColor: '#10B981' },
    { label: isKh ? 'ប្រឈមហានិភ័យ (At Risk)' : 'At Risk', value: 'at_risk', badgeColor: '#F59E0B' },
    { label: isKh ? 'យឺតយ៉ាវ (Delayed)' : 'Delayed', value: 'delayed', badgeColor: '#EF4444' },
    { label: isKh ? 'បានបញ្ចប់ (Completed)' : 'Completed', value: 'completed', badgeColor: '#6366F1' },
  ];

  const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'low', badgeColor: '#94A3B8' },
    { label: 'Medium', value: 'medium', badgeColor: '#3B82F6' },
    { label: 'High', value: 'high', badgeColor: '#F59E0B' },
    { label: 'Urgent', value: 'urgent', badgeColor: '#EF4444' },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.department || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHealth = selectedHealth === 'All' || p.health === selectedHealth;
      return matchesSearch && matchesHealth;
    });
  }, [projects, searchQuery, selectedHealth]);

  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredProjects, page, pageSize]);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'on_track':
        return { bg: '#ECFDF5', text: '#059669', dot: '#10B981', label: t.goalsOnTrack };
      case 'at_risk':
        return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: t.goalsAtRisk };
      case 'delayed':
        return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444', label: t.goalsDelayed };
      default:
        return { bg: '#EEF2FF', text: '#6366F1', dot: '#6366F1', label: t.goalsCompleted };
    }
  };

  const getProjectStats = (proj: Project) => {
    const projectTasks = tasks.filter(
      (t) => t.projectId === proj.id || t.projectName?.toLowerCase() === proj.name?.toLowerCase()
    );
    const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
    const totalTasks = projectTasks.length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : proj.progress || 0;
    return { projectTasks, completedTasks, totalTasks, taskProgress };
  };

  const openCreateModal = () => {
    setFormName('');
    setFormDepartment('Engineering');
    setFormHealth('on_track');
    setFormDescription('');
    setShowCreateModal(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormName(proj.name);
    setFormDepartment(proj.department || 'Engineering');
    setFormHealth((proj.health as any) || 'on_track');
    setFormDescription(proj.description || '');
  };

  const handleSaveProject = async () => {
    if (!formName.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: formName.trim(),
          department: formDepartment,
          health: formHealth,
          description: formDescription.trim(),
        });
        setEditingProject(null);
      } else {
        await createProject({
          name: formName.trim(),
          department: formDepartment,
          health: formHealth,
          description: formDescription.trim(),
          leadName: 'Dara Sovan',
          milestones: [
            { id: `m-${Date.now()}-1`, title: 'Define scope & requirements', dueDate: new Date().toISOString().split('T')[0], completed: true },
            { id: `m-${Date.now()}-2`, title: 'Core Implementation', dueDate: new Date().toISOString().split('T')[0], completed: false },
          ],
        });
        setShowCreateModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (proj: Project) => {
    deleteProject(proj.id);
  };

  const handleAiBreakdown = async () => {
    if (!aiGoalInput.trim() || isAiPlanning) return;
    try {
      setIsAiPlanning(true);
      // Create project automatically from AI prompt
      const newProj = await createProject({
        name: aiGoalInput.trim(),
        department: 'AI Strategic Plan',
        health: 'on_track',
        description: `AI planned goal initiative for "${aiGoalInput.trim()}".`,
        leadName: 'Dara Sovan',
      });
      // Breakdown tasks
      await breakdownGoalWithAi(aiGoalInput.trim());
      setAiGoalInput('');
      setShowAiModal(false);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const handleAddInlineTask = async () => {
    if (!drillDownProject || !newProjectTaskTitle.trim() || isAddingTask) return;
    try {
      setIsAddingTask(true);
      await createTask({
        title: newProjectTaskTitle.trim(),
        projectId: drillDownProject.id,
        projectName: drillDownProject.name,
        priority: newProjectTaskPriority,
        status: 'todo',
        dueDate: new Date().toISOString(),
      });
      setNewProjectTaskTitle('');
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.windowBg }]}>
      {/* Top Header Rail (44px) - Clean Title Only on Left */}
      <View style={[styles.topRail, { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.moduleTitle, { color: tokens.textPrimary }]}>{t.goalsTitle}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Health Filter Chips with soft tinted pills */}
          <View style={styles.chipsRow}>
            {['All', 'on_track', 'at_risk', 'delayed', 'completed'].map((h) => {
              const isActive = selectedHealth === h;
              return (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.chip,
                    { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle },
                    isActive && { backgroundColor: tokens.surfaceBg, borderColor: tokens.accentColor },
                  ]}
                  onPress={() => {
                    setSelectedHealth(h);
                    setPage(1);
                  }}
                  activeOpacity={0.7}
                >
                  {h !== 'All' && (
                    <View
                      style={[
                        styles.chipDot,
                        {
                          backgroundColor:
                            h === 'on_track'
                              ? '#10B981'
                              : h === 'at_risk'
                              ? '#F59E0B'
                              : h === 'delayed'
                              ? '#EF4444'
                              : '#6366F1',
                        },
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? tokens.textPrimary : tokens.textSecondary },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
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
              );
            })}
          </View>

          {/* Search */}
          <CustomTextInput
            containerStyle={styles.searchBox}
            value={searchQuery}
            onChangeText={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            placeholder={t.goalsSearchPlaceholder}
            icon="search-line"
            size="sm"
          />

          {/* View Toggle */}
          <View style={[styles.viewToggleGroup, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.7}
            >
              <RemixIcon name="grid-line" size={13} color={viewMode === 'grid' ? tokens.textPrimary : tokens.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'table' && { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}
              onPress={() => setViewMode('table')}
              activeOpacity={0.7}
            >
              <RemixIcon name="list-check-line" size={13} color={viewMode === 'table' ? tokens.textPrimary : tokens.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* AI Plan Button */}
          <TouchableOpacity
            style={[styles.aiBtn, { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder }]}
            onPress={() => setShowAiModal(true)}
            activeOpacity={0.7}
          >
            <RemixIcon name="sparkles-fill" size={13} color={tokens.accentColor} />
            <Text style={[styles.aiBtnText, { color: tokens.accentColor }]}>{isKh ? 'AI ផែនការ' : 'AI Plan'}</Text>
          </TouchableOpacity>

          {/* Create Project Button */}
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: tokens.accentColor }]}
            onPress={openCreateModal}
            activeOpacity={0.7}
          >
            <RemixIcon name="add-line" size={14} color={tokens.accentFg} />
            <Text style={[styles.createBtnText, { color: tokens.accentFg }]}>{isKh ? 'បង្កើតគម្រោង' : 'New Project'}</Text>
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
            <View style={[styles.emptyIconCircle, { backgroundColor: tokens.surfaceMuted }]}>
              <RemixIcon name="folder-line" size={24} color={tokens.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: tokens.textPrimary }]}>{t.goalsNoProjects}</Text>
            <Text style={[styles.emptySub, { color: tokens.textSecondary }]}>{t.goalsNoProjectsSub}</Text>
            <TouchableOpacity style={[styles.emptyActionBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]} onPress={openCreateModal} activeOpacity={0.7}>
              <RemixIcon name="add-line" size={13} color={tokens.textPrimary} />
              <Text style={[styles.emptyActionBtnText, { color: tokens.textPrimary }]}>{isKh ? 'បង្កើតគម្រោងដំបូង' : 'Create First Project'}</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.grid}>
            {paginatedProjects.map((proj) => {
              const badge = getHealthBadge(proj.health);
              const { projectTasks, completedTasks, totalTasks, taskProgress } = getProjectStats(proj);

              return (
                <View key={proj.id} style={[styles.card, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.titleBox}>
                      <Text style={[styles.projTitle, { color: tokens.textPrimary }]} numberOfLines={1}>{proj.name}</Text>
                      <View style={[styles.deptBadge, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                        <Text style={[styles.deptText, { color: tokens.textSecondary }]}>{proj.department || 'General'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}>
                      <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                      <Text style={[styles.statusText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.projDesc, { color: tokens.textSecondary }]} numberOfLines={2}>
                    {proj.description || 'No description provided.'}
                  </Text>

                  {/* Progress Bar & Task Count */}
                  <View style={styles.progressBlock}>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: tokens.textSecondary }]}>
                        {totalTasks > 0 ? `${completedTasks}/${totalTasks} Tasks Done` : 'Milestones Progress'}
                      </Text>
                      <Text style={[styles.progressVal, { color: tokens.textPrimary }]}>{taskProgress}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: tokens.surfaceMuted }]}>
                      <View style={[styles.progressBarFill, { width: `${taskProgress}%`, backgroundColor: tokens.accentColor }]} />
                    </View>
                  </View>

                  {/* Milestones / Recent Tasks Checklist */}
                  <View style={[styles.milestonesList, { borderTopColor: tokens.borderSubtle }]}>
                    {projectTasks.length > 0 ? (
                      projectTasks.slice(0, 2).map((tItem) => (
                        <View key={tItem.id} style={styles.milestoneItem}>
                          <TouchableOpacity
                            onPress={() => updateTaskStatus(tItem.id, tItem.status === 'done' ? 'todo' : 'done')}
                            activeOpacity={0.7}
                          >
                            <RemixIcon
                              name={tItem.status === 'done' ? 'checkbox-circle-fill' : 'time-line'}
                              size={13}
                              color={tItem.status === 'done' ? '#10B981' : tokens.textMuted}
                            />
                          </TouchableOpacity>
                          <Text
                            style={[styles.milestoneText, { color: tokens.textSecondary }, tItem.status === 'done' && styles.milestoneTextDone]}
                            numberOfLines={1}
                          >
                            {tItem.title}
                          </Text>
                        </View>
                      ))
                    ) : proj.milestones && proj.milestones.length > 0 ? (
                      proj.milestones.slice(0, 2).map((m) => (
                        <View key={m.id} style={styles.milestoneItem}>
                          <RemixIcon
                            name={m.completed ? 'checkbox-circle-fill' : 'time-line'}
                            size={13}
                            color={m.completed ? '#10B981' : tokens.textMuted}
                          />
                          <Text style={[styles.milestoneText, { color: tokens.textSecondary }, m.completed && styles.milestoneTextDone]} numberOfLines={1}>
                            {m.title}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.noTaskSub, { color: tokens.textMuted }]}>{isKh ? 'មិនទាន់មាន Task នៅឡើយ' : 'No subtasks attached'}</Text>
                    )}
                  </View>

                  {/* Card Footer Actions */}
                  <View style={[styles.cardFooter, { borderTopColor: tokens.borderSubtle }]}>
                    <TouchableOpacity
                      style={[styles.drillDownBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                      onPress={() => setDrillDownProject(proj)}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="task-line" size={12} color={tokens.textPrimary} />
                      <Text style={[styles.drillDownBtnText, { color: tokens.textPrimary }]}>
                        {totalTasks > 0 ? `${totalTasks} Tasks` : 'View Details'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.actionBtnsRow}>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                        onPress={() => openEditModal(proj)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon name="pencil-line" size={13} color={tokens.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.borderSubtle }]}
                        onPress={() => handleDeleteProject(proj)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon name="delete-bin-line" size={13} color={tokens.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          // Dense Table View
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 2.5 }]}>GOAL / INITIATIVE</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>DEPARTMENT</Text>
              <Text style={[styles.th, { flex: 1 }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>PROGRESS</Text>
              <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>ACTION</Text>
            </View>

            {paginatedProjects.map((proj) => {
              const badge = getHealthBadge(proj.health);
              const { taskProgress } = getProjectStats(proj);

              return (
                <View key={proj.id} style={styles.tableRow}>
                  <Pressable
                    style={{ flex: 2.5 }}
                    onPress={() => setDrillDownProject(proj)}
                  >
                    <Text style={styles.tdProjName} numberOfLines={1}>{proj.name}</Text>
                    <Text style={styles.tdProjDesc} numberOfLines={1}>{proj.description}</Text>
                  </Pressable>

                  <View style={{ flex: 1.2 }}>
                    <Text style={styles.tdDeptText}>{proj.department || 'General'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, alignSelf: 'flex-start' }]}>
                      <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
                      <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                    <Text style={styles.tdProgressVal}>{taskProgress}%</Text>
                    <View style={styles.tableProgressBg}>
                      <View style={[styles.tableProgressFill, { width: `${taskProgress}%` }]} />
                    </View>
                  </View>

                  <View style={{ width: 70, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    <TouchableOpacity onPress={() => openEditModal(proj)} activeOpacity={0.7}>
                      <RemixIcon name="pencil-line" size={13} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteProject(proj)} activeOpacity={0.7}>
                      <RemixIcon name="delete-bin-line" size={13} color="#94A3B8" />
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
        totalItems={filteredProjects.length}
        itemsPerPage={pageSize}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* Create / Edit Project Modal */}
      <CustomModal
        visible={showCreateModal || Boolean(editingProject)}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'កែសម្រួលគម្រោង / គោលដៅ' : 'បង្កើតគម្រោង / គោលដៅថ្មី'}
        icon={editingProject ? 'pencil-line' : 'folder-add-line'}
        maxWidth={500}
      >
        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>Project / Goal Title</Text>
          <CustomTextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. Enterprise Offline Sync System"
            size="md"
            containerStyle={styles.modalInputSpacing}
          />

          <View style={styles.modalTwoCol}>
            <View style={styles.modalCol}>
              <Text style={styles.inputLabel}>Department / Category</Text>
              <CustomSelect
                options={DEPARTMENT_OPTIONS}
                value={formDepartment}
                onChange={setFormDepartment}
                size="md"
                variant="outline"
              />
            </View>

            <View style={styles.modalCol}>
              <Text style={styles.inputLabel}>Health Status</Text>
              <CustomSelect
                options={HEALTH_OPTIONS}
                value={formHealth}
                onChange={(val) => setFormHealth(val as any)}
                size="md"
                variant="outline"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Description & Objectives</Text>
          <CustomTextInput
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Summary of goals, scope, and target outcomes..."
            multiline
            numberOfLines={3}
            size="md"
            containerStyle={styles.modalInputSpacing}
          />
        </View>

        <View style={styles.modalActions}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => {
              setShowCreateModal(false);
              setEditingProject(null);
            }}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.saveBtn, (!formName.trim() || isSubmitting) && styles.saveBtnDisabled]}
            onPress={handleSaveProject}
            disabled={!formName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>{editingProject ? 'Save Changes' : 'Create Project'}</Text>
            )}
          </Pressable>
        </View>
      </CustomModal>

      {/* AI Smart Goal Planning Modal */}
      <CustomModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        title={isKh ? '✨ រៀបចំផែនការគោលដៅដោយ AI' : '✨ AI Strategic Goal Planner'}
        icon="sparkles-fill"
        maxWidth={480}
      >
        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>What is your strategic goal or project objective?</Text>
          <CustomTextInput
            value={aiGoalInput}
            onChangeText={setAiGoalInput}
            placeholder="e.g. Implement background synchronization with retry queues"
            size="md"
            containerStyle={styles.modalInputSpacing}
          />
          <Text style={styles.aiHintText}>
            Gemini AI will automatically generate this initiative, establish milestones, and schedule actionable subtasks directly into your workflow.
          </Text>
        </View>

        <View style={styles.modalActions}>
          <Pressable style={styles.cancelBtn} onPress={() => setShowAiModal(false)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.aiSubmitBtn, (!aiGoalInput.trim() || isAiPlanning) && styles.saveBtnDisabled]}
            onPress={handleAiBreakdown}
            disabled={!aiGoalInput.trim() || isAiPlanning}
          >
            {isAiPlanning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RemixIcon name="sparkles-fill" size={13} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Breakdown Goal</Text>
              </>
            )}
          </Pressable>
        </View>
      </CustomModal>

      {/* Project Details & Tasks Drill-Down Modal */}
      {drillDownProject && (
        <CustomModal
          visible={Boolean(drillDownProject)}
          onClose={() => setDrillDownProject(null)}
          title={drillDownProject.name}
          icon="folder-open-line"
          maxWidth={580}
        >
          <View style={styles.drillDownContainer}>
            {/* Overview Header */}
            <View style={styles.drillDownHeader}>
              <View style={styles.deptBadge}>
                <Text style={styles.deptText}>{drillDownProject.department || 'General'}</Text>
              </View>
              <Text style={styles.drillDownDesc}>{drillDownProject.description}</Text>
            </View>

            {/* Subtasks Section */}
            <Text style={styles.drillDownSectionTitle}>Project Subtasks & Action Items</Text>

            {/* Inline Add Task */}
            <View style={styles.inlineAddTaskRow}>
              <CustomTextInput
                value={newProjectTaskTitle}
                onChangeText={setNewProjectTaskTitle}
                placeholder="Add subtask to this project..."
                size="sm"
                containerStyle={{ flex: 1 }}
              />
              <View style={{ width: 100 }}>
                <CustomSelect
                  options={PRIORITY_OPTIONS}
                  value={newProjectTaskPriority}
                  onChange={(val) => setNewProjectTaskPriority(val as TaskPriority)}
                  size="sm"
                  variant="outline"
                />
              </View>
              <TouchableOpacity
                style={[styles.inlineAddBtn, (!newProjectTaskTitle.trim() || isAddingTask) && styles.saveBtnDisabled]}
                onPress={handleAddInlineTask}
                disabled={!newProjectTaskTitle.trim() || isAddingTask}
              >
                {isAddingTask ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <RemixIcon name="add-line" size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Task List */}
            <ScrollView style={styles.drillDownTasksScroll} showsVerticalScrollIndicator={false}>
              {tasks.filter(
                (t) => t.projectId === drillDownProject.id || t.projectName?.toLowerCase() === drillDownProject.name?.toLowerCase()
              ).length === 0 ? (
                <View style={styles.noTasksBox}>
                  <Text style={styles.noTasksText}>No tasks linked to this project yet. Add one above!</Text>
                </View>
              ) : (
                tasks
                  .filter(
                    (t) => t.projectId === drillDownProject.id || t.projectName?.toLowerCase() === drillDownProject.name?.toLowerCase()
                  )
                  .map((task) => {
                    const isDone = task.status === 'done';
                    return (
                      <View key={task.id} style={styles.drillDownTaskItem}>
                        <TouchableOpacity
                          style={[styles.taskCheckbox, isDone && styles.taskCheckboxDone]}
                          onPress={() => updateTaskStatus(task.id, isDone ? 'todo' : 'done')}
                          activeOpacity={0.7}
                        >
                          {isDone && <RemixIcon name="check-line" size={10} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <Text style={[styles.drillDownTaskText, isDone && styles.milestoneTextDone]} numberOfLines={1}>
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
                                  : '#EFF6FF',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityPillText,
                              {
                                color:
                                  task.priority === 'urgent'
                                    ? '#EF4444'
                                    : task.priority === 'high'
                                    ? '#D97706'
                                    : '#3B82F6',
                              },
                            ]}
                          >
                            {(task.priority || 'medium').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    );
                  })
              )}
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setDrillDownProject(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </Pressable>
          </View>
        </CustomModal>
      )}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 170,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  aiBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#4F46E5',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  createBtnText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
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
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  emptyActionBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: '49%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
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
    marginRight: 8,
  },
  projTitle: {
    fontSize: 13,
    fontFamily: 'KantumruyPro-Bold',
    color: '#0F172A',
  },
  deptBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  deptText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
    marginBottom: 10,
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
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  milestonesList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
    marginBottom: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    flex: 1,
  },
  milestoneTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  noTaskSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  drillDownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  drillDownBtnText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  actionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
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
  tdDeptText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
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
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  modalForm: {
    gap: 10,
    paddingVertical: 4,
  },
  modalInputSpacing: {
    marginBottom: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  modalTwoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCol: {
    flex: 1,
  },
  aiHintText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  drillDownContainer: {
    gap: 10,
  },
  drillDownHeader: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  drillDownDesc: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    lineHeight: 16,
  },
  drillDownSectionTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  inlineAddTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillDownTasksScroll: {
    maxHeight: 200,
  },
  noTasksBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noTasksText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  drillDownTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  taskCheckbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  taskCheckboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  drillDownTaskText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
  },
  priorityPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  priorityPillText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
});
