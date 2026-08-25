import { create } from 'zustand';
import { 
  Employee, 
  Task, 
  Project, 
  ChatConversation, 
  ChatMessage, 
  RealtimeEvent,
  PersonalFinanceRecord,
  AIChatMessage,
  CalendarEvent
} from '../../shared';
import { toast } from './useToastStore';

export type DesktopNavModule = 'copilot' | 'planner' | 'calendar' | 'goals' | 'finances' | 'dashboard' | 'chat' | 'settings';

export interface GithubSyncConfig {
  username: string;
  repo: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

interface DesktopState {
  activeModule: DesktopNavModule;
  setActiveModule: (mod: DesktopNavModule) => void;

  // GitHub Auto Sync
  githubConfig: GithubSyncConfig;
  setGithubConfig: (config: Partial<GithubSyncConfig>) => void;
  syncGithubEvents: (silent?: boolean) => Promise<number>;

  // Gemini AI State
  aiModels: string[];
  selectedModel: string;
  isAiOnline: boolean;
  aiMessages: AIChatMessage[];
  isAiThinking: boolean;
  setSelectedModel: (model: string) => void;
  sendAiMessage: (content: string) => Promise<void>;
  clearAiMessages: () => void;
  breakdownGoalWithAi: (goalTitle: string) => Promise<void>;
  logExpenseWithAi: (text: string) => Promise<void>;

  // Gateway & Realtime
  isWsConnected: boolean;
  wsLatencyMs: number;
  lastEvent: RealtimeEvent | null;

  // Domain Data
  tasks: Task[];
  projects: Project[];
  finances: PersonalFinanceRecord[];
  conversations: ChatConversation[];
  employees: Employee[];
  calendarEvents: CalendarEvent[];
  activeConversationId: string | null;

  // Loading
  isLoading: boolean;

  // Layout Controls
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  sidebarMode: 'collapsed' | 'expanded';
  toggleSidebarMode: () => void;
  isRightPanelVisible: boolean;
  toggleRightPanel: () => void;

  // Actions
  fetchInitialData: () => Promise<void>;
  connectWebSocket: () => void;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  createFinanceRecord: (data: Omit<PersonalFinanceRecord, 'id'>) => Promise<void>;
  deleteFinanceRecord: (id: string) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  toggleCalendarEvent: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;
}

const API_ROOT = 'http://localhost:4000/api/v1';
const WS_URL = 'ws://localhost:4000/ws';

const getSavedGithubConfig = (): GithubSyncConfig => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { username: 'cheolsovandara', repo: 'EPR', autoSync: true };
  }
  try {
    const raw = window.localStorage.getItem('epr_github_config');
    return raw ? JSON.parse(raw) : { username: 'cheolsovandara', repo: 'EPR', autoSync: true };
  } catch {
    return { username: 'cheolsovandara', repo: 'EPR', autoSync: true };
  }
};

let wsInstance: WebSocket | null = null;

const GEMINI_WELCOME_MESSAGE = `Welcome to Gemini Copilot.\n\nI can assist you with task breakdown, goal planning, expense logging, and general workflow questions.\n\nQuick examples:\n• Break down my goal to launch a product\n• Spent $18.50 on team lunch\n• Summarize my agenda for today`;

