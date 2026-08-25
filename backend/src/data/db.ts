import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  Task, 
  Project, 
  PersonalFinanceRecord, 
  ChatConversation, 
  ChatMessage,
  RealtimeEvent,
  CalendarEvent,
  MarketItem,
  MarketBuyingGoal,
  DealEvaluation
} from '../../../shared';

// Create data directory if it doesn't exist
const dbDir = path.resolve(__dirname, '../../storage');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'quantum_personal.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for high concurrency
sqlite.pragma('journal_mode = WAL');

// 1. Initialize Clean Personal SQLite Tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    preferredModel TEXT DEFAULT 'llama3:latest',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    projectId TEXT,
    projectName TEXT,
    assigneeId TEXT,
    assigneeName TEXT,
    assigneeAvatar TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    dueDate TEXT,
    loggedHours REAL DEFAULT 0,
    estimatedHours REAL DEFAULT 1,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    leadId TEXT,
    leadName TEXT,
    leadAvatar TEXT,
    department TEXT,
    health TEXT DEFAULT 'on_track',
    progress REAL DEFAULT 0,
    milestones TEXT
  );

  CREATE TABLE IF NOT EXISTS personal_finances (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    email TEXT,
    phone TEXT,
    isOnline INTEGER DEFAULT 1,
    lastMessage TEXT,
    lastMessageTime TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversationId TEXT NOT NULL,
    senderId TEXT NOT NULL,
    senderName TEXT NOT NULL,
    senderAvatar TEXT,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(conversationId) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS realtime_events (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    description TEXT,
    timestamp TEXT,
    read INTEGER DEFAULT 0,
    actorId TEXT,
    actorName TEXT,
    actorAvatar TEXT
  );

  CREATE TABLE IF NOT EXISTS session_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    currentUserId TEXT
  );

  CREATE TABLE IF NOT EXISTS telegram_auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    sessionString TEXT,
    phone TEXT,
    userId TEXT,
    firstName TEXT,
    username TEXT,
    connectedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT,
    endTime TEXT,
    type TEXT DEFAULT 'task',
    priority TEXT DEFAULT 'medium',
    isCompleted INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS market_buying_goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    targetSpecs TEXT,
    maxBudget REAL NOT NULL,
    minBudget REAL DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    linkedProjectId TEXT,
    justification TEXT,
    status TEXT DEFAULT 'active',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS market_cached_deals (
    id TEXT PRIMARY KEY,
    itemId TEXT NOT NULL,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    fairMarketValue REAL,
    dealScore REAL,
    goalScore REAL,
    verdict TEXT,
    roiAnalysis TEXT,
    riskFactors TEXT,
    sellerPhone TEXT,
    sellerName TEXT,
    location TEXT,
    link TEXT,
    images TEXT,
    createdAt TEXT
  );
