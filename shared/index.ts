export type UserRole = 'Executive' | 'ProjectManager' | 'Employee';

export type EmployeeStatus = 'Online' | 'In Meeting' | 'Away' | 'On Leave' | 'Offline';

export type DepartmentType = 
  | 'Personal'
  | 'Engineering' 
  | 'Product & Design' 
  | 'Human Resources' 
  | 'Finance & Legal' 
  | 'Marketing & Sales' 
  | 'Operations';

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  department: DepartmentType;
  userRole: UserRole;
  status: EmployeeStatus;
  joinedDate: string;
  salary: number;
  location: string;
  performanceRating: number;
  currentProjectIds: string[];
  activeTaskCount: number;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  commentsCount: number;
}

export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  description: string;
  department?: DepartmentType | string;
  leadId?: string;
  leadName?: string;
  leadAvatar?: string;
  budget?: number;
  spent?: number;
  startDate?: string;
  targetDate?: string;
  health: ProjectHealth;
  progress: number;
  memberIds?: string[];
  milestones?: Milestone[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  totalMinutes?: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  location: 'Office - HQ' | 'Remote - Home' | 'Client Site';
}

export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Maternity/Paternity' | 'Unpaid Leave';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: DepartmentType;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: ApprovalStatus;
  appliedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: 'paid' | 'processing' | 'pending';
  paymentDate: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // e.g. "10:02 AM"
  isOwn?: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  email?: string;
  isOnline: boolean;
  statusText?: string; // e.g. "1 Note"
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isFavorite: boolean;
  isClosed?: boolean;
  type: 'direct' | 'group';
  memberIds: string[];
  messages: ChatMessage[];
}

export type RealtimeEventType = 
  | 'TASK_STATUS_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_CREATED'
  | 'LEAVE_REQUESTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'ATTENDANCE_CLOCK_IN'
  | 'ATTENDANCE_CLOCK_OUT'
  | 'PROJECT_MILESTONE_COMPLETED'
  | 'ANNOUNCEMENT'
  | 'CHAT_MESSAGE_RECEIVED'
  | 'LIVE_HEARTBEAT';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'task' | 'project' | 'leave' | 'attendance' | 'announcement' | 'chat';
  priority?: 'normal' | 'high' | 'urgent';
  read: boolean;
}

// Personal OS Types
export interface PersonalFinanceRecord {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  milestones: Array<{ id: string; title: string; completed: boolean }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "09:30 AM"
  endTime?: string; // e.g. "10:30 AM"
  type: 'task' | 'meeting' | 'milestone' | 'reminder';
  priority?: TaskPriority;
  isCompleted?: boolean;
}

export interface Khmer24Seller {
  name?: string;
  username?: string;
  photo?: string;
  registered?: string;
  verified?: boolean;
}

export interface MarketItem {
  id: string;
  title: string;
  price: number | string;
  postedDate?: string;
  description?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  googleMaps?: string;
  category?: string;
  seller?: Khmer24Seller;
  phone?: string[];
  images?: string[];
  link?: string;
  brand?: string;
  model?: string;
  year?: string;
  condition?: string;
  bodyType?: string;
  engineType?: string;
  color?: string;
  taxType?: string;
  transmission?: string;
  // Computed / Evaluated Fields
  fairMarketValue?: number;
  dealScore?: number; // 0 - 100
  goalScore?: number; // 0 - 100
  verdict?: 'STRONG_BUY' | 'GOOD_DEAL' | 'FAIR_PRICE' | 'OVERPRICED' | 'HIGH_RISK';
}

export interface MarketBuyingGoal {
  id: string;
  title: string;
  category: string;
  targetSpecs?: string;
  maxBudget: number;
  minBudget?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  linkedProjectId?: string;
  justification?: string;
  status: 'active' | 'paused' | 'fulfilled';
  createdAt?: string;
}

export interface DealEvaluation {
  itemId: string;
  itemTitle: string;
  askingPrice: number;
  estimatedFairMarketValue: number;
  savingsUSD: number;
  dealScore: number; // 0 - 100
  goalAlignmentScore: number; // 0 - 100
  verdict: 'STRONG_BUY' | 'GOOD_DEAL' | 'FAIR_PRICE' | 'OVERPRICED' | 'HIGH_RISK';
  roiAnalysis: string;
  riskFactors: string[];
  suggestedOfferPrice: number;
  khmerNegotiationScript: string;
  englishNegotiationScript: string;
}