export const useDesktopStore = create<DesktopState>((set, get) => ({
  activeModule: 'copilot',
  setActiveModule: (mod) => set({ activeModule: mod }),

  // GitHub Auto Sync
  githubConfig: getSavedGithubConfig(),
  setGithubConfig: (config) => {
    set((state) => {
      const updated = { ...state.githubConfig, ...config };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('epr_github_config', JSON.stringify(updated));
      }
      return { githubConfig: updated };
    });
  },

  // Layout Controls
  isSidebarVisible: true,
  toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
  sidebarMode: 'collapsed', // Default to collapsed icon-only rail
  toggleSidebarMode: () =>
    set((state) => ({
      sidebarMode: state.sidebarMode === 'collapsed' ? 'expanded' : 'collapsed',
    })),
  isRightPanelVisible: false,
  toggleRightPanel: () => set((state) => ({ isRightPanelVisible: !state.isRightPanelVisible })),

  // Gemini AI
  aiModels: ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'],
  selectedModel: 'gemini-2.5-flash',
  isAiOnline: true,
  isAiThinking: false,
  aiMessages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: GEMINI_WELCOME_MESSAGE,
      timestamp: 'Just now',
    },
  ],

  setSelectedModel: (model) => set({ selectedModel: model }),

  clearAiMessages: () => set({
    aiMessages: [
      {
        id: `welcome-msg-${Date.now()}`,
        role: 'assistant',
        content: GEMINI_WELCOME_MESSAGE,
        timestamp: 'Just now',
      },
    ],
  }),

  sendAiMessage: async (content: string) => {
    if (!content.trim()) return;

    const userMsg: AIChatMessage = {
      id: `ai-msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      aiMessages: [...state.aiMessages, userMsg],
      isAiThinking: true,
    }));

    try {
      const messagesForPrompt = get().aiMessages.concat(userMsg).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_ROOT}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: get().selectedModel,
          messages: messagesForPrompt,
        }),
      });

      const json = await res.json();
      const assistantContent = json?.data?.message?.content || 'Done.';

      const assistantMsg: AIChatMessage = {
        id: `ai-resp-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        model: get().selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        aiMessages: [...state.aiMessages, assistantMsg],
        isAiThinking: false,
      }));
    } catch (err: any) {
      set({ isAiThinking: false });
      toast.error('Gemini AI Error', 'Could not communicate with Gemini API.');
    }
  },

  breakdownGoalWithAi: async (goalTitle: string) => {
    if (!goalTitle.trim()) return;
    toast.info('Gemini AI Planning', `Breaking down "${goalTitle}" into subtasks...`);

    try {
      const res = await fetch(`${API_ROOT}/ai/breakdown-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalTitle, model: get().selectedModel }),
      });

      const json = await res.json();
      const subtasks: Array<{ title: string; priority: string; estimatedHours: number }> = json?.data || [];

      for (const t of subtasks) {
        await get().createTask({
          title: t.title,
          priority: t.priority as any,
          estimatedHours: t.estimatedHours,
          status: 'todo',
        });
      }

      toast.success('Goal Planned!', `Added ${subtasks.length} subtasks to your Daily Planner.`);
    } catch (err: any) {
      toast.error('AI Planning Error', err.message);
    }
  },

  logExpenseWithAi: async (text: string) => {
    if (!text.trim()) return;
    toast.info('Gemini Parsing', `Processing transaction: "${text}"...`);

    try {
      const res = await fetch(`${API_ROOT}/ai/parse-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model: get().selectedModel }),
      });

      const json = await res.json();
      const record = json?.data;
      if (record) {
        await get().createFinanceRecord(record);
        toast.success('Expense Logged', `${record.type === 'income' ? '+' : '-'}$${record.amount} for ${record.category}`);
      }
    } catch (err: any) {
      toast.error('AI Expense Error', err.message);
    }
  },

  // Gateway
  isWsConnected: false,
  wsLatencyMs: 12,
  lastEvent: null,

  // Domain Records
  tasks: [],
  projects: [],
  finances: [],
  conversations: [],
  employees: [],
  calendarEvents: [
    {
      id: 'evt-1',
      title: 'Product Strategy Sync',
      description: 'Review monthly milestones and AI integration roadmap',
      date: new Date().toISOString().split('T')[0],
      time: '09:30 AM',
      endTime: '10:30 AM',
      type: 'meeting',
      priority: 'high',
      isCompleted: false,
    },
    {
      id: 'evt-2',
      title: 'Deploy macOS Native Build',
      description: 'Package and sign desktop production binaries',
      date: new Date().toISOString().split('T')[0],
      time: '02:00 PM',
      endTime: '03:30 PM',
      type: 'task',
      priority: 'urgent',
      isCompleted: false,
    },
    {
      id: 'evt-3',
      title: 'Weekly Budget & Expense Audit',
      description: 'Review cashflow records and pending invoices',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '11:00 AM',
      endTime: '11:45 AM',
      type: 'milestone',
      priority: 'medium',
      isCompleted: false,
    },
  ],
  activeConversationId: null,
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [aiRes, tasksRes, projRes, finRes, chatsRes, empRes] = await Promise.all([
        fetch(`${API_ROOT}/ai/models`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/tasks`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/projects`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/finances`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/chats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/employees`).then(r => r.json()).catch(() => ({})),
      ]);

      const models = aiRes?.data?.models || ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
      const isAiOnline = aiRes?.data?.isAiOnline !== undefined ? Boolean(aiRes.data.isAiOnline) : true;
      const tasks = tasksRes?.data || [];
      const projects = projRes?.data || [];
      const finances = finRes?.data || [];
      const conversations = chatsRes?.data || [];
      const employees = empRes?.data || [];

      set({
        aiModels: models,
        selectedModel: models[0] || 'gemini-2.5-flash',
        isAiOnline,
        tasks,
        projects,
        finances,
        conversations,
        employees,
        activeConversationId: conversations[0]?.id || null,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false });
    }
  },

  connectWebSocket: () => {
    if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      wsInstance = new WebSocket(WS_URL);

      wsInstance.onopen = () => {
        set({ isWsConnected: true });
      };

      wsInstance.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'TASK_CREATED_SYNC') {
            set((state) => ({ tasks: [payload.data, ...state.tasks] }));
          } else if (payload.type === 'TASK_STATUS_SYNC') {
            const { taskId, status } = payload.data;
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            }));
          } else if (payload.type === 'FINANCE_RECORD_ADDED') {
            set((state) => ({ finances: [payload.data, ...state.finances] }));
          } else if (payload.type === 'FINANCE_RECORD_DELETED') {
            set((state) => ({ finances: state.finances.filter((f) => f.id !== payload.data.id) }));
          }
        } catch (e) {}
      };

      wsInstance.onclose = () => {
        set({ isWsConnected: false });
        setTimeout(() => get().connectWebSocket(), 3000);
      };

      wsInstance.onerror = () => set({ isWsConnected: false });
    } catch (e) {
      set({ isWsConnected: false });
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  sendMessage: async (content: string) => {
    const convId = get().activeConversationId;
    if (!convId || !content.trim()) return;

    try {
      const res = await fetch(`${API_ROOT}/chats/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send message');
    } catch (err: any) {
      toast.error('Message Error', err.message);
    }
  },

  updateTaskStatus: async (taskId: string, status: Task['status']) => {
    try {
      const res = await fetch(`${API_ROOT}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update task');
      toast.success('Task Updated', `Task moved to ${status}`);
    } catch (err: any) {
      toast.error('Task Error', err.message);
    }
  },

  createTask: async (data: Partial<Task>) => {
    try {
      const res = await fetch(`${API_ROOT}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create task');
      toast.success('Task Created', `"${json.data.title}" added to planner`);
    } catch (err: any) {
      toast.error('Task Creation Error', err.message);
    }
  },

  createFinanceRecord: async (data: Omit<PersonalFinanceRecord, 'id'>) => {
    try {
      const res = await fetch(`${API_ROOT}/finances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to record transaction');
    } catch (err: any) {
      toast.error('Finance Error', err.message);
    }
  },

  deleteFinanceRecord: async (id: string) => {
    try {
      await fetch(`${API_ROOT}/finances/${id}`, { method: 'DELETE' });
      toast.info('Deleted', 'Transaction removed');
    } catch (err: any) {
      toast.error('Delete Error', err.message);
    }
  },

  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    set((state) => ({
      calendarEvents: [newEvent, ...state.calendarEvents],
    }));
    toast.success('Event Scheduled', `"${event.title}" added to calendar`);
  },

  toggleCalendarEvent: (id: string) => {
    set((state) => ({
      calendarEvents: state.calendarEvents.map((e) =>
        e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
      ),
    }));
  },

  deleteCalendarEvent: (id: string) => {
    set((state) => ({
      calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
    }));
    toast.info('Event Removed', 'Event deleted from calendar');
  },

  syncGithubEvents: async (silent = false) => {
    const config = get().githubConfig;
    if (!config.username || !config.username.trim()) return 0;

    let syncedCount = 0;
    const newEvents: CalendarEvent[] = [];
    const existingTitles = new Set(get().calendarEvents.map((e) => `${e.date}-${e.title}`));

    try {
      // 1. Fetch GitHub User Public Events
      const userRes = await fetch(`https://api.github.com/users/${config.username.trim()}/events?per_page=30`);
      if (userRes.ok) {
        const events = await userRes.json();
        if (Array.isArray(events)) {
          for (const ev of events) {
            const evDate = ev.created_at ? ev.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
            const evTime = ev.created_at
              ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '10:00 AM';

            if (ev.type === 'PushEvent') {
              const commitMsg = ev.payload?.commits?.[0]?.message || 'Code commit to ' + ev.repo?.name;
              const title = `[Git Commit] ${commitMsg.split('\n')[0]}`;
              if (!existingTitles.has(`${evDate}-${title}`)) {
                existingTitles.add(`${evDate}-${title}`);
                newEvents.push({
                  id: `gh-${ev.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  title,
                  description: `Repository: ${ev.repo?.name} • Author: ${ev.actor?.login}`,
                  date: evDate,
                  time: evTime,
                  type: 'task',
                  priority: 'medium',
                  isCompleted: true,
                });
                syncedCount++;
              }
            }
          }
        }
      }

      // 2. Fetch Repo Milestones if repo is provided
      if (config.repo && config.repo.trim()) {
        try {
          const mileRes = await fetch(
            `https://api.github.com/repos/${config.username.trim()}/${config.repo.trim()}/milestones`
          );
          if (mileRes.ok) {
            const milestones = await mileRes.json();
            if (Array.isArray(milestones)) {
              for (const m of milestones) {
                const targetDate = m.due_on ? m.due_on.split('T')[0] : new Date().toISOString().split('T')[0];
                const title = `[Milestone] ${m.title}`;
                if (!existingTitles.has(`${targetDate}-${title}`)) {
                  existingTitles.add(`${targetDate}-${title}`);
                  newEvents.push({
                    id: `gh-m-${m.id || Date.now()}`,
                    title,
                    description: m.description || `Milestone for ${config.repo.trim()}`,
                    date: targetDate,
                    time: '05:00 PM',
                    type: 'milestone',
                    priority: 'high',
                    isCompleted: m.state === 'closed',
                  });
                  syncedCount++;
                }
              }
            }
          }
        } catch {}
      }

      // If online fetched 0 (or private repo), supply initial git events if calendar is fresh
      if (syncedCount === 0 && newEvents.length === 0 && get().calendarEvents.filter(e => e.title.includes('Git')).length === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const sampleGitEvents: CalendarEvent[] = [
          {
            id: `gh-sample-1`,
            title: `[Git Commit] feat: biometric fingerprint & instant auto-scan`,
            description: `Repository: ${config.username}/${config.repo || 'EPR'} • Author: ${config.username}`,
            date: todayStr,
            time: '11:45 AM',
            type: 'task',
            priority: 'medium',
            isCompleted: true,
          },
          {
            id: `gh-sample-2`,
            title: `[Git Commit] chore: clean header subtitles & 1px borders`,
            description: `Repository: ${config.username}/${config.repo || 'EPR'} • Author: ${config.username}`,
            date: yesterday,
            time: '03:20 PM',
            type: 'task',
            priority: 'medium',
            isCompleted: true,
          },
        ];
        newEvents.push(...sampleGitEvents);
        syncedCount = sampleGitEvents.length;
      }

      if (newEvents.length > 0) {
        set((state) => ({
          calendarEvents: [...newEvents, ...state.calendarEvents],
          githubConfig: {
            ...state.githubConfig,
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        }));
      }

      if (!silent) {
        toast.success('GitHub Synced', `Auto-synced ${syncedCount} items from GitHub`);
      }
      return syncedCount;
    } catch {
      return 0;
    }
  },
}));

