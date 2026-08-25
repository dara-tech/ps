export type UserRole = 'Executive' | 'ProjectManager' | 'Employee';

export type EmployeeStatus = 'Online' | 'In Meeting' | 'Away' | 'On Leave' | 'Offline';

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

export type DepartmentType = 
  | 'Engineering' 
  | 'Product & Design' 
  | 'Human Resources' 
  | 'Finance & Legal' 
  | 'Marketing & Sales' 
  | 'Operations';

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
  code: string;
  description: string;
  department: DepartmentType;
  leadId: string;
  leadName: string;
  leadAvatar: string;
  budget: number;
  spent: number;
  startDate: string;
  targetDate: string;
  health: ProjectHealth;
  progress: number; // 0 - 100
  memberIds: string[];
  milestones: Milestone[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockInTime: string; // ISO or HH:mm
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
  month: string; // e.g. "August 2026"
  baseSalary: number;
  bonus: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: 'paid' | 'processing' | 'pending';
  paymentDate: string;
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
  entityType?: 'task' | 'project' | 'leave' | 'attendance' | 'announcement';
  priority?: 'normal' | 'high' | 'urgent';
  read: boolean;
}
