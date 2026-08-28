import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useDesktopStore } from '../../../store/useDesktopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { RemixIcon } from '../../ui/RemixIcon';
import { CustomTextInput } from '../../ui/CustomTextInput';
import { CustomSelect } from '../../ui/CustomSelect';
import { CustomModal } from '../../ui/CustomModal';
import { DesktopPagination } from '../../ui/DesktopPagination';
import { CalendarEvent, TaskPriority } from '../../../../shared';

const DAYS_OF_WEEK_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_OF_WEEK_KH = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_NAMES_KH = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const KHMER_MONTH_MAP: Record<string, string> = {
  'មករា': '01',
  'កុម្ភៈ': '02',
  'មីនា': '03',
  'មេសា': '04',
  'ឧសភា': '05',
  'មិថុនា': '06',
  'កក្កដា': '07',
  'សីហា': '08',
  'កញ្ញា': '09',
  'តុលា': '10',
  'វិច្ឆិកា': '11',
  'ធ្នូ': '12',
};

const normalizeFinanceDateToISO = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr.split('T')[0];
  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = KHMER_MONTH_MAP[parts[1]] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// 18 Hour slots for Daily Timeline Breakdown (06:00 AM - 11:00 PM)
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6; // 6 to 23
  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = isPM ? 'PM' : 'AM';
  const label = `${String(displayHour).padStart(2, '0')}:00 ${period}`;
  const hour24 = String(hour).padStart(2, '0');
  return { hour, hour24, label, displayHour, period };
});

