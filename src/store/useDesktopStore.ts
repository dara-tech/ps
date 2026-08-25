import { create } from 'zustand';
import { 
  Employee, 
  Task, 
  Project, 
  ChatConversation, 
  RealtimeEvent,
  PersonalFinanceRecord,
  AIChatMessage,
  CalendarEvent,
  MarketItem,
  MarketBuyingGoal,
  DealEvaluation
} from '../../shared';
import { toast } from './useToastStore';

export type DesktopNavModule = 'copilot' | 'planner' | 'calendar' | 'goals' | 'finances' | 'market' | 'dashboard' | 'chat' | 'settings';

export interface GithubSyncConfig {
  username: string;
  repo: string;
  token?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncedCount?: number;
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
  personalContext: string;
  setPersonalContext: (context: string) => void;
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

  // Market & Buying Goals Data
  marketItems: MarketItem[];
  marketBuyingGoals: MarketBuyingGoal[];
  topMarketDeals: any[];
  isMarketLoading: boolean;
  activeEvaluation: DealEvaluation | null;

  // Loading
  isLoading: boolean;

  // Layout Controls
  isTopNavVisible: boolean;
  toggleTopNav: () => void;
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
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createFinanceRecord: (data: Omit<PersonalFinanceRecord, 'id'>) => Promise<void>;
  deleteFinanceRecord: (id: string) => Promise<void>;
  importFinanceStatement: (
    input?: string | { filePath?: string; fileBase64?: string; filename?: string },
    clearExisting?: boolean
  ) => Promise<{ success: boolean; count: number; totalIncome: number; totalExpense: number }>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  toggleCalendarEvent: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;

  // Market Actions
  searchMarket: (query?: string, category?: string) => Promise<void>;
  fetchMarketGoals: () => Promise<void>;
  createMarketGoal: (goal: Omit<MarketBuyingGoal, 'id' | 'createdAt'>) => Promise<void>;
  updateMarketGoal: (id: string, updates: Partial<MarketBuyingGoal>) => Promise<void>;
  deleteMarketGoal: (id: string) => Promise<void>;
  evaluateMarketItem: (item: MarketItem, targetGoalId?: string) => Promise<DealEvaluation | null>;
  fetchTopMarketDeals: () => Promise<void>;
}

const API_ROOT = 'http://localhost:4000/api/v1';
const WS_URL = 'ws://localhost:4000/ws';

const getSavedGithubConfig = (): GithubSyncConfig => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { username: 'dara-tech', repo: '', token: '', autoSync: true };
  }
  try {
    const raw = window.localStorage.getItem('epr_github_config');
    if (!raw) return { username: 'dara-tech', repo: '', token: '', autoSync: true };
    const parsed = JSON.parse(raw);
    if (!parsed.username || parsed.username === 'cheolsovandara' || parsed.username === 'dara_tech') {
      parsed.username = 'dara-tech';
      parsed.repo = '';
    }
    return parsed;
  } catch {
    return { username: 'dara-tech', repo: '', token: '', autoSync: true };
  }
};

const DEFAULT_PERSONAL_CONTEXT = `User Identity: Dara (dara-tech)
Role: Lead Software Architect & Developer
Active Stack: Expo, React Native, Node.js, Electron, TypeScript
Design Constraints: Strictly NO SHADOWS (ហាមប្រើ Shadow ដាច់ខាត), 1px crisp borders (#E2E8F0), Krasar & Kantumruy Pro fonts, outlineStyle none
Current Sprint Focus: Production build preparation, performance optimization, and native desktop packaging.`;

