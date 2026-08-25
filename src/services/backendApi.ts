import { 
  Employee, 
  Project, 
  Task, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  ChatConversation, 
  ChatMessage, 
  RealtimeEvent, 
  UserRole, 
  TaskStatus, 
  EmployeeStatus 
} from '../../shared';

const BACKEND_URL = 'http://localhost:4000/api/v1';
const WS_URL = 'ws://localhost:4000/ws';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const backendApi = {
  // Auth & Persona
  getMe: () => request<{ user: Employee; currentRole: UserRole }>('/auth/me'),
  switchRole: (role: UserRole) => request<{ user: Employee; currentRole: UserRole }>('/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role }),
  }),
  switchUser: (userId: string) => request<{ user: Employee; currentRole: UserRole }>('/auth/switch-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),

  // Employees
  getEmployees: () => request<Employee[]>('/employees'),
  updateStatus: (id: string, status: EmployeeStatus) => request<Employee>(`/employees/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  // Tasks
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (data: Partial<Task>) => request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTaskStatus: (id: string, status: TaskStatus) => request<Task>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteTask: (id: string) => request<{ success: boolean }>(`/tasks/${id}`, {
    method: 'DELETE',
  }),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: Partial<Project>) => request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleMilestone: (projectId: string, milestoneId: string) => request<Project>(`/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'PATCH',
  }),

  // Attendance
  getAttendance: () => request<AttendanceRecord[]>('/attendance'),
  clockIn: (location?: string) => request<AttendanceRecord>('/attendance/clock-in', {
    method: 'POST',
    body: JSON.stringify({ location }),
  }),
  clockOut: () => request<{ success: boolean; clockOutTime: string }>('/attendance/clock-out', {
    method: 'POST',
  }),

  // Leaves
  getLeaves: () => request<LeaveRequest[]>('/leaves'),
  submitLeave: (data: Partial<LeaveRequest>) => request<LeaveRequest>('/leaves', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approveLeave: (id: string) => request<LeaveRequest>(`/leaves/${id}/approve`, {
    method: 'POST',
  }),
  rejectLeave: (id: string, reason?: string) => request<LeaveRequest>(`/leaves/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  // Chats (Matching Screenshot)
  getConversations: () => request<ChatConversation[]>('/chats'),
  sendMessage: (conversationId: string, content: string) => request<ChatMessage>(`/chats/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Realtime Events
  getRealtimeEvents: () => request<RealtimeEvent[]>('/realtime/events'),
  triggerSimulation: () => request<{ event: RealtimeEvent }>('/realtime/simulate', {
    method: 'POST',
  }),
  getPayroll: () => request<PayrollRecord[]>('/payroll'),
};

// WebSocket Real-Time Subscriber
export class DesktopWsClient {
  private static instance: DesktopWsClient;
  private ws: WebSocket | null = null;
  private listeners: Set<(payload: any) => void> = new Set();
  private timer: any = null;

  public static getInstance(): DesktopWsClient {
    if (!DesktopWsClient.instance) {
      DesktopWsClient.instance = new DesktopWsClient();
    }
    return DesktopWsClient.instance;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('⚡ [RN WebSocket] Connected to backend WebSocket server');
        if (this.timer) clearTimeout(this.timer);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.listeners.forEach(l => l(payload));
        } catch (err) {
          console.error('[RN WebSocket] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.timer = setTimeout(() => this.connect(), 4000);
      };
    } catch (err) {
      console.warn('[RN WebSocket] Connection failed, will retry in 4s');
      this.timer = setTimeout(() => this.connect(), 4000);
    }
  }

  public subscribe(listener: (payload: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const rnWsClient = DesktopWsClient.getInstance();
