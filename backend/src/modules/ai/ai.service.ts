import { db } from '../../data/db';
import { config } from '../../core/config/env.config';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { CalendarEvent } from '../../../../shared';
import { marketService } from '../market/market.service';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const AVAILABLE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const COPILOT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'get_calendar_events',
        description: 'Retrieves user scheduled calendar events directly from the official SQLite database. Use this tool whenever the user asks about their schedule, calendar, meetings, or what they did/have planned on any date (e.g. today, yesterday, tomorrow, or a specific date YYYY-MM-DD).',
        parameters: {
          type: 'OBJECT',
          properties: {
            date: {
              type: 'STRING',
              description: 'Date in YYYY-MM-DD format (e.g. "2026-08-27").',
            },
            filter: {
              type: 'STRING',
              enum: ['today', 'upcoming', 'past', 'all'],
              description: 'Filter mode if exact date is unspecified.',
            },
          },
        },
      },
      {
        name: 'add_calendar_event',
        description: 'Creates and schedules a new calendar event directly into the user\'s official calendar database.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Title of the event or meeting.' },
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD format.' },
            time: { type: 'STRING', description: 'Start time (e.g. "09:00 AM" or "14:30").' },
            endTime: { type: 'STRING', description: 'End time (e.g. "10:30 AM").' },
            type: { type: 'STRING', enum: ['task', 'meeting', 'milestone', 'reminder'], description: 'Type of event.' },
            description: { type: 'STRING', description: 'Optional details or notes.' },
          },
          required: ['title', 'date'],
        },
      },
      {
        name: 'delete_calendar_event',
        description: 'Deletes a calendar event from the database by ID or title match.',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING', description: 'Event ID to delete.' },
            title: { type: 'STRING', description: 'Event title if ID is not known.' },
          },
        },
      },
      {
        name: 'get_tasks',
        description: 'Queries active or completed tasks from the user\'s task database.',
        parameters: {
          type: 'OBJECT',
          properties: {
            status: { type: 'STRING', enum: ['all', 'todo', 'in_progress', 'done', 'urgent'], description: 'Status filter.' },
          },
        },
      },
      {
        name: 'create_task',
        description: 'Creates a new task in the user\'s task tracker.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Task title.' },
            priority: { type: 'STRING', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'STRING', description: 'Due date in YYYY-MM-DD format.' },
            description: { type: 'STRING', description: 'Task description.' },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_finances',
        description: 'Queries the user\'s financial ledger (total income, total expense, net balance, and recent transaction records) from SQLite.',
        parameters: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING', description: 'Optional category filter.' },
          },
        },
      },
      {
        name: 'log_expense',
        description: 'Logs an expense or income transaction into the user\'s personal finance ledger.',
        parameters: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', enum: ['expense', 'income'] },
            amount: { type: 'NUMBER', description: 'Amount in USD.' },
            category: { type: 'STRING', description: 'Category (e.g. Food & Dining, Transportation, Technology, General).' },
            note: { type: 'STRING', description: 'Description of transaction.' },
          },
          required: ['type', 'amount', 'category'],
        },
      },
      {
        name: 'search_khmer24_market',
        description: 'Searches live items and deals on Khmer24 marketplace in Cambodia, returning prices, condition, seller info, and bargain deal scores.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Search keywords (e.g. "MacBook Pro M2", "4K Monitor", "Honda Scoopy").' },
            category: { type: 'STRING', description: 'Optional category (e.g. "Computers & Laptops", "Office & Furniture").' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_buying_goals',
        description: 'Retrieves the user\'s active personal buying targets, wishlist, budget caps, and personal improvement justifications.',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
    ],
  },
];

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
  }

  private getActiveApiKey(): string {
    return this.apiKey || process.env.GEMINI_API_KEY || '';
  }

  /**
   * Returns list of supported Google Gemini models and connection status
   */
  public async listModels(): Promise<{ models: string[]; isAiOnline: boolean; provider: string }> {
    const key = this.getActiveApiKey();
    return {
      models: AVAILABLE_GEMINI_MODELS,
      isAiOnline: Boolean(key),
      provider: 'Google Gemini',
    };
  }

  /**
   * Executes tool actions against real SQLite database records with 100% deterministic accuracy
   */
  private async executeTool(
    name: string,
    args: any,
    clientContext?: {
      calendarEvents?: CalendarEvent[];
      tasks?: any[];
      finances?: any[];
    }
  ): Promise<any> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    switch (name) {
      case 'get_calendar_events': {
        const targetDate = args?.date || (args?.filter === 'today' ? todayStr : undefined);
        let events = db.calendarEvents.filter((e) => !e.id.startsWith('gh-') && !e.title.startsWith('[Git'));

        // If clientContext provided live events from the user's active UI, merge safely
        if (clientContext?.calendarEvents && Array.isArray(clientContext.calendarEvents)) {
          const clientNonGh = clientContext.calendarEvents.filter((e) => !e.id.startsWith('gh-') && !e.title.startsWith('[Git'));
          const eventMap = new Map<string, CalendarEvent>();
          for (const e of events) eventMap.set(e.id, e);
          for (const e of clientNonGh) eventMap.set(e.id, e);
          events = Array.from(eventMap.values());
        }

        if (targetDate) {
          events = events.filter((e) => e.date === targetDate);
        } else if (args?.filter === 'upcoming') {
          events = events.filter((e) => e.date >= todayStr);
        } else if (args?.filter === 'past') {
          events = events.filter((e) => e.date < todayStr);
        }

        return {
          currentDate: todayStr,
          queryDate: targetDate || args?.filter || 'all',
          count: events.length,
          events: events.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time || '',
            endTime: e.endTime || '',
            type: e.type || 'task',
            priority: e.priority || 'medium',
            description: e.description || '',
            isCompleted: Boolean(e.isCompleted),
          })),
        };
      }

      case 'add_calendar_event': {
        const newEvent: CalendarEvent = {
          id: `evt-${Date.now()}`,
          title: args.title,
          date: args.date || todayStr,
          time: args.time || '09:00 AM',
          endTime: args.endTime || '',
          type: args.type || 'task',
          priority: args.priority || 'medium',
          description: args.description || '',
          isCompleted: false,
        };
        db.addCalendarEvent(newEvent);
        wsGateway.broadcast({ type: 'CALENDAR_EVENT_CREATED', data: newEvent });
        return {
          success: true,
          message: `Scheduled "${newEvent.title}" on ${newEvent.date} at ${newEvent.time}`,
          event: newEvent,
        };
      }

      case 'delete_calendar_event': {
        if (args.id) {
          db.deleteCalendarEvent(args.id);
          wsGateway.broadcast({ type: 'CALENDAR_EVENT_DELETED', data: { id: args.id } });
          return { success: true, deletedId: args.id };
        }
        if (args.title) {
          const match = db.calendarEvents.find((e) => e.title.toLowerCase().includes(args.title.toLowerCase()));
          if (match) {
            db.deleteCalendarEvent(match.id);
            wsGateway.broadcast({ type: 'CALENDAR_EVENT_DELETED', data: { id: match.id } });
            return { success: true, deletedEvent: match.title };
          }
        }
        return { success: false, message: 'Event not found' };
      }

      case 'get_tasks': {
        let tasks = db.tasks;
        if (args?.status === 'todo') tasks = tasks.filter((t) => t.status === 'todo');
        else if (args?.status === 'in_progress') tasks = tasks.filter((t) => t.status === 'in_progress');
        else if (args?.status === 'done') tasks = tasks.filter((t) => t.status === 'done');
        else if (args?.status === 'urgent') tasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');
        return { count: tasks.length, tasks };
      }

      case 'create_task': {
        const newTask = {
          id: `task-${Date.now()}`,
          title: args.title,
          priority: args.priority || 'medium',
          status: 'todo' as const,
          dueDate: args.dueDate || todayStr,
          description: args.description || '',
          projectId: 'proj-1',
          projectName: 'Personal Goals',
          assigneeId: 'user-1',
          assigneeName: 'Owner',
          assigneeAvatar: '',
          loggedHours: 0,
          estimatedHours: 1,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commentsCount: 0,
        };
        db.tasks = [newTask, ...db.tasks];
        wsGateway.broadcast({ type: 'TASK_CREATED', data: { task: newTask } });
        return { success: true, task: newTask };
      }

      case 'get_finances': {
        const finances = db.finances;
        const totalExpense = finances.filter((f) => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        const totalIncome = finances.filter((f) => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        return {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          recentTransactions: finances.slice(0, 10),
        };
      }

      case 'log_expense': {
        const record = {
          id: `fin-${Date.now()}`,
          type: args.type || 'expense',
          amount: Math.abs(args.amount),
          category: args.category || 'General',
          note: args.note || '',
          date: todayStr,
        };
        db.finances = [record, ...db.finances];
        wsGateway.broadcast({ type: 'FINANCE_RECORD_CREATED', data: { record } });
        return { success: true, record };
      }

      case 'search_khmer24_market': {
        const results = await marketService.searchListings({
          q: args.query,
          category: args.category,
          limit: 8,
        });
        return {
          total: results.total,
          items: results.items.map((i) => ({
            id: i.id,
            title: i.title,
            priceUSD: i.price,
            estimatedFairMarketValue: i.fairMarketValue,
            dealScore: i.dealScore,
            verdict: i.verdict,
            location: i.location,
            seller: i.seller?.name,
            phone: i.phone,
            link: i.link,
          })),
        };
      }

      case 'get_buying_goals': {
        const goals = marketService.getGoals();
        return {
          goals: goals.map((g: any) => ({
            id: g.id,
            title: g.title,
            category: g.category,
            targetSpecs: g.targetSpecs,
            maxBudgetUSD: g.maxBudget,
            priority: g.priority,
            justification: g.justification,
            status: g.status,
          })),
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  /**
   * Generates conversational AI response using Google Gemini Function Calling
   */
  public async chat(
    params: {
      model?: string;
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      clientContext?: {
        calendarEvents?: CalendarEvent[];
        tasks?: any[];
        finances?: any[];
      };
    },
    retryCount = 0
  ): Promise<{ message: { role: string; content: string }; model: string }> {
    const key = this.getActiveApiKey();
    let modelName = params.model || 'gemini-2.5-flash';
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }

    if (!key) {
      return {
        message: {
          role: 'assistant',
          content: '⚠️ **Gemini API Key Required**\n\nPlease configure your `GEMINI_API_KEY` in `backend/.env` to enable cloud AI reasoning.',
        },
        model: modelName,
      };
    }

    // Auto-sync client events into SQLite database
    if (params.clientContext?.calendarEvents && Array.isArray(params.clientContext.calendarEvents)) {
      for (const ev of params.clientContext.calendarEvents) {
        if (ev && ev.id && ev.title) {
          db.addCalendarEvent(ev);
        }
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Convert messages to Gemini format
    let systemInstruction = '';
    const contents: Array<{ role: string; parts: Array<any> }> = [];

    for (const m of params.messages) {
      if (m.role === 'system') {
        systemInstruction += (systemInstruction ? '\n' : '') + m.content;
      } else {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    const baseInstruction = `You are the intelligent Personal AI Copilot for Dara.
Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${todayStr}).
You have direct access to tools:
- get_calendar_events: Use this tool whenever asked about schedule, calendar, meetings, or events on ANY date (today, yesterday, or specific dates). If the user types "27" or "today", check today's events.
- add_calendar_event: Use to schedule new meetings/events.
- get_tasks / create_task: Use to query or create tasks.
- get_finances / log_expense: Use for finances and spending.
- search_khmer24_market: Use to search live market items, gear, tech, vehicles, and deals on Khmer24.
- get_buying_goals: Use to check Dara's active buying targets, budget limits, and personal growth goals.
CRITICAL: NEVER hallucinate or guess events. Always call the official tools. Provide crisp, high-value insights.`;

    const finalSystemInstruction = systemInstruction
      ? `${baseInstruction}\n\n${systemInstruction}`
      : baseInstruction;

    const payload: any = {
      contents,
      tools: COPILOT_TOOLS,
      systemInstruction: {
        parts: [{ text: finalSystemInstruction }],
      },
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    try {
      const endpoint = `${GEMINI_API_URL}/models/${modelName}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini] Status ${res.status} on ${modelName}:`, errorMsg);

        // Fallback chain across active models with distinct quota pools
        const fallbackChain: Record<string, string> = {
          'gemini-3.7-flash': 'gemini-3.5-flash',
          'gemini-2.5-flash': 'gemini-3.5-flash',
          'gemini-3.5-flash': 'gemini-3.6-flash',
          'gemini-3.6-flash': 'gemini-3.1-flash-lite',
        };

        const nextModel = fallbackChain[modelName];
        if (nextModel && (res.status === 429 || res.status === 503 || errorMsg.includes('quota') || errorMsg.includes('high demand'))) {
          console.log(`[Gemini] Auto-switching from ${modelName} to ${nextModel}...`);
          return this.chat({ ...params, model: nextModel }, retryCount);
        }

        if (retryCount < 2 && (res.status === 429 || errorMsg.includes('retry'))) {
          await sleep(1500);
          return this.chat(params, retryCount + 1);
        }

        return {
          message: {
            role: 'assistant',
            content: `⚡ **Gemini AI Service Notice**\n\n${errorMsg}`,
          },
          model: modelName,
        };
      }

      const candidate = data?.candidates?.[0];
      const part = candidate?.content?.parts?.[0];

      // ── HANDLE FUNCTION CALL (TOOL EXECUTION) ──────────────────────────────────
      if (part?.functionCall) {
        const { name, args } = part.functionCall;
        console.log(`[Gemini Function Call] Tool: ${name}`, args);

        const toolResult = await this.executeTool(name, args, params.clientContext);

        // Build follow-up payload with function result
        const followUpContents = [
          ...contents,
          candidate.content,
          {
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name,
                  response: { result: toolResult },
                },
              },
            ],
          },
        ];

        const followUpPayload: any = {
          contents: followUpContents,
          tools: COPILOT_TOOLS,
          systemInstruction: {
            parts: [{ text: finalSystemInstruction }],
          },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        };

        const followUpRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(followUpPayload),
        });

        const followUpData = await followUpRes.json();
        const finalText =
          followUpData?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'No response generated from tool result.';

        return {
          message: {
            role: 'assistant',
            content: finalText,
          },
          model: modelName,
        };
      }

      const generatedText = part?.text || 'No response generated from Gemini.';

      return {
        message: {
          role: 'assistant',
          content: generatedText,
        },
        model: modelName,
      };
    } catch (err: any) {
      console.error('Gemini chat request failed:', err);

      if (retryCount < 2) {
        await sleep(1000);
        return this.chat(params, retryCount + 1);
      }

      return {
        message: {
          role: 'assistant',
          content: `⚡ **Gemini Connection Error**\n\nCould not reach Google Gemini API (${err.message}). Check your internet connection.`,
        },
        model: modelName,
      };
    }
  }

  /**
   * Uses Gemini to break down a high-level goal into actionable subtasks
   */
  public async breakdownGoal(
    goalTitle: string,
    model?: string
  ): Promise<Array<{ title: string; priority: string; estimatedHours: number }>> {
    const prompt = `You are a high-efficiency productivity assistant. Break down the following personal goal into 3 to 5 clear, concrete subtasks:
Goal: "${goalTitle}"

Respond ONLY with a valid JSON array matching this schema without markdown fences:
[
  { "title": "Subtask title", "priority": "urgent" | "high" | "medium" | "low", "estimatedHours": number }
]`;

    try {
      const res = await this.chat({
        model: model || 'gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = res.message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Breakdown goal error:', e);
    }

    return [
      { title: `Research and outline roadmap for ${goalTitle}`, priority: 'high', estimatedHours: 2 },
      { title: `Set up core foundation and dependencies`, priority: 'medium', estimatedHours: 3 },
      { title: `Build initial prototype and test iteration`, priority: 'urgent', estimatedHours: 4 },
      { title: `Review and finalize checklist`, priority: 'low', estimatedHours: 1 },
    ];
  }

  /**
   * Uses Gemini to parse natural language into structured expense/income records
   */
  public async parseExpense(
    text: string,
    model?: string
  ): Promise<{
    type: 'expense' | 'income';
    amount: number;
    category: string;
    note: string;
  }> {
    const prompt = `Parse this personal finance transaction into structured JSON:
Text: "${text}"

Respond ONLY with a valid JSON object matching this schema without markdown codeblocks:
{
  "type": "expense" or "income",
  "amount": number,
  "category": "Food & Dining" | "Transportation" | "Housing & Utilities" | "Technology & Software" | "Entertainment" | "Health" | "Income & Freelance" | "General",
  "note": "short clean description"
}`;

    try {
      const res = await this.chat({
        model: model || 'gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = res.message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.amount && typeof parsed.amount === 'number') {
          return {
            type: parsed.type === 'income' ? 'income' : 'expense',
            amount: Math.abs(parsed.amount),
            category: parsed.category || 'General',
            note: parsed.note || text,
          };
        }
      }
    } catch (e) {
      console.error('Parse expense error:', e);
    }

    const numberMatch = text.match(/\$?(\d+(\.\d+)?)/);
    const amount = numberMatch ? parseFloat(numberMatch[1]) : 10;
    const isIncome =
      text.toLowerCase().includes('received') ||
      text.toLowerCase().includes('salary') ||
      text.toLowerCase().includes('income') ||
      text.toLowerCase().includes('freelance');

    return {
      type: isIncome ? 'income' : 'expense',
      amount,
      category: isIncome ? 'Income & Freelance' : 'General',
      note: text,
    };
  }

  /**
   * Generates a morning AI briefing using Gemini
   */
  public async generateDailyBriefing(model?: string): Promise<{
    summary: string;
    focusSuggestion: string;
    productivityScore: number;
  }> {
    const tasks = db.tasks;
    const todayTasks = tasks.filter((t) => t.status !== 'done');
    const completedTasks = tasks.filter((t) => t.status === 'done');

    try {
      const key = this.getActiveApiKey();
      if (key && todayTasks.length > 0) {
        const taskTitles = todayTasks.map((t) => `- ${t.title} (${t.priority})`).join('\n');
        const prompt = `Based on these active tasks for today:
${taskTitles}

You are a Personal AI OS Assistant. Provide a concise 1-2 sentence morning briefing and 1 key priority recommendation IN NATURAL, PROFESSIONAL KHMER (ភាសាខ្មែរ).
Return ONLY JSON with this format:
{
  "summary": "សេចក្តីសង្ខេបជាភាសាខ្មែរ...",
  "focusSuggestion": "ការណែនាំជាភាសាខ្មែរ..."
}`;

        const res = await this.chat({
          model: model || 'gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
        });

        const jsonMatch = res.message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary,
            focusSuggestion: parsed.focusSuggestion,
            productivityScore: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 85,
          };
        }
      }
    } catch (e) {
      // Fallback
    }

    return {
      summary: `អរុណសួស្តី! អ្នកមានភារកិច្ចសកម្មចំនួន ${todayTasks.length} សម្រាប់ថ្ងៃនេះ និងបានបញ្ចប់ ${completedTasks.length} រួចរាល់។`,
      focusSuggestion: todayTasks[0]
        ? `សូមផ្តោតលើ "${todayTasks[0].title}" មុនគេក្នុងម៉ោងបំពេញការងារសំខាន់របស់អ្នក។`
        : 'ភារកិច្ចចម្បងទាំងអស់ត្រូវបានសម្រេចរួចរាល់! ពេលវេលាល្អសម្រាប់រៀបចំគម្រោងថ្មី។',
      productivityScore: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 85,
    };
  }
}

export const aiService = new AIService();
