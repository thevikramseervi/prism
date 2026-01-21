// ============================================
// Attend Ease - TypeScript Type Definitions
// Samsung SEED Labs Enterprise Application
// ============================================

// User & Authentication Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  labId?: number;
  labName?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'LAB_MEMBER' | 'LAB_ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// Attendance Types
export type AttendanceStatus = 'FULL' | 'HALF' | 'LOP' | 'HOLIDAY' | 'WEEKEND';

export interface AttendanceRecord {
  id: number;
  labMemberId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy?: number;
  markedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalDays: number;
  workingDays: number;
  fullDays: number;
  halfDays: number;
  lopDays: number;
  holidays: number;
  effectiveWorkingDays: number;
  attendancePercentage: number;
  isFrozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
}

export interface MonthlyAttendance {
  summary: AttendanceSummary;
  records: AttendanceRecord[];
}

// Salary Types
export interface SalaryConfig {
  id: number;
  labId: number;
  baseAmount: number;
  halfDayDeduction: number;
  lopDeduction: number;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

export interface SalarySlip {
  id: number;
  labMemberId: number;
  labMemberName: string;
  month: number;
  year: number;
  baseSalary: number;
  totalWorkingDays: number;
  daysWorked: number;
  fullDays: number;
  halfDays: number;
  lopDays: number;
  halfDayDeductions: number;
  lopDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: SalarySlipStatus;
  generatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  remarks?: string;
}

export type SalarySlipStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'DISPUTED';

// Lab Types
export interface Lab {
  id: number;
  name: string;
  code: string;
  description?: string;
  adminId?: number;
  adminName?: string;
  memberCount: number;
  status: LabStatus;
  createdAt: string;
  updatedAt: string;
}

export type LabStatus = 'ACTIVE' | 'INACTIVE';

export interface LabMember {
  id: number;
  userId: number;
  labId: number;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  endDate?: string;
  status: UserStatus;
  role: UserRole;
  baseSalary: number;
}

// Dashboard Types
export interface DashboardStats {
  // Lab Member Stats
  currentMonthAttendance?: AttendanceSummary;
  lastMonthSalary?: SalarySlip;
  pendingSalarySlips?: number;
  
  // Admin Stats
  totalMembers?: number;
  activeMembers?: number;
  pendingApprovals?: number;
  monthlyPayroll?: number;
  attendanceRate?: number;
  
  // Super Admin Stats
  totalLabs?: number;
  activeLabs?: number;
  totalUsers?: number;
  monthlyRevenue?: number;
  totalPaidThisMonth?: number;
  pendingSalaries?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}

// Form Types
export interface AttendanceFormData {
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  labId?: number;
  baseSalary?: number;
}

// Filter & Sort Types
export interface AttendanceFilter {
  month?: number;
  year?: number;
  status?: AttendanceStatus;
  memberId?: number;
}

export interface SalaryFilter {
  month?: number;
  year?: number;
  status?: SalarySlipStatus;
  memberId?: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Export Format Types
export type ExportFormat = 'pdf' | 'xlsx' | 'csv';

// Audit Types
export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue?: string;
  newValue?: string;
  performedBy: number;
  performedByName: string;
  performedAt: string;
  ipAddress?: string;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

// Month/Year Selection
export interface MonthYear {
  month: number;
  year: number;
  label: string;
}

// Helper function to get month options
export const getMonthOptions = (): MonthYear[] => {
  const months: MonthYear[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
    });
  }
  
  return months;
};

// Status color mapping
export const getStatusColor = (status: AttendanceStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'FULL':
      return 'success';
    case 'HALF':
      return 'warning';
    case 'LOP':
      return 'error';
    case 'HOLIDAY':
      return 'info';
    case 'WEEKEND':
      return 'default';
    default:
      return 'default';
  }
};

export const getSalaryStatusColor = (status: SalarySlipStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'APPROVED':
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'DISPUTED':
      return 'error';
    case 'DRAFT':
      return 'default';
    default:
      return 'default';
  }
};