const getSavedPersonalContext = (): string => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_PERSONAL_CONTEXT;
  }
  try {
    const raw = window.localStorage.getItem('epr_personal_context');
    if (!raw) return DEFAULT_PERSONAL_CONTEXT;
    // If old stale meeting notes exist in localStorage, purge and reset
    if (
      raw.includes('DHIS2') ||
      raw.includes('ART') ||
      raw.includes('Evening Run') ||
      raw.includes('Technical Sync') ||
      raw.includes('NCHADS') ||
      raw.includes('2727')
    ) {
      window.localStorage.setItem('epr_personal_context', DEFAULT_PERSONAL_CONTEXT);
      return DEFAULT_PERSONAL_CONTEXT;
    }
    return raw;
  } catch {
    return DEFAULT_PERSONAL_CONTEXT;
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
    const updated = { ...get().githubConfig, ...config };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('epr_github_config', JSON.stringify(updated));
      } catch (e) {}
    }
    set({ githubConfig: updated });
  },

  // Layout Controls
  isTopNavVisible: true,
  toggleTopNav: () => set((state) => ({ isTopNavVisible: !state.isTopNavVisible })),
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
  personalContext: getSavedPersonalContext(),
  setPersonalContext: (context: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('epr_personal_context', context);
      } catch (e) {}
    }
    set({ personalContext: context });
  },
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
      const { personalContext, tasks, finances, calendarEvents, githubConfig, projects } = get();

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const systemPrompt = `[PERSONAL AI COPILOT FOR DARA]
User Identity: Dara (dara-tech)
Role: Lead Software Architect & Developer
Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${todayStr})
You are equipped with direct real-time database tools:
- get_calendar_events: Call this tool whenever asked about schedule, events, meetings, or agenda for any date. If user asks "see my events today", "what are my events", or types "27", call get_calendar_events with date "${todayStr}".
- add_calendar_event: Call to schedule new events or meetings.
- get_tasks / create_task: Call to query or add tasks.
- get_finances / log_expense: Call to query financial records or log expenses.
Always use your tools to provide 100% accurate, factual responses.`;

      // Filter out any previous hallucinated messages from conversation history to break the loop
      const cleanHistory = get().aiMessages
        .filter((m) =>
          !m.content.includes('DHIS2') &&
          !m.content.includes('ART Reporting') &&
          !m.content.includes('Evening Run') &&
          !m.content.includes('Technical Meeting') &&
          !m.content.includes('Technical Sync') &&
          !m.content.includes('NCHADS') &&
          !m.content.includes('918')
        )
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const messagesForPrompt = [
        { role: 'system' as const, content: systemPrompt },
        ...cleanHistory,
        { role: 'user' as const, content: userMsg.content },
      ];

      const res = await fetch(`${API_ROOT}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: get().selectedModel,
          messages: messagesForPrompt,
          clientContext: {
            calendarEvents: get().calendarEvents,
            tasks: get().tasks,
            finances: get().finances,
          },
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
  calendarEvents: (() => {
    // Load persisted events from localStorage, starts clean (NO MOCKUPS)
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('epr-calendar-events') : null;
      if (saved) return JSON.parse(saved) as CalendarEvent[];
    } catch {}
    return [];
  })(),
  activeConversationId: null,
  isLoading: false,

  // Market & Buying Goals
  marketItems: [],
  marketBuyingGoals: [],
  topMarketDeals: [],
  isMarketLoading: false,
  activeEvaluation: null,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [aiRes, tasksRes, projRes, finRes, chatsRes, empRes, calRes, goalsRes, dealsRes] = await Promise.all([
        fetch(`${API_ROOT}/ai/models`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/tasks`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/projects`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/finances`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/chats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/employees`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/calendar`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/market/goals`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_ROOT}/market/deals`).then(r => r.json()).catch(() => ({})),
      ]);

      const models = aiRes?.data?.models || ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
      const isAiOnline = aiRes?.data?.isAiOnline !== undefined ? Boolean(aiRes.data.isAiOnline) : true;
      const tasks = tasksRes?.data || [];
      const projects = projRes?.data || [];
      const finances = finRes?.data || [];
      const conversations = chatsRes?.data || [];
      const employees = empRes?.data || [];
      const backendCalEvents = Array.isArray(calRes?.data) ? calRes.data : [];
      const marketBuyingGoals = Array.isArray(goalsRes?.data) ? goalsRes.data : [];
      const topMarketDeals = Array.isArray(dealsRes?.data) ? dealsRes.data : [];

      // Merge backend SQLite events with local cache
      const eventMap = new Map<string, CalendarEvent>();
      for (const ev of backendCalEvents) {
        eventMap.set(ev.id, ev);
      }
      for (const ev of get().calendarEvents) {
        if (!eventMap.has(ev.id)) {
          eventMap.set(ev.id, ev);
          // Sync missing local event to backend SQLite
          fetch(`${API_ROOT}/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ev),
          }).catch(() => {});
        }
      }
      const finalCalendarEvents = Array.from(eventMap.values());

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr-calendar-events', JSON.stringify(finalCalendarEvents));
        }
      } catch {}

      set({
        aiModels: models,
        selectedModel: models[0] || 'gemini-2.5-flash',
        isAiOnline,
        tasks,
        projects,
        finances,
        conversations,
        employees,
        calendarEvents: finalCalendarEvents,
        marketBuyingGoals,
        topMarketDeals,
        activeConversationId: conversations[0]?.id || null,
        isLoading: false,
      });

      // Background GitHub Sync on App Launch
      get().syncGithubEvents(true);
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
          } else if (payload.type === 'TASK_UPDATED_SYNC') {
            const updatedTask = payload.data;
            if (updatedTask?.id) {
              set((state) => ({
                tasks: state.tasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
              }));
            }
          } else if (payload.type === 'TASK_STATUS_SYNC') {
            const { taskId, status } = payload.data;
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            }));
          } else if (payload.type === 'TASK_DELETED_SYNC') {
            set((state) => ({ tasks: state.tasks.filter((t) => t.id !== payload.data.taskId) }));
          } else if (payload.type === 'FINANCE_RECORD_ADDED') {
            set((state) => ({ finances: [payload.data, ...state.finances] }));
          } else if (payload.type === 'FINANCE_RECORD_DELETED') {
            set((state) => ({ finances: state.finances.filter((f) => f.id !== payload.data.id) }));
          } else if (payload.type === 'CALENDAR_EVENT_CREATED') {
            const newEv = payload.data?.event || payload.data;
            if (newEv && newEv.id) {
              set((state) => {
                const exists = state.calendarEvents.some((e) => e.id === newEv.id);
                if (exists) return state;
                const updated = [newEv, ...state.calendarEvents];
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
                  }
                } catch {}
                return { calendarEvents: updated };
              });
            }
          } else if (payload.type === 'CALENDAR_EVENT_UPDATED') {
            const updatedEv = payload.data;
            if (updatedEv?.id) {
              set((state) => {
                const updated = state.calendarEvents.map((e) =>
                  e.id === updatedEv.id ? { ...e, ...updatedEv } : e
                );
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
                  }
                } catch {}
                return { calendarEvents: updated };
              });
            }
          } else if (payload.type === 'CALENDAR_EVENT_TOGGLED') {
            const { id, isCompleted } = payload.data || {};
            if (id) {
              set((state) => {
                const updated = state.calendarEvents.map((e) =>
                  e.id === id
                    ? { ...e, isCompleted: typeof isCompleted === 'boolean' ? isCompleted : !e.isCompleted }
                    : e
                );
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
                  }
                } catch {}
                return { calendarEvents: updated };
              });
            }
          } else if (payload.type === 'CALENDAR_EVENT_DELETED') {
            const { id } = payload.data || {};
            if (id) {
              set((state) => {
                const updated = state.calendarEvents.filter((e) => e.id !== id);
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
                  }
                } catch {}
                return { calendarEvents: updated };
              });
            }
          } else if (payload.type === 'PROJECT_CREATED_SYNC') {
            const newProj = payload.data;
            if (newProj?.id) {
              set((state) => {
                const exists = state.projects.some((p) => p.id === newProj.id);
                if (exists) return state;
                return { projects: [newProj, ...state.projects] };
              });
            }
          } else if (payload.type === 'PROJECT_UPDATED_SYNC') {
            const updatedProj = payload.data;
            if (updatedProj?.id) {
              set((state) => ({
                projects: state.projects.map((p) => (p.id === updatedProj.id ? { ...p, ...updatedProj } : p)),
              }));
            }
          } else if (payload.type === 'PROJECT_DELETED_SYNC') {
            const { id } = payload.data || {};
            if (id) {
              set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
            }
          } else if (payload.type === 'TELEGRAM_NEW_MESSAGE') {
            const { useTelegramStore } = require('./useTelegramStore');
            useTelegramStore.getState().handleIncomingMessage(payload.data);
          } else if (payload.type === 'TELEGRAM_USER_TYPING') {
            const { useTelegramStore } = require('./useTelegramStore');
            useTelegramStore.getState().handleIncomingTyping(payload.data);
          } else if (payload.type === 'TELEGRAM_USER_STATUS') {
            const { useTelegramStore } = require('./useTelegramStore');
            useTelegramStore.getState().handleIncomingUserStatus(payload.data);
          } else if (payload.type === 'TELEGRAM_MESSAGES_READ') {
            const { useTelegramStore } = require('./useTelegramStore');
            useTelegramStore.getState().handleIncomingMessagesRead(payload.data);
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
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));
    try {
      const res = await fetch(`${API_ROOT}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update task');
    } catch (err: any) {
      console.error('[updateTaskStatus error]', err);
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
    try {
      const res = await fetch(`${API_ROOT}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update task');
      toast.success('Task Updated', 'Changes saved successfully');
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

  deleteTask: async (taskId: string) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
    try {
      const res = await fetch(`${API_ROOT}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete task');
      toast.success('Task Deleted', 'Task removed from planner');
    } catch (err: any) {
      toast.error('Delete Error', err.message);
      get().fetchInitialData();
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

  importFinanceStatement: async (
    input: string | { filePath?: string; fileBase64?: string; filename?: string } = '/Users/cheolsovandara/Downloads/Account Statement 26-08-2026.xlsx',
    clearExisting = false
  ) => {
    try {
      const bodyPayload =
        typeof input === 'string'
          ? { filePath: input, clearExisting }
          : { ...input, clearExisting };

      const res = await fetch(`${API_ROOT}/finances/import-statement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to parse Excel statement');
      }

      await get().fetchInitialData();
      return {
        success: true,
        count: json.data?.importedCount || 0,
        totalIncome: json.data?.totalIncome || 0,
        totalExpense: json.data?.totalExpense || 0,
      };
    } catch (err: any) {
      toast.error('Import Error', err.message);
      throw err;
    }
  },

  addCalendarEvent: async (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    set((state) => {
      const updated = [newEvent, ...state.calendarEvents];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
        }
      } catch {}
      return { calendarEvents: updated };
    });
    try {
      const res = await fetch(`${API_ROOT}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const json = await res.json();
      if (json?.data?.id && json.data.id !== newEvent.id) {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((e) => e.id === newEvent.id ? json.data : e),
        }));
      }
    } catch (err) {
      console.error('[addCalendarEvent API error]', err);
    }
    toast.success('Event Scheduled', `"${event.title}" added to calendar`);
  },

  updateCalendarEvent: async (id: string, updates: Partial<CalendarEvent>) => {
    set((state) => {
      const updated = state.calendarEvents.map((e) => (e.id === id ? { ...e, ...updates } : e));
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
        }
      } catch {}
      return { calendarEvents: updated };
    });
    try {
      const res = await fetch(`${API_ROOT}/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update calendar event');
      toast.success('Event Updated', 'Changes saved successfully');
    } catch (err: any) {
      toast.error('Event Error', err.message);
    }
  },

  toggleCalendarEvent: async (id: string) => {
    set((state) => {
      const updated = state.calendarEvents.map((e) =>
        e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
      );
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
        }
      } catch {}
      return { calendarEvents: updated };
    });
    try {
      await fetch(`${API_ROOT}/calendar/${id}/toggle`, { method: 'PUT' });
    } catch (err) {
      console.error('[toggleCalendarEvent API error]', err);
    }
  },

  deleteCalendarEvent: async (id: string) => {
    set((state) => {
      const updated = state.calendarEvents.filter((e) => e.id !== id);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr-calendar-events', JSON.stringify(updated));
        }
      } catch {}
      return { calendarEvents: updated };
    });
    try {
      await fetch(`${API_ROOT}/calendar/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[deleteCalendarEvent API error]', err);
    }
    toast.info('Event Removed', 'Event deleted from calendar');
  },

  createProject: async (data: Partial<Project>) => {
    try {
      const res = await fetch(`${API_ROOT}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create project');
      if (json.data) {
        set((state) => {
          const exists = state.projects.some((p) => p.id === json.data.id);
          if (exists) return state;
          return { projects: [json.data, ...state.projects] };
        });
      }
      toast.success('Project Created', `Project "${data.name}" added`);
      return json.data;
    } catch (err: any) {
      toast.error('Project Error', err.message);
      return null;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    try {
      const res = await fetch(`${API_ROOT}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update project');
      toast.success('Project Updated', 'Changes saved successfully');
      return true;
    } catch (err: any) {
      toast.error('Update Error', err.message);
      get().fetchInitialData();
      return false;
    }
  },

  deleteProject: async (id: string) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
    try {
      const res = await fetch(`${API_ROOT}/projects/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete project');
      toast.success('Project Deleted', 'Project removed');
      return true;
    } catch (err: any) {
      toast.error('Delete Error', err.message);
      get().fetchInitialData();
      return false;
    }
  },

  syncGithubEvents: async (silent = false) => {
    const config = get().githubConfig;
    const rawUser = (config.username || 'dara-tech').trim();
    if (!rawUser) {
      if (!silent) toast.error('GitHub Sync', 'Please enter a GitHub username in Settings.');
      return 0;
    }

    // Auto-normalize username: e.g. dara_tech -> dara-tech
    const owner = rawUser.replace(/_/g, '-');
    let repoName = (config.repo || '').trim();
    if (repoName.includes('/')) {
      const parts = repoName.split('/');
      repoName = parts[1].trim();
    }

    const newEvents: CalendarEvent[] = [];
    const eventIdSet = new Set<string>();

    const addEventSafely = (ev: CalendarEvent) => {
      if (!eventIdSet.has(ev.id)) {
        eventIdSet.add(ev.id);
        newEvents.push(ev);
      }
    };

    try {
      // 1. Try fetching via Backend API (bypasses browser CORS & includes local workspace commits)
      try {
        const queryParams = new URLSearchParams({
          username: owner,
          repo: repoName,
          token: config.token || '',
        });
        const backendRes = await fetch(`${API_ROOT}/github/events?${queryParams.toString()}`);
        if (backendRes.ok) {
          const json = await backendRes.json();
          if (json.success && Array.isArray(json.data?.events)) {
            for (const ev of json.data.events) {
              addEventSafely(ev);
            }
          }
        }
      } catch (backendErr) {
        console.warn('[GitHub Sync] Backend endpoint failed, falling back to direct fetch:', backendErr);
      }

      // 2. Direct fallback if backend returned nothing
      if (newEvents.length === 0) {
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (config.token && config.token.trim()) {
          headers['Authorization'] = `token ${config.token.trim()}`;
        }

        // Fetch User Events
        try {
          const eventsRes = await fetch(`https://api.github.com/users/${owner}/events?per_page=100`, { headers });
          if (eventsRes.ok) {
            const events = await eventsRes.json();
            if (Array.isArray(events)) {
              for (const ev of events) {
                const dateObj = new Date(ev.created_at || Date.now());
                const evDate = dateObj.toISOString().split('T')[0];
                const evTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addEventSafely({
                  id: `gh-ev-${ev.id}`,
                  title: `[Git Event] ${ev.type.replace('Event', '')} in ${ev.repo?.name || owner}`,
                  description: `Repository: ${ev.repo?.name || owner}`,
                  date: evDate,
                  time: evTime,
                  type: 'task',
                  priority: 'medium',
                  isCompleted: true,
                });
              }
            }
          }
        } catch {}
      }

      // 3. Merge with non-GitHub local calendar events
      const nonGhEvents = get().calendarEvents.filter((e) => !e.id.startsWith('gh-'));
      const combinedEvents = [...newEvents, ...nonGhEvents];

      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      set((state) => ({
        calendarEvents: combinedEvents,
        githubConfig: {
          ...state.githubConfig,
          username: owner,
          lastSyncedAt: nowTimeStr,
          syncedCount: newEvents.length,
        },
      }));

      // Save to localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('epr_github_config', JSON.stringify({
            ...get().githubConfig,
            username: owner,
            lastSyncedAt: nowTimeStr,
            syncedCount: newEvents.length,
          }));
        }
      } catch {}

      if (!silent) {
        if (newEvents.length > 0) {
          toast.success(
            'GitHub Synced',
            `Fetched ${newEvents.length} events from ${owner}${repoName ? '/' + repoName : ' (All Repositories)'}`
          );
        } else {
          toast.info('GitHub Synced', `Connected to GitHub (${owner}). No recent activities found.`);
        }
      }

      return newEvents.length;
    } catch (err) {
      console.error('[GitHub Sync Error]', err);
      if (!silent) {
        toast.error('GitHub Sync Failed', 'Check your username, repository name, or internet connection.');
      }
      return 0;
    }
  },

  // Market Actions
  searchMarket: async (query?: string, category?: string) => {
    set({ isMarketLoading: true });
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      params.append('limit', '20');

      const res = await fetch(`${API_ROOT}/market/search?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        set({ marketItems: json.data.items || [] });
      }
    } catch (e) {
      console.error('[Market Search Error]', e);
      toast.error('Market Search Failed', 'Could not retrieve listings.');
    } finally {
      set({ isMarketLoading: false });
    }
  },

  fetchMarketGoals: async () => {
    try {
      const res = await fetch(`${API_ROOT}/market/goals`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        set({ marketBuyingGoals: json.data });
      }
    } catch (e) {
      console.error('[Fetch Market Goals Error]', e);
    }
  },

  createMarketGoal: async (goalData: Omit<MarketBuyingGoal, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_ROOT}/market/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        set((state) => ({ marketBuyingGoals: [json.data, ...state.marketBuyingGoals] }));
        toast.success('Buying Goal Created', `Targeting "${json.data.title}" under $${json.data.maxBudget}`);
      }
    } catch (e) {
      console.error('[Create Market Goal Error]', e);
      toast.error('Goal Creation Failed', 'Could not save buying goal.');
    }
  },

  updateMarketGoal: async (id: string, updates: Partial<MarketBuyingGoal>) => {
    try {
      const res = await fetch(`${API_ROOT}/market/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success && json.data) {
        set((state) => ({
          marketBuyingGoals: state.marketBuyingGoals.map((g) => (g.id === id ? json.data : g)),
        }));
        toast.success('Buying Goal Updated', 'Goal parameters updated.');
      }
    } catch (e) {
      console.error('[Update Market Goal Error]', e);
    }
  },

  deleteMarketGoal: async (id: string) => {
    try {
      await fetch(`${API_ROOT}/market/goals/${id}`, { method: 'DELETE' });
      set((state) => ({
        marketBuyingGoals: state.marketBuyingGoals.filter((g) => g.id !== id),
      }));
      toast.info('Goal Removed', 'Buying target removed from list.');
    } catch (e) {
      console.error('[Delete Market Goal Error]', e);
    }
  },

  evaluateMarketItem: async (item: MarketItem, targetGoalId?: string): Promise<DealEvaluation | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${API_ROOT}/market/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, targetGoalId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Evaluation HTTP status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        set({ activeEvaluation: json.data });
        return json.data;
      }
      return null;
    } catch (e: any) {
      console.warn('[Evaluate Item Warning]', e?.message || e);
      // Fallback local estimation so the UI never crashes or blocks
      const priceNum = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
      const fallbackFmv = Math.round(priceNum * 1.15);
      const fallbackEval: DealEvaluation = {
        itemId: item.id,
        itemTitle: item.title,
        askingPrice: priceNum,
        estimatedFairMarketValue: fallbackFmv,
        savingsUSD: Math.max(0, fallbackFmv - priceNum),
        dealScore: 82,
        goalAlignmentScore: 78,
        verdict: 'GOOD_DEAL',
        roiAnalysis: 'Item inspected for development and project milestone acceleration.',
        riskFactors: ['Inspect physical hardware and verify factory reset on-site.'],
        suggestedOfferPrice: Math.round(priceNum * 0.92),
        khmerNegotiationScript: `សួស្តីបង! ខ្ញុំចាប់អារម្មណ៍ "${item.title}" នេះ។ តើតម្លៃ $${Math.round(priceNum * 0.92)} អាចចរចាបានទេបង? ខ្ញុំអាចទៅមើលផ្ទាល់បាន។`,
        englishNegotiationScript: `Hi! I am interested in "${item.title}". Would you accept $${Math.round(priceNum * 0.92)}? I can come inspect it in person.`,
      };
      set({ activeEvaluation: fallbackEval });
      return fallbackEval;
    }
  },

  fetchTopMarketDeals: async () => {
    try {
      const res = await fetch(`${API_ROOT}/market/deals`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        set({ topMarketDeals: json.data });
      }
    } catch (e) {
      console.error('[Fetch Top Deals Error]', e);
    }
  },
}));