export const CalendarModule: React.FC = () => {
  const t = useLanguageStore((state) => state.t);
  const language = useLanguageStore((state) => state.language);
  const calendarEvents = useDesktopStore((state) => state.calendarEvents);
  const tasks = useDesktopStore((state) => state.tasks);
  const finances = useDesktopStore((state) => state.finances);
  const addCalendarEvent = useDesktopStore((state) => state.addCalendarEvent);
  const updateCalendarEvent = useDesktopStore((state) => state.updateCalendarEvent);
  const toggleCalendarEvent = useDesktopStore((state) => state.toggleCalendarEvent);
  const deleteCalendarEvent = useDesktopStore((state) => state.deleteCalendarEvent);
  const isRightPanelVisible = useDesktopStore((state) => state.isRightPanelVisible);
  const toggleRightPanel = useDesktopStore((state) => state.toggleRightPanel);
  const githubConfig = useDesktopStore((state) => state.githubConfig);
  const syncGithubEvents = useDesktopStore((state) => state.syncGithubEvents);

  const monthNames = language === 'kh' ? MONTH_NAMES_KH : MONTH_NAMES_EN;
  const daysOfWeek = language === 'kh' ? DAYS_OF_WEEK_KH : DAYS_OF_WEEK_EN;
  const isKh = language === 'kh';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'day' | 'agenda'>('month');
  const [agendaSearch, setAgendaSearch] = useState('');
  const [agendaViewType, setAgendaViewType] = useState<'card' | 'list'>('card');
  const [agendaScope, setAgendaScope] = useState<'selected' | 'github'>('selected');
  const [isSyncingGh, setIsSyncingGh] = useState(false);

  const handleManualSync = async () => {
    setIsSyncingGh(true);
    const count = await syncGithubEvents(false);
    setIsSyncingGh(false);
    // If events exist, jump to the most recent event's date if current month is empty
    const allEvents = useDesktopStore.getState().calendarEvents;
    const ghEvents = allEvents.filter((e) => e.id.startsWith('gh-'));
    if (ghEvents.length > 0) {
      const sorted = [...ghEvents].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      if (latest && latest.date) {
        const parts = latest.date.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          setCurrentDate(d);
          setSelectedDateStr(latest.date);
        }
      }
    }
  };

  // Auto sync on mount and jump to latest activity if current month has no events
  React.useEffect(() => {
    const doAutoSync = async () => {
      if (githubConfig.username) {
        await syncGithubEvents(true);
        const allEvents = useDesktopStore.getState().calendarEvents;
        const ghEvents = allEvents.filter((e) => e.id.startsWith('gh-'));
        if (ghEvents.length > 0) {
          const sorted = [...ghEvents].sort((a, b) => b.date.localeCompare(a.date));
          const latest = sorted[0];
          if (latest && latest.date) {
            const parts = latest.date.split('-');
            if (parts.length === 3) {
              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              setCurrentDate(d);
              setSelectedDateStr(latest.date);
            }
          }
        }
      }
    };
    doAutoSync();
  }, [githubConfig.username, githubConfig.repo]);

  // Aggregate financial transactions by ISO date for calendar badges
  const financesByDate = React.useMemo(() => {
    const map = new Map<string, { income: number; expense: number; count: number }>();
    finances.forEach((f) => {
      const iso = normalizeFinanceDateToISO(f.date);
      if (!iso) return;
      if (!map.has(iso)) {
        map.set(iso, { income: 0, expense: 0, count: 0 });
      }
      const cur = map.get(iso)!;
      cur.count += 1;
      if (f.type === 'income') cur.income += f.amount;
      else cur.expense += f.amount;
    });
    return map;
  }, [finances]);

  // Double click detection ref
  const lastClickRef = useRef<{ dateStr: string; time: number }>({ dateStr: '', time: 0 });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [eventTime, setEventTime] = useState('09:00 AM');
  const [eventType, setEventType] = useState<'task' | 'meeting' | 'milestone' | 'reminder'>('meeting');
  const [eventPriority, setEventPriority] = useState<TaskPriority>('medium');
  const [eventNotes, setEventNotes] = useState('');

  // Edit Modal State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState<any>('task');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditEventModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEditTitle(ev.title);
    setEditDate(ev.date);
    setEditTime(ev.time || '');
    setEditType(ev.type || 'task');
    setEditPriority((ev.priority as TaskPriority) || 'medium');
    setEditNotes(ev.description || '');
  };

  const handleSaveEditEvent = async () => {
    if (!editingEvent || !editTitle.trim() || isSavingEdit) return;
    try {
      setIsSavingEdit(true);
      await updateCalendarEvent(editingEvent.id, {
        title: editTitle.trim(),
        date: editDate || editingEvent.date,
        time: editTime,
        type: editType,
        priority: editPriority,
        description: editNotes.trim(),
      });
      setEditingEvent(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'year') {
      setCurrentDate(new Date(year - 1, month, 1));
    } else if (viewMode === 'day') {
      const parts = selectedDateStr.split('-');
      const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      cur.setDate(cur.getDate() - 1);
      const dStr = cur.toISOString().split('T')[0];
      setSelectedDateStr(dStr);
      setCurrentDate(cur);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'year') {
      setCurrentDate(new Date(year + 1, month, 1));
    } else if (viewMode === 'day') {
      const parts = selectedDateStr.split('-');
      const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      cur.setDate(cur.getDate() + 1);
      const dStr = cur.toISOString().split('T')[0];
      setSelectedDateStr(dStr);
      setCurrentDate(cur);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const handlePrevDay = () => {
    const parts = selectedDateStr.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() - 1);
    const dStr = cur.toISOString().split('T')[0];
    setSelectedDateStr(dStr);
    setCurrentDate(cur);
  };

  const handleNextDay = () => {
    const parts = selectedDateStr.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() + 1);
    const dStr = cur.toISOString().split('T')[0];
    setSelectedDateStr(dStr);
    setCurrentDate(cur);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Double click handler for day cell
  const handleDayCellClick = (dateStr: string) => {
    const now = Date.now();
    if (lastClickRef.current.dateStr === dateStr && now - lastClickRef.current.time < 350) {
      // Double click detected -> Switch to Day timeline view
      setSelectedDateStr(dateStr);
      setViewMode('day');
      lastClickRef.current = { dateStr: '', time: 0 };
    } else {
      // Single click -> Select date
      setSelectedDateStr(dateStr);
      lastClickRef.current = { dateStr, time: now };
    }
  };

  // Calendar Grid Calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // 0 is Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Prev month padding days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr: dStr, isCurrentMonth: false, isToday: false });
  }

  // Current month days
  const todayStr = new Date().toISOString().split('T')[0];
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr: dStr,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
    });
  }

  // Next month padding days to complete 42 grid
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr: dStr, isCurrentMonth: false, isToday: false });
  }

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) return;
    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate || selectedDateStr,
      time: eventTime,
      type: eventType,
      priority: eventPriority,
      description: eventNotes,
      isCompleted: false,
    });
    setEventTitle('');
    setEventNotes('');
    setShowAddModal(false);
  };

  const handleQuickAddSlot = (slotLabel: string) => {
    setEventDate(selectedDateStr);
    setEventTime(slotLabel);
    setShowAddModal(true);
  };

  const selectedDateEvents = calendarEvents.filter((e) => e.date === selectedDateStr);
  const selectedDateTasks = tasks.filter((t) => t.dueDate?.startsWith(selectedDateStr));

  const totalGhEvents = calendarEvents.filter(
    (e) => e.id.startsWith('gh-') || e.title.includes('[Git') || e.title.includes('[Milestone') || e.title.includes('[Release') || e.title.includes('[PR') || e.title.includes('[Issue')
  );

  const baseAgendaEvents = agendaScope === 'github' ? totalGhEvents : selectedDateEvents;

  const filteredAgendaEvents = baseAgendaEvents.filter((e) =>
    e.title.toLowerCase().includes(agendaSearch.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(agendaSearch.toLowerCase()))
  );
  
  // Month-level Executive Metrics for Insight Cockpit Strip
  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthFinances = useMemo(() => {
    return finances.filter((f) => {
      const iso = normalizeFinanceDateToISO(f.date);
      return iso ? iso.startsWith(currentMonthStr) : false;
    });
  }, [finances, currentMonthStr]);

  const monthExpenses = useMemo(() => {
    return monthFinances
      .filter((f: any) => f.type === 'expense')
      .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
  }, [monthFinances]);

  const monthIncomes = useMemo(() => {
    return monthFinances
      .filter((f: any) => f.type === 'income')
      .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
  }, [monthFinances]);

  const monthGitCommitsCount = useMemo(() => {
    return calendarEvents.filter(
      (e) =>
        e.date?.startsWith(currentMonthStr) &&
        (e.id.startsWith('gh-') || e.title.startsWith('[Git'))
    ).length;
  }, [calendarEvents, currentMonthStr]);

  const monthScheduledEventsCount = useMemo(() => {
    return calendarEvents.filter(
      (e) =>
        e.date?.startsWith(currentMonthStr) &&
        !e.id.startsWith('gh-') &&
        !e.title.startsWith('[Git')
    ).length;
  }, [calendarEvents, currentMonthStr]);

  const monthPendingTasksCount = useMemo(() => {
    return tasks.filter((t) => t.dueDate?.startsWith(currentMonthStr) && t.status !== 'done').length;
  }, [tasks, currentMonthStr]);

  const monthCompletedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.dueDate?.startsWith(currentMonthStr) && t.status === 'done').length;
  }, [tasks, currentMonthStr]);

  const [sideAgendaPage, setSideAgendaPage] = useState(1);
  const [fullAgendaPage, setFullAgendaPage] = useState(1);
  const [fullAgendaSearch, setFullAgendaSearch] = useState('');

  const SIDE_PAGE_SIZE = 10;
  const FULL_PAGE_SIZE = 15;

  const filteredAgendaTasks = agendaScope === 'selected'
    ? selectedDateTasks.filter((t) => t.title.toLowerCase().includes(agendaSearch.toLowerCase()))
    : [];

  const totalSidePages = Math.max(1, Math.ceil(filteredAgendaEvents.length / SIDE_PAGE_SIZE));
  const paginatedSideEvents = filteredAgendaEvents.slice(
    (sideAgendaPage - 1) * SIDE_PAGE_SIZE,
    sideAgendaPage * SIDE_PAGE_SIZE
  );

  const filteredFullEvents = calendarEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(fullAgendaSearch.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(fullAgendaSearch.toLowerCase()))
  );
  const totalFullPages = Math.max(1, Math.ceil(filteredFullEvents.length / FULL_PAGE_SIZE));
  const paginatedFullEvents = filteredFullEvents.slice(
    (fullAgendaPage - 1) * FULL_PAGE_SIZE,
    fullAgendaPage * FULL_PAGE_SIZE
  );

  useEffect(() => {
    setSideAgendaPage(1);
  }, [agendaSearch, agendaScope, selectedDateStr]);

  useEffect(() => {
    setFullAgendaPage(1);
  }, [fullAgendaSearch]);

  const EVENT_TYPE_OPTIONS = [
    { label: 'Meeting', value: 'meeting', icon: 'time-line' as any },
    { label: 'Task', value: 'task', icon: 'task-line' as any },
    { label: 'Milestone', value: 'milestone', icon: 'folder-line' as any },
    { label: 'Reminder', value: 'reminder', icon: 'bell-line' as any },
  ];

  const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'low', badgeColor: '#94A3B8' },
    { label: 'Medium', value: 'medium', badgeColor: '#3B82F6' },
    { label: 'High', value: 'high', badgeColor: '#F59E0B' },
    { label: 'Urgent', value: 'urgent', badgeColor: '#EF4444' },
  ];

  const formatSelectedDateHeading = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString(isKh ? 'km-KH' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return dateStr;
  };

  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  return (
    <View style={styles.container}>
      {/* Top Header Rail */}
      <View style={styles.topRail}>
        <View style={styles.headerLeft}>
          <Text style={styles.moduleTitle}>{t.calTitle}</Text>

          {/* Month / Year / Day Navigator */}
          <View style={styles.navControls}>
            <View style={styles.monthNavPill}>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={handlePrev}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <RemixIcon name="chevron-left-line" size={13} color="#64748B" />
              </TouchableOpacity>

              <Text style={styles.monthTitle}>
                {viewMode === 'year'
                  ? `${year}`
                  : viewMode === 'day'
                  ? formatSelectedDateHeading(selectedDateStr)
                  : `${monthNames[month]} ${year}`}
              </Text>

              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={handleNext}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <RemixIcon name="chevron-right-line" size={13} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.todayBtn} onPress={handleToday} activeOpacity={0.7}>
              <Text style={styles.todayBtnText}>{t.calToday}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.viewModeGroup}>
            {(['year', 'month', 'day', 'agenda'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.viewModeBtn, viewMode === mode && styles.viewModeBtnActive]}
                onPress={() => setViewMode(mode)}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                  {mode === 'year' ? t.calYear : mode === 'month' ? t.calMonth : mode === 'day' ? t.calDay : t.calAgenda}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GitHub Auto-Sync Status Pill if enabled */}
          {githubConfig.username ? (
            <TouchableOpacity
              style={[styles.githubStatusPill, isSyncingGh && styles.githubStatusPillSyncing]}
              onPress={handleManualSync}
              activeOpacity={0.75}
              disabled={isSyncingGh}
            >
              <View style={[styles.githubLiveDot, isSyncingGh && styles.githubLiveDotSyncing]} />
              <RemixIcon name="github-fill" size={12} color="#0F172A" />
              <Text style={styles.githubStatusText}>
                {isSyncingGh ? 'Syncing...' : (githubConfig.repo ? `${githubConfig.username}/${githubConfig.repo}` : githubConfig.username)}
              </Text>
              <RemixIcon name="refresh-line" size={10} color="#64748B" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.addEventBtn}
            onPress={() => {
              setEventDate(selectedDateStr);
              setShowAddModal(true);
            }}
            activeOpacity={0.75}
          >
            <RemixIcon name="add-line" size={13} color="#FFFFFF" />
            <Text style={styles.addEventBtnText}>{t.calNewEvent}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VIEW MODE 1: MONTH GRID (Double-click day cell to enter Day timeline) */}
      {viewMode === 'month' && (
        <View style={styles.bodyLayout}>
          {/* Monthly Calendar Grid */}
          <View style={[styles.gridContainer, !isRightPanelVisible && styles.gridContainerFull]}>
            {/* Monthly Executive Insight Strip */}
            <View style={styles.monthInsightStrip}>
              <View style={styles.insightStripItem}>
                <View style={[styles.insightStripIconWrap, { backgroundColor: '#FEF2F2' }]}>
                  <RemixIcon name="bank-card-line" size={11} color="#DC2626" />
                </View>
                <Text style={styles.insightStripLabel}>{isKh ? 'លំហូរសាច់ប្រាក់:' : 'Cashflow:'}</Text>
                <Text style={[styles.insightStripVal, { color: '#DC2626' }]}>-${monthExpenses.toLocaleString()}</Text>
                <Text style={styles.insightStripDivider}>/</Text>
                <Text style={[styles.insightStripVal, { color: '#16A34A' }]}>+${monthIncomes.toLocaleString()}</Text>
              </View>

              <View style={styles.insightStripItem}>
                <View style={[styles.insightStripIconWrap, { backgroundColor: '#F1F5F9' }]}>
                  <RemixIcon name="github-fill" size={11} color="#0F172A" />
                </View>
                <Text style={styles.insightStripLabel}>{isKh ? 'សកម្មភាព Git:' : 'Git Activity:'}</Text>
                <Text style={styles.insightStripValDark}>{monthGitCommitsCount} {isKh ? 'commits' : 'commits'}</Text>
              </View>

              <View style={styles.insightStripItem}>
                <View style={[styles.insightStripIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <RemixIcon name="checkbox-circle-fill" size={11} color="#6366F1" />
                </View>
                <Text style={styles.insightStripLabel}>{isKh ? 'កិច្ចការ Sprint:' : 'Sprint Tasks:'}</Text>
                <Text style={styles.insightStripValDark}>{monthCompletedTasksCount} {isKh ? 'រួចរាល់' : 'done'} / {monthPendingTasksCount} {isKh ? 'រង់ចាំ' : 'pending'}</Text>
              </View>

              <View style={[styles.insightStripItem, { borderRightWidth: 0 }]}>
                <View style={[styles.insightStripIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <RemixIcon name="calendar-line" size={11} color="#2563EB" />
                </View>
                <Text style={styles.insightStripLabel}>{isKh ? 'កាលវិភាគ:' : 'Schedule:'}</Text>
                <Text style={styles.insightStripValDark}>{monthScheduledEventsCount} {isKh ? 'ព្រឹត្តិការណ៍' : 'events'}</Text>
              </View>
            </View>

            {/* Days of Week Header (Seamlessly attached below insight strip) */}
            <View style={styles.weekHeader}>
              {daysOfWeek.map((d) => (
                <View key={d} style={styles.weekHeaderCol}>
                  <Text style={styles.weekHeaderText}>{d.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* Grid Cells */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, idx) => {
                const isSelected = item.dateStr === selectedDateStr;
                const dayEvents = calendarEvents.filter((e) => e.date === item.dateStr);
                const dayTasks = tasks.filter((t) => t.dueDate?.startsWith(item.dateStr));

                const gitEvents = dayEvents.filter((e) => e.id.startsWith('gh-') || e.title.startsWith('[Git'));
                const realEvents = dayEvents.filter((e) => !e.id.startsWith('gh-') && !e.title.startsWith('[Git'));
                const totalItems = dayEvents.length + dayTasks.length;
                const isHeavyBusy = totalItems >= 10;
                const isMediumBusy = totalItems >= 4 && totalItems < 10;
                const isLightBusy = totalItems >= 1 && totalItems < 4;

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      !item.isCurrentMonth && styles.dayCellDimmed,
                      item.isCurrentMonth && !isSelected && !item.isToday && isHeavyBusy && styles.dayCellHeavyBg,
                      item.isCurrentMonth && !isSelected && !item.isToday && isMediumBusy && styles.dayCellMediumBg,
                      item.isCurrentMonth && !isSelected && !item.isToday && isLightBusy && styles.dayCellLightBg,
                      isSelected && styles.dayCellSelected,
                      item.isToday && styles.dayCellToday,
                    ]}
                    onPress={() => handleDayCellClick(item.dateStr)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dayCellTop}>
                      <View
                        style={[
                          styles.dayNumberCircle,
                          item.isToday && styles.dayNumberCircleToday,
                          isSelected && !item.isToday && styles.dayNumberCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            !item.isCurrentMonth && styles.dayNumberDimmed,
                            item.isToday && styles.dayNumberTextToday,
                            isSelected && !item.isToday && styles.dayNumberTextSelected,
                            !item.isToday && !isSelected && isHeavyBusy && styles.dayNumberTextHeavy,
                            !item.isToday && !isSelected && isMediumBusy && styles.dayNumberTextMedium,
                            !item.isToday && !isSelected && isLightBusy && styles.dayNumberTextLight,
                          ]}
                        >
                          {item.dayNumber}
                        </Text>
                      </View>

                      {financesByDate.get(item.dateStr) ? (
                        <View
                          style={[
                            styles.finDayBadge,
                            financesByDate.get(item.dateStr)!.income > financesByDate.get(item.dateStr)!.expense
                              ? styles.finDayBadgeIncome
                              : styles.finDayBadgeExpense,
                          ]}
                        >
                          <Text
                            style={[
                              styles.finDayBadgeText,
                              financesByDate.get(item.dateStr)!.income > financesByDate.get(item.dateStr)!.expense
                                ? styles.finDayTextIncome
                                : styles.finDayTextExpense,
                            ]}
                            numberOfLines={1}
                          >
                            {financesByDate.get(item.dateStr)!.income > financesByDate.get(item.dateStr)!.expense
                              ? `+$${financesByDate.get(item.dateStr)!.income >= 1000 ? (financesByDate.get(item.dateStr)!.income / 1000).toFixed(1) + 'k' : financesByDate.get(item.dateStr)!.income.toFixed(0)}`
                              : `-$${financesByDate.get(item.dateStr)!.expense >= 1000 ? (financesByDate.get(item.dateStr)!.expense / 1000).toFixed(1) + 'k' : financesByDate.get(item.dateStr)!.expense.toFixed(0)}`}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Clean Mini Event Badges */}
                    <View style={styles.eventChipsContainer}>
                      {/* 1. Real Meetings / Events First */}
                      {realEvents.slice(0, 2).map((ev) => {
                        const isUrgent = ev.priority === 'urgent';
                        const isHigh = ev.priority === 'high';
                        return (
                          <View
                            key={ev.id}
                            style={[
                              styles.eventPill,
                              isUrgent ? styles.pillUrgent : isHigh ? styles.pillHigh : styles.pillMeeting,
                            ]}
                          >
                            <View
                              style={[
                                styles.pillDot,
                                { backgroundColor: isUrgent ? '#EF4444' : isHigh ? '#F59E0B' : '#2563EB' },
                              ]}
                            />
                            <Text
                              style={[
                                styles.eventPillText,
                                isUrgent ? styles.pillTextUrgent : isHigh ? styles.pillTextHigh : styles.pillTextMeeting,
                              ]}
                              numberOfLines={1}
                            >
                              {ev.title}
                            </Text>
                          </View>
                        );
                      })}

                      {/* 2. Top Task (If any) */}
                      {dayTasks.slice(0, realEvents.length >= 2 ? 0 : 1).map((t) => (
                        <View key={t.id} style={[styles.eventPill, styles.pillTask]}>
                          <View
                            style={[
                              styles.pillDot,
                              {
                                backgroundColor:
                                  t.priority === 'urgent' ? '#EF4444' : t.priority === 'high' ? '#F59E0B' : '#6366F1',
                              },
                            ]}
                          />
                          <Text style={[styles.eventPillText, styles.pillTextTask]} numberOfLines={1}>
                            {t.title}
                          </Text>
                        </View>
                      ))}

                      {/* 3. Consolidated GitHub Activity Pulse Pill */}
                      {gitEvents.length > 0 && (
                        <View style={[styles.eventPill, styles.pillGithub]}>
                          <RemixIcon name="github-fill" size={10} color="#0F172A" />
                          <Text style={[styles.eventPillText, styles.pillTextGithub]} numberOfLines={1}>
                            {gitEvents.length === 1
                              ? gitEvents[0].title.replace(/^\[Git (Commit|Push|Create|Event)\]\s*/i, '')
                              : `${gitEvents.length} Commits (${githubConfig.repo || 'ps'})`}
                          </Text>
                        </View>
                      )}

                      {/* 4. More counter if total items exceed visible space */}
                      {totalItems > (realEvents.length > 0 ? 2 : 1) + (gitEvents.length > 0 ? 1 : 0) && (
                        <View style={styles.moreEventsPill}>
                          <Text style={styles.moreEventsText}>
                            +{totalItems - (realEvents.length > 0 ? 2 : 1)} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Right: Selected Day Timeline & Details (Toggled via Top Nav Right Panel button) */}
          {isRightPanelVisible && (
            <View style={styles.sideAgenda}>
              {/* Clean Agenda Toolbar (Search + Card/List Switcher + Close) */}
              <View style={styles.agendaToolbar}>
                <View style={styles.agendaSearchCol}>
                  <CustomTextInput
                    value={agendaSearch}
                    onChangeText={setAgendaSearch}
                    placeholder={t.calSearchAgenda}
                    icon="search-line"
                    size="sm"
                  />
                </View>

                <View style={styles.agendaToolbarActions}>
                  {/* Card <-> List View Switcher */}
                  <View style={styles.viewToggleGroup}>
                    <TouchableOpacity
                      style={[styles.viewToggleBtn, agendaViewType === 'card' && styles.viewToggleBtnActive]}
                      onPress={() => setAgendaViewType('card')}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="grid-line" size={12} color={agendaViewType === 'card' ? '#0F172A' : '#94A3B8'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.viewToggleBtn, agendaViewType === 'list' && styles.viewToggleBtnActive]}
                      onPress={() => setAgendaViewType('list')}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="list-check-line" size={12} color={agendaViewType === 'list' ? '#0F172A' : '#94A3B8'} />
                    </TouchableOpacity>
                  </View>

                  {/* Collapse Button */}
                  <TouchableOpacity
                    style={styles.closeAgendaBtn}
                    onPress={toggleRightPanel}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <RemixIcon name="close-line" size={13} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scope Switcher: Selected Day vs GitHub Feed */}
              <View style={styles.scopeTabBar}>
                <TouchableOpacity
                  style={[styles.scopeTabBtn, agendaScope === 'selected' && styles.scopeTabBtnActive]}
                  onPress={() => setAgendaScope('selected')}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.scopeTabText, agendaScope === 'selected' && styles.scopeTabTextActive]}>
                    {language === 'kh' ? 'ថ្ងៃបានជ្រើស' : 'Selected Day'} ({selectedDateEvents.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scopeTabBtn, agendaScope === 'github' && styles.scopeTabBtnActive]}
                  onPress={() => setAgendaScope('github')}
                  activeOpacity={0.75}
                >
                  <RemixIcon name="github-fill" size={11} color={agendaScope === 'github' ? '#0F172A' : '#64748B'} />
                  <Text style={[styles.scopeTabText, agendaScope === 'github' && styles.scopeTabTextActive]}>
                    {language === 'kh' ? 'GitHub Feed' : 'Git Feed'} ({totalGhEvents.length})
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.agendaScroll} showsVerticalScrollIndicator={false}>
                {filteredAgendaEvents.length === 0 && filteredAgendaTasks.length === 0 ? (
                  <View style={styles.agendaEmpty}>
                    <View style={styles.agendaEmptyIcon}>
                      <RemixIcon name="calendar-line" size={18} color="#94A3B8" />
                    </View>
                    <Text style={styles.agendaEmptyTitle}>{t.calNoItemsFound}</Text>
                    <Text style={styles.agendaEmptySub}>
                      {agendaSearch ? t.calNoMatches : t.calNothingScheduled}
                    </Text>
                  </View>
                ) : agendaViewType === 'card' ? (
                  // CARD VIEW
                  <View style={styles.agendaList}>
                    {paginatedSideEvents.map((ev) => (
                      <TouchableOpacity
                        key={ev.id}
                        style={[styles.agendaCard, ev.isCompleted && styles.agendaCardCompleted]}
                        onPress={() => {
                          if (ev.date) {
                            const parts = ev.date.split('-');
                            if (parts.length === 3) {
                              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                              setCurrentDate(d);
                              setSelectedDateStr(ev.date);
                            }
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.agendaCardTop}>
                          <View style={[styles.agendaTypeBadge, (ev.id.startsWith('gh-') || ev.title.startsWith('[Git')) && styles.agendaGithubBadge]}>
                            {ev.id.startsWith('gh-') || ev.title.startsWith('[Git') ? (
                              <View style={styles.githubRoundBadge}>
                                <RemixIcon name="github-fill" size={8} color="#FFFFFF" />
                              </View>
                            ) : (
                              <View
                                style={[
                                  styles.typeDot,
                                  {
                                    backgroundColor:
                                      ev.priority === 'urgent'
                                        ? '#EF4444'
                                        : ev.priority === 'high'
                                        ? '#F59E0B'
                                        : '#3B82F6',
                                  },
                                ]}
                              />
                            )}
                            <Text style={[styles.agendaTypeText, (ev.id.startsWith('gh-') || ev.title.startsWith('[Git')) && styles.agendaGithubText]}>
                              {ev.id.startsWith('gh-') || ev.title.startsWith('[Git') ? 'GITHUB' : ev.type.toUpperCase()} • {ev.time || t.calAllDay}
                            </Text>
                          </View>

                          <View style={styles.agendaActions}>
                            <TouchableOpacity
                              onPress={() => toggleCalendarEvent(ev.id)}
                              style={styles.iconAction}
                            >
                              <RemixIcon
                                name={ev.isCompleted ? 'check-line' : 'time-line'}
                                size={12}
                                color={ev.isCompleted ? '#10B981' : '#64748B'}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => openEditEventModal(ev)}
                              style={styles.iconAction}
                            >
                              <RemixIcon name="pencil-line" size={12} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => deleteCalendarEvent(ev.id)}
                              style={styles.iconAction}
                            >
                              <RemixIcon name="close-line" size={12} color="#94A3B8" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.agendaCardTitle,
                            ev.isCompleted && styles.agendaCardTitleCompleted,
                          ]}
                        >
                          {ev.title}
                        </Text>

                        {ev.description ? (
                          <Text style={styles.agendaCardDesc}>{ev.description}</Text>
                        ) : null}
                      </TouchableOpacity>
                    ))}

                    {filteredAgendaTasks.map((t) => (
                      <View key={t.id} style={[styles.agendaCard, styles.agendaTaskCard]}>
                        <View style={styles.agendaCardTop}>
                          <View style={styles.agendaTypeBadge}>
                            <View style={[styles.typeDot, { backgroundColor: '#6366F1' }]} />
                            <Text style={styles.agendaTypeText}>PLANNER TASK</Text>
                          </View>
                          <Text style={styles.taskStatusTag}>{t.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.agendaCardTitle}>{t.title}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  // COMPACT LIST VIEW
                  <View style={styles.agendaCompactList}>
                    {paginatedSideEvents.map((ev) => (
                      <TouchableOpacity
                        key={ev.id}
                        style={[styles.agendaListItem, ev.isCompleted && styles.agendaListItemCompleted]}
                        onPress={() => {
                          if (ev.date) {
                            const parts = ev.date.split('-');
                            if (parts.length === 3) {
                              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                              setCurrentDate(d);
                              setSelectedDateStr(ev.date);
                            }
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <TouchableOpacity
                          style={styles.listCheckBtn}
                          onPress={() => toggleCalendarEvent(ev.id)}
                        >
                          <RemixIcon
                            name={ev.isCompleted ? 'checkbox-circle-fill' : 'time-line'}
                            size={14}
                            color={ev.isCompleted ? '#10B981' : '#94A3B8'}
                          />
                        </TouchableOpacity>

                        <View
                          style={[
                            styles.typeDot,
                            {
                              backgroundColor:
                                ev.priority === 'urgent'
                                  ? '#EF4444'
                                  : ev.priority === 'high'
                                  ? '#F59E0B'
                                  : '#3B82F6',
                            },
                          ]}
                        />

                        <Text
                          style={[styles.listTitle, ev.isCompleted && styles.listTitleCompleted]}
                          numberOfLines={1}
                        >
                          {ev.title}
                        </Text>

                        {ev.time ? (
                          <View style={styles.listTimeBadge}>
                            <Text style={styles.listTimeText}>{ev.time}</Text>
                          </View>
                        ) : null}

                        <TouchableOpacity
                          style={styles.listDeleteBtn}
                          onPress={() => openEditEventModal(ev)}
                        >
                          <RemixIcon name="pencil-line" size={12} color="#64748B" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.listDeleteBtn}
                          onPress={() => deleteCalendarEvent(ev.id)}
                        >
                          <RemixIcon name="close-line" size={12} color="#94A3B8" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}

                    {filteredAgendaTasks.map((t) => (
                      <View key={t.id} style={styles.agendaListItem}>
                        <View style={styles.listCheckBtn}>
                          <RemixIcon name="task-line" size={14} color="#6366F1" />
                        </View>
                        <View style={[styles.typeDot, { backgroundColor: '#6366F1' }]} />
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <View style={styles.listTaskBadge}>
                          <Text style={styles.listTaskBadgeText}>{t.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Side Agenda Pagination Controls */}
              {totalSidePages > 1 && (
                <View style={styles.sidePaginationBar}>
                  <Text style={styles.sidePaginationText}>
                    Page {sideAgendaPage} of {totalSidePages} ({filteredAgendaEvents.length})
                  </Text>
                  <View style={styles.sidePaginationBtns}>
                    <TouchableOpacity
                      style={[styles.sidePageBtn, sideAgendaPage <= 1 && styles.sidePageBtnDisabled]}
                      onPress={() => setSideAgendaPage((p) => Math.max(1, p - 1))}
                      disabled={sideAgendaPage <= 1}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="chevron-left-line" size={12} color={sideAgendaPage <= 1 ? '#CBD5E1' : '#475569'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sidePageBtn, sideAgendaPage >= totalSidePages && styles.sidePageBtnDisabled]}
                      onPress={() => setSideAgendaPage((p) => Math.min(totalSidePages, p + 1))}
                      disabled={sideAgendaPage >= totalSidePages}
                      activeOpacity={0.7}
                    >
                      <RemixIcon name="chevron-right-line" size={12} color={sideAgendaPage >= totalSidePages ? '#CBD5E1' : '#475569'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* VIEW MODE 2: DAILY HOURLY TIMELINE ROW BREAKDOWN */}
      {viewMode === 'day' && (
        <View style={styles.dayTimelineContainer}>
          {/* Sub Header for Day View */}
          <View style={styles.daySubNav}>
            <TouchableOpacity
              style={styles.backToMonthBtn}
              onPress={() => setViewMode('month')}
              activeOpacity={0.7}
            >
              <RemixIcon name="arrow-left-line" size={13} color="#2563EB" />
              <Text style={styles.backToMonthText}>Month Grid</Text>
            </TouchableOpacity>

            <View style={styles.daySubCenter}>
              <Text style={styles.daySubTitle}>{formatSelectedDateHeading(selectedDateStr)}</Text>
              <View style={styles.dayCountBadge}>
                <Text style={styles.dayCountText}>
                  {selectedDateEvents.length} Events • {selectedDateTasks.length} Tasks
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.daySubAddBtn}
              onPress={() => {
                setEventDate(selectedDateStr);
                setShowAddModal(true);
              }}
              activeOpacity={0.75}
            >
              <RemixIcon name="add-line" size={13} color="#0F172A" />
              <Text style={styles.daySubAddText}>Add Event</Text>
            </TouchableOpacity>
          </View>

          {/* Top Pinned Tasks / All-day Section */}
          {(selectedDateTasks.length > 0 || selectedDateEvents.filter(e => !e.time || e.time === 'All Day').length > 0) && (
            <View style={styles.allDaySection}>
              <View style={styles.allDayLabelCol}>
                <Text style={styles.allDayLabel}>ALL-DAY & TASKS</Text>
              </View>
              <View style={styles.allDayContent}>
                {selectedDateTasks.map((t) => (
                  <View key={t.id} style={styles.allDayTaskPill}>
                    <View style={[styles.pillDot, { backgroundColor: '#6366F1' }]} />
                    <Text style={styles.allDayTaskTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.allDayTaskStatus}>{t.status}</Text>
                  </View>
                ))}
                {selectedDateEvents.filter(e => !e.time || e.time === 'All Day').map((ev) => (
                  <View key={ev.id} style={styles.allDayEventPill}>
                    <View style={[styles.pillDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.allDayEventTitle} numberOfLines={1}>{ev.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Hourly Timeline Row Scroll */}
          <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={true}>
            <View style={styles.timelineGrid}>
              {TIME_SLOTS.map((slot) => {
                // Find events matching this hour
                const slotEvents = selectedDateEvents.filter((e) => {
                  if (!e.time || e.time === 'All Day') return false;
                  const timeLower = e.time.toLowerCase();
                  const slotHourStr = `${slot.displayHour}:`;
                  const slotHourPad = `${String(slot.displayHour).padStart(2, '0')}:`;
                  const isHourMatch = (timeLower.startsWith(slotHourStr) || timeLower.startsWith(slotHourPad)) &&
                    (slot.period === 'AM' ? timeLower.includes('am') : timeLower.includes('pm'));
                  const is24Match = timeLower.startsWith(slot.hour24 + ':');
                  return isHourMatch || is24Match;
                });

                const isCurrentHourSlot =
                  selectedDateStr === todayStr &&
                  currentHour === slot.hour;

                return (
                  <View key={slot.hour} style={styles.timelineRow}>
                    {/* Left Hour Label */}
                    <View style={styles.timeCol}>
                      <Text style={[styles.timeColText, isCurrentHourSlot && styles.timeColTextActive]}>
                        {slot.label}
                      </Text>
                    </View>

                    {/* Right Timeline Lane */}
                    <TouchableOpacity
                      style={[styles.laneCol, isCurrentHourSlot && styles.laneColCurrent]}
                      onPress={() => handleQuickAddSlot(slot.label)}
                      activeOpacity={0.8}
                    >
                      {/* Live Red Indicator Line for Current Time */}
                      {isCurrentHourSlot && (
                        <View
                          style={[
                            styles.currentTimeLine,
                            { top: `${(currentMinutes / 60) * 100}%` },
                          ]}
                        >
                          <View style={styles.currentTimeDot} />
                          <View style={styles.currentTimeBar} />
                        </View>
                      )}

                      {/* Scheduled Events in this Slot */}
                      {slotEvents.length > 0 ? (
                        <View style={styles.slotEventsList}>
                          {slotEvents.map((ev) => {
                            const isUrgent = ev.priority === 'urgent';
                            const isHigh = ev.priority === 'high';
                            return (
                              <View
                                key={ev.id}
                                style={[
                                  styles.timelineEventCard,
                                  isUrgent
                                    ? styles.tlUrgent
                                    : isHigh
                                    ? styles.tlHigh
                                    : styles.tlNormal,
                                  ev.isCompleted && styles.tlCompleted,
                                ]}
                              >
                                <View style={styles.tlCardHeader}>
                                  <View style={styles.tlHeaderLeft}>
                                    <View
                                      style={[
                                        styles.pillDot,
                                        {
                                          backgroundColor: isUrgent
                                            ? '#EF4444'
                                            : isHigh
                                            ? '#F59E0B'
                                            : '#3B82F6',
                                        },
                                      ]}
                                    />
                                    <Text
                                      style={[
                                        styles.tlEventTitle,
                                        ev.isCompleted && styles.tlEventTitleCompleted,
                                      ]}
                                    >
                                      {ev.title}
                                    </Text>
                                    <View style={styles.tlTimePill}>
                                      <Text style={styles.tlTimePillText}>{ev.time}</Text>
                                    </View>
                                  </View>

                                  <View style={styles.tlActions}>
                                    <TouchableOpacity
                                      onPress={() => toggleCalendarEvent(ev.id)}
                                      style={styles.tlIconBtn}
                                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    >
                                      <RemixIcon
                                        name={ev.isCompleted ? 'check-line' : 'time-line'}
                                        size={13}
                                        color={ev.isCompleted ? '#10B981' : '#64748B'}
                                      />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => openEditEventModal(ev)}
                                      style={styles.tlIconBtn}
                                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    >
                                      <RemixIcon name="pencil-line" size={13} color="#64748B" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => deleteCalendarEvent(ev.id)}
                                      style={styles.tlIconBtn}
                                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    >
                                      <RemixIcon name="close-line" size={13} color="#94A3B8" />
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                {ev.description ? (
                                  <Text style={styles.tlEventDesc}>{ev.description}</Text>
                                ) : null}
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={styles.emptySlotIndicator}>
                          <Text style={styles.emptySlotText}>+ Add event at {slot.label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* VIEW MODE 3: AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.agendaViewContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.agendaViewContent}>
              {/* Full Agenda Search Toolbar */}
              <View style={styles.fullAgendaToolbar}>
                <View style={{ width: 280 }}>
                  <CustomTextInput
                    value={fullAgendaSearch}
                    onChangeText={setFullAgendaSearch}
                    placeholder="ស្វែងរកព្រឹត្តិការណ៍ & Git commits..."
                    icon="search-line"
                    size="sm"
                  />
                </View>
                <Text style={styles.fullAgendaCountText}>
                  {filteredFullEvents.length} ព្រឹត្តិការណ៍សរុប
                </Text>
              </View>

              {filteredFullEvents.length === 0 ? (
                <View style={styles.agendaEmptyFull}>
                  <RemixIcon name="calendar-line" size={28} color="#94A3B8" />
                  <Text style={styles.agendaEmptyTitle}>រកមិនឃើញព្រឹត្តិការណ៍ទេ</Text>
                  <Text style={styles.agendaEmptySub}>
                    {fullAgendaSearch ? 'មិនមានទិន្នន័យត្រូវនឹងពាក្យស្វែងរកឡើយ' : 'មិនទាន់មានព្រឹត្តិការណ៍ត្រូវបានកំណត់ពេលនៅឡើយ'}
                  </Text>
                </View>
              ) : (
                paginatedFullEvents.map((ev) => (
                  <View key={ev.id} style={styles.agendaFullCard}>
                    <View style={styles.agendaFullLeft}>
                      {ev.id.startsWith('gh-') || ev.title.includes('[Git') ? (
                        <View style={styles.githubRoundBadge}>
                          <RemixIcon name="github-fill" size={10} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.agendaFullDot,
                            {
                              backgroundColor:
                                ev.priority === 'urgent'
                                  ? '#EF4444'
                                  : ev.priority === 'high'
                                  ? '#F59E0B'
                                  : '#3B82F6',
                            },
                          ]}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.agendaFullTitle}>{ev.title}</Text>
                        <Text style={styles.agendaFullSub}>
                          {ev.date} • {ev.time || 'All Day'} • {ev.type.toUpperCase()}
                        </Text>
                        {ev.description ? (
                          <Text style={styles.agendaFullDesc}>{ev.description}</Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.tlActions}>
                      <TouchableOpacity
                        onPress={() => toggleCalendarEvent(ev.id)}
                        style={styles.tlIconBtn}
                      >
                        <RemixIcon
                          name={ev.isCompleted ? 'check-line' : 'time-line'}
                          size={14}
                          color={ev.isCompleted ? '#10B981' : '#64748B'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openEditEventModal(ev)}
                        style={styles.tlIconBtn}
                      >
                        <RemixIcon name="pencil-line" size={14} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteCalendarEvent(ev.id)}
                        style={styles.tlIconBtn}
                      >
                        <RemixIcon name="close-line" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Fixed Reusable DesktopPagination Bottom Bar */}
          <DesktopPagination
            currentPage={fullAgendaPage}
            totalItems={filteredFullEvents.length}
            itemsPerPage={FULL_PAGE_SIZE}
            onPageChange={setFullAgendaPage}
          />
        </View>
      )}

      {/* VIEW MODE 4: YEAR 12-MONTH OVERVIEW */}
      {viewMode === 'year' && (
        <ScrollView style={styles.yearViewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.yearGrid}>
            {Array.from({ length: 12 }, (_, mIdx) => {
              const monthName = monthNames[mIdx];
              const monthFirstDay = (new Date(year, mIdx, 1).getDay() + 6) % 7;
              const monthDaysCount = new Date(year, mIdx + 1, 0).getDate();
              const monthPrefix = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
              const monthEvents = calendarEvents.filter((e) => e.date.startsWith(monthPrefix));
              const isCurrentCalendarMonth = new Date().getFullYear() === year && new Date().getMonth() === mIdx;

              return (
                <View key={mIdx} style={[styles.yearMonthCard, isCurrentCalendarMonth && styles.yearMonthCardActive]}>
                  {/* Month Header */}
                  <TouchableOpacity
                    style={styles.yearMonthHeader}
                    onPress={() => {
                      setCurrentDate(new Date(year, mIdx, 1));
                      setViewMode('month');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yearMonthTitle, isCurrentCalendarMonth && styles.yearMonthTitleActive]}>
                      {monthName}
                    </Text>
                    {monthEvents.length > 0 && (
                      <View style={styles.yearEventBadge}>
                        <Text style={styles.yearEventBadgeText}>{monthEvents.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Day Names Row */}
                  <View style={styles.yearWeekRow}>
                    {(language === 'kh' ? ['ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស', 'អា'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => (
                      <Text key={i} style={styles.yearWeekDayText}>{d}</Text>
                    ))}
                  </View>

                  {/* Mini Month Grid */}
                  <View style={styles.yearDaysGrid}>
                    {/* Padding cells */}
                    {Array.from({ length: monthFirstDay }, (_, pIdx) => (
                      <View key={`pad-${pIdx}`} style={styles.yearDayCellEmpty} />
                    ))}

                    {/* Active day cells */}
                    {Array.from({ length: monthDaysCount }, (_, dIdx) => {
                      const dayNum = dIdx + 1;
                      const dateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
                      const dayEventsCount = monthEvents.filter((e) => e.date === dateStr).length;
                      const hasDayEvents = dayEventsCount > 0;
                      const isHeavyDay = dayEventsCount >= 8;
                      const isMediumDay = dayEventsCount >= 4 && dayEventsCount < 8;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;
                      const isSelected = selectedDateStr === dateStr;

                      return (
                        <TouchableOpacity
                          key={dayNum}
                          style={styles.yearDayCellWrapper}
                          onPress={() => {
                            setSelectedDateStr(dateStr);
                            setCurrentDate(new Date(year, mIdx, dayNum));
                            setViewMode('month');
                          }}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.yearDayBadge,
                              isToday && styles.yearDayBadgeToday,
                              isSelected && !isToday && styles.yearDayBadgeSelected,
                              hasDayEvents && !isToday && !isSelected && (
                                isHeavyDay
                                  ? styles.yearDayBadgeHeavy
                                  : isMediumDay
                                  ? styles.yearDayBadgeMedium
                                  : styles.yearDayBadgeEvent
                              ),
                            ]}
                          >
                            <Text
                              style={[
                                styles.yearDayText,
                                isToday && styles.yearDayTextToday,
                                isSelected && !isToday && styles.yearDayTextSelected,
                                hasDayEvents && !isToday && !isSelected && (
                                  isHeavyDay
                                    ? styles.yearDayTextHeavy
                                    : isMediumDay
                                    ? styles.yearDayTextMedium
                                    : styles.yearDayTextHasEvent
                                ),
                              ]}
                            >
                              {dayNum}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* New Event Modal Dialog (Clean Centered Modal) */}
      <CustomModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Calendar Event"
        icon="calendar-line"
        maxWidth={460}
      >
        <View style={styles.modalForm}>
          <CustomTextInput
            value={eventTitle}
            onChangeText={setEventTitle}
            placeholder="Event title (e.g. Sprint Demo or Design Sync)"
            size="md"
            autoFocus={true}
          />

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Date</Text>
              <CustomTextInput
                value={eventDate}
                onChangeText={setEventDate}
                placeholder="YYYY-MM-DD"
                size="sm"
                icon="calendar-line"
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Time</Text>
              <CustomTextInput
                value={eventTime}
                onChangeText={setEventTime}
                placeholder="09:00 AM"
                size="sm"
                icon="time-line"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Event Type</Text>
              <CustomSelect
                options={EVENT_TYPE_OPTIONS}
                value={eventType}
                onChange={(v) => setEventType(v as any)}
                size="sm"
                variant="filled"
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <CustomSelect
                options={PRIORITY_OPTIONS}
                value={eventPriority}
                onChange={(v) => setEventPriority(v as any)}
                size="sm"
                variant="filled"
              />
            </View>
          </View>

          <CustomTextInput
            value={eventNotes}
            onChangeText={setEventNotes}
            placeholder="Notes or description (optional)"
            size="sm"
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, !eventTitle.trim() && styles.saveBtnDisabled]}
              onPress={handleCreateEvent}
              disabled={!eventTitle.trim()}
            >
              <Text style={styles.saveBtnText}>Save Event</Text>
            </Pressable>
          </View>
        </View>
      </CustomModal>

      {/* Edit Event Modal Dialog */}
      <CustomModal
        visible={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        title="Edit Calendar Event"
        icon="pencil-line"
        maxWidth={460}
      >
        <View style={styles.modalForm}>
          <CustomTextInput
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Event title (e.g. Sprint Demo or Design Sync)"
            size="md"
            autoFocus={true}
          />

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Date</Text>
              <CustomTextInput
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
                size="sm"
                icon="calendar-line"
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Time</Text>
              <CustomTextInput
                value={editTime}
                onChangeText={setEditTime}
                placeholder="09:00 AM"
                size="sm"
                icon="time-line"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Event Type</Text>
              <CustomSelect
                options={EVENT_TYPE_OPTIONS}
                value={editType}
                onChange={(v) => setEditType(v as any)}
                size="sm"
                variant="filled"
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <CustomSelect
                options={PRIORITY_OPTIONS}
                value={editPriority}
                onChange={(v) => setEditPriority(v as any)}
                size="sm"
                variant="filled"
              />
            </View>
          </View>

          <CustomTextInput
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder="Notes or description (optional)"
            size="sm"
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setEditingEvent(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, (!editTitle.trim() || isSavingEdit) && styles.saveBtnDisabled]}
              onPress={handleSaveEditEvent}
              disabled={!editTitle.trim() || isSavingEdit}
            >
              {isSavingEdit ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </Pressable>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moduleTitle: {
    fontSize: 13.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    gap: 2,
  },
  arrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 120,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  todayBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewModeGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  viewModeText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
  },
  viewModeTextActive: {
    color: '#0F172A',
  },
  agendaToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  agendaToggleBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  agendaToggleText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  agendaToggleTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  githubStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  githubStatusPillSyncing: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  githubLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  githubLiveDotSyncing: {
    backgroundColor: '#3B82F6',
  },
  githubStatusText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addEventBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  gridContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  gridContainerFull: {
    borderRightWidth: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingVertical: 7,
  },
  weekHeaderCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekHeaderText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  daysGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: `${100 / 6}%`,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    padding: 5,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  dayCellDimmed: {
    backgroundColor: '#FAFAFA',
  },
  dayCellLightBg: {
    backgroundColor: '#F0FDF4',
  },
  dayCellMediumBg: {
    backgroundColor: '#DCFCE7',
  },
  dayCellHeavyBg: {
    backgroundColor: '#BBF7D0',
  },
  dayCellSelected: {
    backgroundColor: '#EFF6FF',
  },
  dayCellToday: {
    backgroundColor: '#F8FAFC',
  },
  dayCellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finDayBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
  },
  finDayBadgeIncome: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  finDayBadgeExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  finDayBadgeText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  finDayTextIncome: {
    color: '#059669',
  },
  finDayTextExpense: {
    color: '#DC2626',
  },
  dayNumberCircleToday: {
    backgroundColor: '#0F172A',
  },
  dayNumberCircleSelected: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  dayNumberText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  dayNumberDimmed: {
    color: '#CBD5E1',
  },
  dayNumberTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayNumberTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dayNumberTextLight: {
    color: '#166534',
    fontWeight: '600',
  },
  dayNumberTextMedium: {
    color: '#15803D',
    fontWeight: '700',
  },
  dayNumberTextHeavy: {
    color: '#14532D',
    fontWeight: '700',
  },
  eventChipsContainer: {
    gap: 3,
    marginTop: 2,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  pillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pillNormal: {
    backgroundColor: '#EFF6FF',
  },
  pillTextNormal: {
    color: '#1E40AF',
  },
  pillUrgent: {
    backgroundColor: '#FEF2F2',
  },
  pillTextUrgent: {
    color: '#991B1B',
  },
  pillHigh: {
    backgroundColor: '#FFFBEB',
  },
  pillTextHigh: {
    color: '#92400E',
  },
  pillTask: {
    backgroundColor: '#EEF2FF',
  },
  pillTextTask: {
    color: '#3730A3',
  },
  pillGithub: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  githubRoundBadge: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTextGithub: {
    color: '#1E293B',
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    fontWeight: '500',
    flex: 1,
  },
  pillMeeting: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  pillTextMeeting: {
    color: '#1D4ED8',
    fontFamily: 'Krasar-Bold',
    fontSize: 9.5,
    fontWeight: '700',
  },
  eventPillText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    flex: 1,
  },
  monthInsightStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  insightStripItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  insightStripIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightStripLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  insightStripVal: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  insightStripValDark: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  insightStripDivider: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 1,
  },
  moreEventsPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 1,
  },
  moreEventsText: {
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  agendaGithubBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  agendaGithubText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  sideAgenda: {
    width: 290,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  agendaToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scopeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 2,
    marginBottom: 10,
    gap: 2,
  },
  scopeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4.5,
    borderRadius: 4,
  },
  scopeTabBtnActive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scopeTabText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  scopeTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  agendaSearchCol: {
    flex: 1,
  },
  agendaToolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 2,
  },
  viewToggleBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  viewToggleBtnActive: {
    backgroundColor: '#EEF2F6',
  },
  closeAgendaBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaCompactList: {
    gap: 6,
  },
  agendaListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  agendaListItemCompleted: {
    opacity: 0.6,
  },
  listCheckBtn: {
    padding: 2,
  },
  listTitle: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
  },
  listTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  listTimeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  listTimeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
  },
  listDeleteBtn: {
    padding: 3,
  },
  listTaskBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  listTaskBadgeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#6366F1',
    textTransform: 'uppercase',
  },
  agendaScroll: {
    flex: 1,
  },
  agendaEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 6,
  },
  agendaEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaEmptyTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#334155',
  },
  agendaEmptySub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  agendaList: {
    gap: 8,
  },
  agendaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  agendaTaskCard: {
    borderLeftWidth: 1,
    borderColor: '#E0E7FF',
    backgroundColor: '#FAFAFF',
  },
  agendaCardCompleted: {
    opacity: 0.6,
  },
  agendaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agendaTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  agendaTypeText: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  taskStatusTag: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#6366F1',
    fontWeight: '700',
  },
  agendaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconAction: {
    padding: 3,
  },
  agendaCardTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
  },
  agendaCardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  agendaCardDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 14,
  },

  /* DAY TIMELINE STYLES */
  dayTimelineContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  daySubNav: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backToMonthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  backToMonthText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  daySubCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daySubTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  dayCountBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayCountText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
  },
  daySubAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  daySubAddText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
  allDaySection: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  allDayLabelCol: {
    width: 80,
  },
  allDayLabel: {
    fontSize: 9,
    fontFamily: 'Krasar-Bold',
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  allDayContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allDayTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  allDayTaskTitle: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#3730A3',
    maxWidth: 160,
  },
  allDayTaskStatus: {
    fontSize: 9,
    fontFamily: 'Krasar-Regular',
    color: '#6366F1',
    textTransform: 'uppercase',
  },
  allDayEventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  allDayEventTitle: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#1E40AF',
    maxWidth: 160,
  },
  timelineScroll: {
    flex: 1,
  },
  timelineGrid: {
    paddingVertical: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeCol: {
    width: 86,
    paddingHorizontal: 12,
    paddingTop: 8,
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FAFAFC',
  },
  timeColText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#64748B',
  },
  timeColTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  laneCol: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  laneColCurrent: {
    backgroundColor: 'rgba(239, 246, 255, 0.3)',
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTimeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    marginLeft: -3.5,
  },
  currentTimeBar: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#EF4444',
  },
  slotEventsList: {
    gap: 4,
    width: '100%',
  },
  timelineEventCard: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '100%',
  },
  tlNormal: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  tlUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  tlHigh: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  tlCompleted: {
    opacity: 0.55,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  tlCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tlHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  tlEventTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  tlEventTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  tlTimePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tlTimePillText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#475569',
    fontWeight: '600',
  },
  tlActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tlIconBtn: {
    padding: 3,
  },
  tlEventDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 14,
  },
  emptySlotIndicator: {
    opacity: 0.4,
    paddingVertical: 8,
  },
  emptySlotText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },

  /* AGENDA FULL VIEW STYLES */
  agendaViewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  agendaViewContent: {
    padding: 16,
    gap: 8,
  },
  agendaEmptyFull: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  agendaFullCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendaFullLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  agendaFullDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  agendaFullTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  agendaFullSub: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  agendaFullDesc: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
    marginTop: 4,
  },
  fullAgendaToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  fullAgendaCountText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  fullPaginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  fullPageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  fullPageBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
  },
  fullPageBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  fullPageBtnTextDisabled: {
    color: '#94A3B8',
  },
  fullPageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fullNumBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullNumBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  fullNumText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  fullNumTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sidePaginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sidePaginationText: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  sidePaginationBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  sidePageBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePageBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#F8FAFC',
  },

  /* MODAL FORM STYLES */
  modalForm: {
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
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
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* YEAR VIEW STYLES */
  yearViewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  yearMonthCard: {
    width: '23.8%',
    minWidth: 200,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  yearMonthCardActive: {
    borderColor: '#93C5FD',
  },
  yearMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  yearMonthTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  yearMonthTitleActive: {
    color: '#2563EB',
  },
  yearEventBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  yearEventBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    color: '#15803D',
    fontWeight: '700',
  },
  yearWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  yearWeekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 8.5,
    fontFamily: 'Krasar-Bold',
    color: '#94A3B8',
    fontWeight: '600',
  },
  yearDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  yearDayCellEmpty: {
    width: '14.28%',
    height: 24,
  },
  yearDayCellWrapper: {
    width: '14.28%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  yearDayBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearDayBadgeToday: {
    backgroundColor: '#0F172A',
  },
  yearDayBadgeSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  yearDayBadgeEvent: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  yearDayBadgeMedium: {
    backgroundColor: '#86EFAC',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  yearDayBadgeHeavy: {
    backgroundColor: '#15803D',
    borderWidth: 1,
    borderColor: '#166534',
  },
  yearDayText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 12,
  },
  yearDayTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  yearDayTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  yearDayTextHasEvent: {
    color: '#15803D',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  yearDayTextMedium: {
    color: '#14532D',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
  yearDayTextHeavy: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Krasar-Bold',
  },
});