`);

// Safe migrations for table changes
try {
  sqlite.exec('ALTER TABLE tasks ADD COLUMN dueDate TEXT;');
} catch {}

// 2. Persistent Database Manager Class
class PersistentDatabase {
  public get currentUserId(): string {
    const row = sqlite.prepare('SELECT currentUserId FROM session_state WHERE id = 1').get() as any;
    return row?.currentUserId || '';
  }

  public set currentUserId(userId: string) {
    const exists = sqlite.prepare('SELECT COUNT(*) as count FROM session_state WHERE id = 1').get() as any;
    if (exists.count === 0) {
      sqlite.prepare('INSERT INTO session_state (id, currentUserId) VALUES (1, ?)').run(userId);
    } else {
      sqlite.prepare('UPDATE session_state SET currentUserId = ? WHERE id = 1').run(userId);
    }
  }

  // Users
  public get users(): any[] {
    return sqlite.prepare('SELECT * FROM users ORDER BY rowid ASC').all() as any[];
  }

  public set users(list: any[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, password, avatar, preferredModel, createdAt)
      VALUES (@id, @name, @email, @password, @avatar, @preferredModel, @createdAt)
    `);
    for (const u of list) {
      insert.run(u);
    }
  }

  // Legacy employees getter compatibility
  public get employees(): any[] {
    return this.users.map((u) => ({
      ...u,
      role: 'Owner',
      department: 'Personal',
      userRole: 'Executive',
      status: 'Online',
      currentProjectIds: [],
      activeTaskCount: 0,
    }));
  }

  public set employees(list: any[]) {
    this.users = list.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      password: e.password || 'password123',
      avatar: e.avatar,
      preferredModel: 'llama3:latest',
      createdAt: e.joinedDate || new Date().toISOString(),
    }));
  }

  // Passwords Map Wrapper
  public get passwords(): {
    get: (email: string) => string | undefined;
    set: (email: string, pass: string) => void;
  } {
    return {
      get: (email: string) => {
        const row = sqlite.prepare('SELECT password FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
        return row?.password;
      },
      set: (email: string, pass: string) => {
        sqlite.prepare('UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)').run(pass, email);
      },
    };
  }

  // Tasks
  public get tasks(): Task[] {
    return sqlite.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
  }

  public set tasks(list: Task[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO tasks (id, title, description, projectId, projectName, assigneeId, assigneeName, assigneeAvatar, priority, status, dueDate, loggedHours, estimatedHours, createdAt, updatedAt)
      VALUES (@id, @title, @description, @projectId, @projectName, @assigneeId, @assigneeName, @assigneeAvatar, @priority, @status, @dueDate, @loggedHours, @estimatedHours, @createdAt, @updatedAt)
    `);
    for (const t of list) {
      insert.run({
        id: t.id,
        title: t.title,
        description: t.description || '',
        projectId: t.projectId || 'proj-1',
        projectName: t.projectName || 'Personal Goals',
        assigneeId: t.assigneeId || 'user-1',
        assigneeName: t.assigneeName || 'Owner',
        assigneeAvatar: t.assigneeAvatar || null,
        priority: t.priority || 'medium',
        status: t.status || 'todo',
        dueDate: t.dueDate || null,
        loggedHours: t.loggedHours || 0,
        estimatedHours: t.estimatedHours || 1,
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
      });
    }
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const existing = sqlite.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    if (!existing) return null;
    const merged: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    sqlite.prepare(`
      UPDATE tasks SET
        title = @title,
        description = @description,
        projectId = @projectId,
        projectName = @projectName,
        priority = @priority,
        status = @status,
        dueDate = @dueDate,
        updatedAt = @updatedAt
      WHERE id = @id
    `).run({
      id: merged.id,
      title: merged.title,
      description: merged.description || '',
      projectId: merged.projectId || 'proj-1',
      projectName: merged.projectName || 'Personal Goals',
      priority: merged.priority || 'medium',
      status: merged.status || 'todo',
      dueDate: merged.dueDate || null,
      updatedAt: merged.updatedAt,
    });
    return merged;
  }

  public deleteTask(id: string): void {
    sqlite.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  // Goals / Projects
  public get projects(): Project[] {
    const rows = sqlite.prepare('SELECT * FROM projects').all() as any[];
    return rows.map((r) => ({
      ...r,
      milestones: r.milestones ? JSON.parse(r.milestones) : [],
    }));
  }

  public set projects(list: Project[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO projects (id, name, description, leadId, leadName, leadAvatar, department, health, progress, milestones)
      VALUES (@id, @name, @description, @leadId, @leadName, @leadAvatar, @department, @health, @progress, @milestones)
    `);
    for (const proj of list) {
      insert.run({
        ...proj,
        milestones: JSON.stringify(proj.milestones || []),
      });
    }
  }

  public deleteProject(id: string): void {
    sqlite.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const existing = sqlite.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (!existing) return null;
    const merged = {
      ...existing,
      ...updates,
      milestones: updates.milestones !== undefined ? updates.milestones : (existing.milestones ? JSON.parse(existing.milestones) : []),
    };
    sqlite.prepare(`
      UPDATE projects SET
        name = @name,
        description = @description,
        leadId = @leadId,
        leadName = @leadName,
        leadAvatar = @leadAvatar,
        department = @department,
        health = @health,
        progress = @progress,
        milestones = @milestones
      WHERE id = @id
    `).run({
      id: merged.id,
      name: merged.name,
      description: merged.description || '',
      leadId: merged.leadId || '',
      leadName: merged.leadName || '',
      leadAvatar: merged.leadAvatar || '',
      department: merged.department || 'General',
      health: merged.health || 'on_track',
      progress: merged.progress || 0,
      milestones: JSON.stringify(merged.milestones || []),
    });
    return merged;
  }

  // Personal Finances
  public get finances(): PersonalFinanceRecord[] {
    return sqlite.prepare('SELECT * FROM personal_finances ORDER BY rowid DESC').all() as PersonalFinanceRecord[];
  }

  public set finances(list: PersonalFinanceRecord[]) {
    this.bulkInsertFinances(list);
  }

  public deleteFinance(id: string): void {
    sqlite.prepare('DELETE FROM personal_finances WHERE id = ?').run(id);
  }

  public clearFinances(): void {
    sqlite.prepare('DELETE FROM personal_finances').run();
  }

  public bulkInsertFinances(list: PersonalFinanceRecord[]): void {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO personal_finances (id, type, amount, category, note, date)
      VALUES (@id, @type, @amount, @category, @note, @date)
    `);
    const transaction = sqlite.transaction((rows: PersonalFinanceRecord[]) => {
      for (const f of rows) {
        insert.run(f);
      }
    });
    transaction(list);
  }

  // Conversations & Messages
  public get conversations(): ChatConversation[] {
    const convRows = sqlite.prepare('SELECT * FROM conversations').all() as any[];
    const msgStmt = sqlite.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY rowid ASC');

    return convRows.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      email: c.email,
      phone: c.phone,
      isOnline: Boolean(c.isOnline),
      lastMessage: c.lastMessage,
      lastMessageTime: c.lastMessageTime,
      unreadCount: 0,
      isFavorite: false,
      type: 'direct' as const,
      memberIds: [c.id],
      messages: (msgStmt.all(c.id) as any[]).map((m) => ({
        id: m.id,
        conversationId: c.id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        content: m.content,
        timestamp: m.timestamp,
      })),
    }));
  }

  public set conversations(list: ChatConversation[]) {
    const insertConv = sqlite.prepare(`
      INSERT OR REPLACE INTO conversations (id, name, avatar, email, phone, isOnline, lastMessage, lastMessageTime)
      VALUES (@id, @name, @avatar, @email, @phone, @isOnline, @lastMessage, @lastMessageTime)
    `);
    const insertMsg = sqlite.prepare(`
      INSERT OR REPLACE INTO messages (id, conversationId, senderId, senderName, senderAvatar, content, timestamp)
      VALUES (@id, @conversationId, @senderId, @senderName, @senderAvatar, @content, @timestamp)
    `);

    for (const c of list) {
      insertConv.run({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        email: c.email,
        phone: c.phone,
        isOnline: c.isOnline ? 1 : 0,
        lastMessage: c.lastMessage,
        lastMessageTime: c.lastMessageTime,
      });

      for (const m of c.messages || []) {
        insertMsg.run({
          id: m.id,
          conversationId: c.id,
          senderId: m.senderId,
          senderName: m.senderName,
          senderAvatar: m.senderAvatar,
          content: m.content,
          timestamp: m.timestamp,
        });
      }
    }
  }

  // Realtime Events
  public get realtimeEvents(): any[] {
    const rows = sqlite.prepare('SELECT * FROM realtime_events ORDER BY rowid DESC LIMIT 50').all() as any[];
    return rows.map((r) => ({ ...r, read: Boolean(r.read) }));
  }

  public set realtimeEvents(list: any[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO realtime_events (id, type, title, description, timestamp, read, actorId, actorName, actorAvatar)
      VALUES (@id, @type, @title, @description, @timestamp, @read, @actorId, @actorName, @actorAvatar)
    `);
    for (const e of list) {
      insert.run({
        id: e.id,
        type: e.type || 'SYSTEM',
        title: e.title || '',
        description: e.description || e.message || '',
        timestamp: e.timestamp || 'Just now',
        read: e.read ? 1 : 0,
        actorId: e.actorId || null,
        actorName: e.actorName || null,
        actorAvatar: e.actorAvatar || null,
      });
    }
  }

  // Telegram Session Auth
  public getTelegramAuth(): {
    sessionString?: string;
    phone?: string;
    userId?: string;
    firstName?: string;
    username?: string;
    connectedAt?: string;
  } | null {
    const row = sqlite.prepare('SELECT * FROM telegram_auth WHERE id = 1').get() as any;
    if (!row || !row.sessionString) return null;
    return row;
  }

  public setTelegramAuth(data: {
    sessionString: string;
    phone?: string;
    userId?: string;
    firstName?: string;
    username?: string;
  }): void {
    const connectedAt = new Date().toISOString();
    sqlite.prepare(`
      INSERT OR REPLACE INTO telegram_auth (id, sessionString, phone, userId, firstName, username, connectedAt)
      VALUES (1, @sessionString, @phone, @userId, @firstName, @username, @connectedAt)
    `).run({
      sessionString: data.sessionString,
      phone: data.phone || '',
      userId: data.userId || '',
      firstName: data.firstName || '',
      username: data.username || '',
      connectedAt,
    });
  }

  public clearTelegramAuth(): void {
    sqlite.prepare('DELETE FROM telegram_auth WHERE id = 1').run();
  }

  // Calendar Events
  public get calendarEvents(): CalendarEvent[] {
    const rows = sqlite.prepare('SELECT * FROM calendar_events ORDER BY date ASC, time ASC').all() as any[];
    return rows.map((r) => ({
      ...r,
      isCompleted: Boolean(r.isCompleted),
    }));
  }

  public set calendarEvents(list: CalendarEvent[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO calendar_events (id, title, description, date, time, endTime, type, priority, isCompleted)
      VALUES (@id, @title, @description, @date, @time, @endTime, @type, @priority, @isCompleted)
    `);
    const transaction = sqlite.transaction((events: CalendarEvent[]) => {
      sqlite.prepare('DELETE FROM calendar_events').run();
      for (const e of events) {
        insert.run({
          id: e.id,
          title: e.title,
          description: e.description || '',
          date: e.date,
          time: e.time || '',
          endTime: e.endTime || '',
          type: e.type || 'task',
          priority: e.priority || 'medium',
          isCompleted: e.isCompleted ? 1 : 0,
        });
      }
    });
    transaction(list);
  }

  public addCalendarEvent(event: CalendarEvent): void {
    sqlite.prepare(`
      INSERT OR REPLACE INTO calendar_events (id, title, description, date, time, endTime, type, priority, isCompleted)
      VALUES (@id, @title, @description, @date, @time, @endTime, @type, @priority, @isCompleted)
    `).run({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      endTime: event.endTime || '',
      type: event.type || 'task',
      priority: event.priority || 'medium',
      isCompleted: event.isCompleted ? 1 : 0,
    });
  }

  public updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const existing = sqlite.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id) as any;
    if (!existing) return null;
    const merged: CalendarEvent = {
      ...existing,
      ...updates,
      isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : Boolean(existing.isCompleted),
    };
    sqlite.prepare(`
      UPDATE calendar_events SET
        title = @title,
        description = @description,
        date = @date,
        time = @time,
        endTime = @endTime,
        type = @type,
        priority = @priority,
        isCompleted = @isCompleted
      WHERE id = @id
    `).run({
      id: merged.id,
      title: merged.title,
      description: merged.description || '',
      date: merged.date,
      time: merged.time || '',
      endTime: merged.endTime || '',
      type: merged.type || 'task',
      priority: merged.priority || 'medium',
      isCompleted: merged.isCompleted ? 1 : 0,
    });
    return merged;
  }

  public toggleCalendarEvent(id: string): CalendarEvent | null {
    const row = sqlite.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id) as any;
    if (!row) return null;
    const next = row.isCompleted ? 0 : 1;
    sqlite.prepare('UPDATE calendar_events SET isCompleted = ? WHERE id = ?').run(next, id);
    return {
      ...row,
      isCompleted: next === 1,
    };
  }

  public deleteCalendarEvent(id: string): void {
    sqlite.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
  }

  // Market Buying Goals
  public get buyingGoals(): MarketBuyingGoal[] {
    const rows = sqlite.prepare('SELECT * FROM market_buying_goals ORDER BY createdAt DESC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      targetSpecs: r.targetSpecs || undefined,
      maxBudget: Number(r.maxBudget) || 0,
      minBudget: Number(r.minBudget) || 0,
      priority: r.priority || 'medium',
      linkedProjectId: r.linkedProjectId || undefined,
      justification: r.justification || undefined,
      status: r.status || 'active',
      createdAt: r.createdAt || new Date().toISOString(),
    }));
  }

  public set buyingGoals(goals: MarketBuyingGoal[]) {
    sqlite.transaction(() => {
      sqlite.prepare('DELETE FROM market_buying_goals').run();
      const insert = sqlite.prepare(`
        INSERT INTO market_buying_goals (id, title, category, targetSpecs, maxBudget, minBudget, priority, linkedProjectId, justification, status, createdAt)
        VALUES (@id, @title, @category, @targetSpecs, @maxBudget, @minBudget, @priority, @linkedProjectId, @justification, @status, @createdAt)
      `);
      for (const g of goals) {
        insert.run({
          id: g.id,
          title: g.title,
          category: g.category,
          targetSpecs: g.targetSpecs || null,
          maxBudget: g.maxBudget,
          minBudget: g.minBudget || 0,
          priority: g.priority || 'medium',
          linkedProjectId: g.linkedProjectId || null,
          justification: g.justification || null,
          status: g.status || 'active',
          createdAt: g.createdAt || new Date().toISOString(),
        });
      }
    })();
  }

  public addBuyingGoal(goal: MarketBuyingGoal): MarketBuyingGoal {
    const insert = sqlite.prepare(`
      INSERT INTO market_buying_goals (id, title, category, targetSpecs, maxBudget, minBudget, priority, linkedProjectId, justification, status, createdAt)
      VALUES (@id, @title, @category, @targetSpecs, @maxBudget, @minBudget, @priority, @linkedProjectId, @justification, @status, @createdAt)
    `);
    insert.run({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      targetSpecs: goal.targetSpecs || null,
      maxBudget: goal.maxBudget,
      minBudget: goal.minBudget || 0,
      priority: goal.priority || 'medium',
      linkedProjectId: goal.linkedProjectId || null,
      justification: goal.justification || null,
      status: goal.status || 'active',
      createdAt: goal.createdAt || new Date().toISOString(),
    });
    return goal;
  }

  public updateBuyingGoal(id: string, updates: Partial<MarketBuyingGoal>): MarketBuyingGoal | null {
    const existing = sqlite.prepare('SELECT * FROM market_buying_goals WHERE id = ?').get(id) as any;
    if (!existing) return null;
    const merged: MarketBuyingGoal = {
      ...existing,
      ...updates,
    };
    sqlite.prepare(`
      UPDATE market_buying_goals SET
        title = @title,
        category = @category,
        targetSpecs = @targetSpecs,
        maxBudget = @maxBudget,
        minBudget = @minBudget,
        priority = @priority,
        linkedProjectId = @linkedProjectId,
        justification = @justification,
        status = @status
      WHERE id = @id
    `).run({
      id,
      title: merged.title,
      category: merged.category,
      targetSpecs: merged.targetSpecs || null,
      maxBudget: merged.maxBudget,
      minBudget: merged.minBudget || 0,
      priority: merged.priority || 'medium',
      linkedProjectId: merged.linkedProjectId || null,
      justification: merged.justification || null,
      status: merged.status || 'active',
    });
    return merged;
  }

  public deleteBuyingGoal(id: string): void {
    sqlite.prepare('DELETE FROM market_buying_goals WHERE id = ?').run(id);
  }

  // Market Cached Deals
  public get cachedDeals(): any[] {
    const rows = sqlite.prepare('SELECT * FROM market_cached_deals ORDER BY createdAt DESC').all() as any[];
    return rows.map((r) => ({
      ...r,
      riskFactors: r.riskFactors ? JSON.parse(r.riskFactors) : [],
      images: r.images ? JSON.parse(r.images) : [],
    }));
  }

  public saveCachedDeal(deal: any): void {
    sqlite.prepare(`
      INSERT OR REPLACE INTO market_cached_deals (id, itemId, title, price, fairMarketValue, dealScore, goalScore, verdict, roiAnalysis, riskFactors, sellerPhone, sellerName, location, link, images, createdAt)
      VALUES (@id, @itemId, @title, @price, @fairMarketValue, @dealScore, @goalScore, @verdict, @roiAnalysis, @riskFactors, @sellerPhone, @sellerName, @location, @link, @images, @createdAt)
    `).run({
      id: deal.id || deal.itemId,
      itemId: deal.itemId,
      title: deal.title,
      price: deal.price,
      fairMarketValue: deal.fairMarketValue || null,
      dealScore: deal.dealScore || 0,
      goalScore: deal.goalScore || 0,
      verdict: deal.verdict || 'FAIR_PRICE',
      roiAnalysis: deal.roiAnalysis || '',
      riskFactors: JSON.stringify(deal.riskFactors || []),
      sellerPhone: deal.sellerPhone || null,
      sellerName: deal.sellerName || null,
      location: deal.location || null,
      link: deal.link || null,
      images: JSON.stringify(deal.images || []),
      createdAt: deal.createdAt || new Date().toISOString(),
    });
  }

  // Truncate
  public truncateAll(): void {
    sqlite.exec(`
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM tasks;
      DELETE FROM projects;
      DELETE FROM personal_finances;
      DELETE FROM calendar_events;
      DELETE FROM market_buying_goals;
      DELETE FROM market_cached_deals;
      DELETE FROM realtime_events;
      DELETE FROM users;
      DELETE FROM session_state;
      VACUUM;
    `);
  }
}

export const db = new PersistentDatabase();

// Seed initial foundational projects if empty
if (db.projects.length === 0) {
  db.projects = [
    {
      id: 'proj-epr',
      name: 'EPR Desktop & AI Copilot',
      description: 'Unified Enterprise Personal Resource platform with offline SQLite persistence, Telegram MTProto sync, and Gemini Copilot integration.',
      leadId: 'user-1',
      leadName: 'Dara Sovan',
      leadAvatar: '',
      department: 'Engineering',
      health: 'on_track',
      progress: 75,
      milestones: [
        { id: 'm-1', title: 'Architecture & SQLite Layer', dueDate: '2026-08-25', completed: true },
        { id: 'm-2', title: 'Telegram MTProto Real-time Sync', dueDate: '2026-08-26', completed: true },
        { id: 'm-3', title: 'Goals & AI Planning Workflow', dueDate: '2026-08-27', completed: true },
        { id: 'm-4', title: 'Production Packaging & Release', dueDate: '2026-09-05', completed: false },
      ],
    },
    {
      id: 'proj-garageapp',
      name: 'Garage & Pawn Management App',
      description: 'Production mobile management and tracking system with WebRTC P2P audio calling and CallKit integration.',
      leadId: 'user-1',
      leadName: 'Dara Sovan',
      leadAvatar: '',
      department: 'Mobile Development',
      health: 'on_track',
      progress: 65,
      milestones: [
        { id: 'm-g1', title: 'Pawn Survey & Contracts', dueDate: '2026-08-12', completed: true },
        { id: 'm-g2', title: 'CallKit & Lock Screen Wake Handling', dueDate: '2026-08-22', completed: true },
        { id: 'm-g3', title: 'Release Entitlements & UAT Deployment', dueDate: '2026-08-30', completed: false },
      ],
    },
    {
      id: 'proj-labo',
      name: 'Lab Extraction & Pipeline (Labo)',
      description: 'Automated data sync, laboratory parsing, and terminal UI database pipeline with retries and flexible formatting.',
      leadId: 'user-1',
      leadName: 'Dara Sovan',
      leadAvatar: '',
      department: 'Data Pipeline',
      health: 'on_track',
      progress: 90,
      milestones: [
        { id: 'm-l1', title: 'Initial Lab Extraction Script', dueDate: '2026-08-13', completed: true },
        { id: 'm-l2', title: 'Terminal UI & Database Sync', dueDate: '2026-08-14', completed: true },
        { id: 'm-l3', title: 'Automated Scheduled Extraction Cron', dueDate: '2026-09-01', completed: false },
      ],
    },
    {
      id: 'proj-personal',
      name: 'Personal Goals & Growth',
      description: 'Strategic life planning, fitness tracking, study goals, and financial budgeting.',
      leadId: 'user-1',
      leadName: 'Dara Sovan',
      leadAvatar: '',
      department: 'Personal Venture',
      health: 'on_track',
      progress: 45,
      milestones: [
        { id: 'm-p1', title: 'Daily Workout & Fitness Habit', dueDate: '2026-08-20', completed: true },
        { id: 'm-p2', title: 'Financial Budgeting & Expense Tracking', dueDate: '2026-08-25', completed: true },
        { id: 'm-p3', title: 'Advanced AI & Fullstack Mastery', dueDate: '2026-09-15', completed: false },
      ],
    },
  ];
}

// Seed initial buying goals if empty or reset
if (db.buyingGoals.length === 0 || db.buyingGoals.length <= 2) {
  db.buyingGoals = [
    {
      id: 'bg-1',
      title: 'Apple Silicon Workstation (M2/M3 Pro 32GB)',
      category: 'Computers & Laptops',
      targetSpecs: '>= 32GB RAM, Apple Silicon, 512GB+ SSD',
      maxBudget: 1350,
      minBudget: 900,
      priority: 'high',
      linkedProjectId: 'proj-epr',
      justification: 'Accelerates local AI Copilot embedding indexing, Electron builds, and React Native bundling.',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bg-2',
      title: 'Test Device for WebRTC & CallKit Testing',
      category: 'Phones & Tablets',
      targetSpecs: 'iOS 17+ or Google Pixel Android 14+ for background VoIP wake tests',
      maxBudget: 320,
      minBudget: 150,
      priority: 'urgent',
      linkedProjectId: 'proj-garageapp',
      justification: 'Critical test device to validate Garage App WebRTC P2P audio calling and lock screen CallKit notifications.',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bg-3',
      title: '24/7 Lab Extraction Mini Server / NUC',
      category: 'Computers & Laptops',
      targetSpecs: 'Low-power 16GB RAM Intel/AMD Mini PC or Raspberry Pi 5',
      maxBudget: 280,
      minBudget: 120,
      priority: 'medium',
      linkedProjectId: 'proj-labo',
      justification: 'Dedicated headless host for 24/7 cron data extraction pipeline, retry queues, and SQLite backups.',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bg-4',
      title: 'Ergonomic Dual-Motor Standing Desk',
      category: 'Office & Workstation',
      targetSpecs: 'Dual Motor, height memory presets, solid top >= 140cm',
      maxBudget: 240,
      minBudget: 140,
      priority: 'medium',
      linkedProjectId: 'proj-personal',
      justification: 'Supports long architecture and pair-programming sessions without posture fatigue.',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];
}

export { sqlite };
