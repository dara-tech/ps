import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { 
  Task, 
  Project, 
  PersonalFinanceRecord, 
  ChatConversation, 
  ChatMessage,
  RealtimeEvent
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
`);

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
      INSERT OR REPLACE INTO tasks (id, title, description, projectId, projectName, assigneeId, assigneeName, assigneeAvatar, priority, status, loggedHours, estimatedHours, createdAt, updatedAt)
      VALUES (@id, @title, @description, @projectId, @projectName, @assigneeId, @assigneeName, @assigneeAvatar, @priority, @status, @loggedHours, @estimatedHours, @createdAt, @updatedAt)
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
        loggedHours: t.loggedHours || 0,
        estimatedHours: t.estimatedHours || 1,
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
      });
    }
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

  // Personal Finances
  public get finances(): PersonalFinanceRecord[] {
    return sqlite.prepare('SELECT * FROM personal_finances ORDER BY date DESC, rowid DESC').all() as PersonalFinanceRecord[];
  }

  public set finances(list: PersonalFinanceRecord[]) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO personal_finances (id, type, amount, category, note, date)
      VALUES (@id, @type, @amount, @category, @note, @date)
    `);
    for (const f of list) {
      insert.run(f);
    }
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

  // Truncate
  public truncateAll(): void {
    sqlite.exec(`
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM tasks;
      DELETE FROM projects;
      DELETE FROM personal_finances;
      DELETE FROM realtime_events;
      DELETE FROM users;
      DELETE FROM session_state;
      VACUUM;
    `);
  }
}

export const db = new PersistentDatabase();
export { sqlite };
