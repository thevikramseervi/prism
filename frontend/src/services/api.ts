import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LoginRequest, LoginResponse, User, MonthlyAttendance, AttendanceSummary, SalarySlip, DashboardStats, Lab, LabMember, PaginatedResponse, ApiError, ExportFormat } from '@/types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Authentication API
// ============================================
export const authApi = {
  login: async (credentials: LoginRequest): Promise<any> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return data;
  },
};

// ============================================
// Lab Member API (For logged-in lab members)
// ============================================
export const labMemberApi = {
  // Get my profile
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/lab-members/me');
    return data;
  },

  // Get my attendance for a specific month
  getMyAttendance: async (year: number, month: number): Promise<MonthlyAttendance> => {
    const { data } = await api.get<MonthlyAttendance>(`/lab-members/me/attendance/${year}/${month}`);
    return data;
  },

  // Get my attendance summary for a month
  getMyAttendanceSummary: async (year: number, month: number): Promise<AttendanceSummary> => {
    const { data } = await api.get<AttendanceSummary>(`/lab-members/me/attendance/${year}/${month}/summary`);
    return data;
  },

  // Get my salary slip
  getMySalarySlip: async (year: number, month: number): Promise<SalarySlip> => {
    const { data } = await api.get<SalarySlip>(`/lab-members/me/salary-slip/${year}/${month}`);
    return data;
  },

  // Get all my salary slips
  getMySalarySlips: async (year?: number): Promise<SalarySlip[]> => {
    const params = year ? { year } : {};
    const { data } = await api.get<SalarySlip[]>('/lab-members/me/salary-slips', { params });
    return data;
  },

  // Get my dashboard stats
  getMyDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/lab-members/me/dashboard');
    return data;
  },

  // Download salary slip
  downloadSalarySlip: (year: number, month: number, format: ExportFormat = 'pdf'): string => {
    const token = localStorage.getItem('token');
    return `/api/lab-members/me/salary-slip/${year}/${month}/download?format=${format}&token=${token}`;
  },

  // Download attendance report
  downloadAttendanceReport: (year: number, month: number, format: ExportFormat = 'pdf'): string => {
    const token = localStorage.getItem('token');
    return `/api/lab-members/me/attendance/${year}/${month}/download?format=${format}&token=${token}`;
  },
};

// ============================================
// Admin API (For Lab Admin)
// ============================================
export const adminApi = {
  // Get admin dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard');
    return data;
  },

  // Lab Members Management
  getLabMembers: async (page = 0, size = 20): Promise<PaginatedResponse<LabMember>> => {
    const { data } = await api.get<PaginatedResponse<LabMember>>('/admin/lab-members', {
      params: { page, size },
    });
    return data;
  },

  getLabMember: async (id: number): Promise<LabMember> => {
    const { data } = await api.get<LabMember>(`/admin/lab-members/${id}`);
    return data;
  },

  // Attendance Management
  getMemberAttendance: async (memberId: number, year: number, month: number): Promise<MonthlyAttendance> => {
    const { data } = await api.get<MonthlyAttendance>(`/admin/lab-members/${memberId}/attendance/${year}/${month}`);
    return data;
  },

  updateAttendance: async (memberId: number, date: string, status: string, remarks?: string): Promise<void> => {
    await api.put(`/admin/lab-members/${memberId}/attendance/${date}`, { status, remarks });
  },

  bulkUpdateAttendance: async (memberId: number, records: { date: string; status: string }[]): Promise<void> => {
    await api.post(`/admin/lab-members/${memberId}/attendance/bulk`, { records });
  },

  // Monthly Freeze
  freezeMonth: async (year: number, month: number): Promise<void> => {
    await api.post(`/admin/attendance/freeze/${year}/${month}`);
  },

  unfreezeMonth: async (year: number, month: number): Promise<void> => {
    await api.post(`/admin/attendance/unfreeze/${year}/${month}`);
  },

  // Salary Management
  generateSalarySlips: async (year: number, month: number): Promise<void> => {
    await api.post(`/admin/salary/generate/${year}/${month}`);
  },

  getMemberSalarySlip: async (memberId: number, year: number, month: number): Promise<SalarySlip> => {
    const { data } = await api.get<SalarySlip>(`/admin/lab-members/${memberId}/salary-slip/${year}/${month}`);
    return data;
  },

  approveSalarySlip: async (salarySlipId: number): Promise<void> => {
    await api.post(`/admin/salary/${salarySlipId}/approve`);
  },

  // Reports & Exports
  downloadMonthlyReport: (year: number, month: number, format: ExportFormat = 'xlsx'): string => {
    const token = localStorage.getItem('token');
    return `/api/admin/reports/monthly/${year}/${month}?format=${format}&token=${token}`;
  },

  downloadAttendanceSheet: (year: number, month: number, format: ExportFormat = 'xlsx'): string => {
    const token = localStorage.getItem('token');
    return `/api/admin/reports/attendance/${year}/${month}?format=${format}&token=${token}`;
  },
};

// ============================================
// Super Admin API
// ============================================
export const superAdminApi = {
  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/super-admin/dashboard');
    return data;
  },

  // Labs Management
  getLabs: async (page = 0, size = 20): Promise<PaginatedResponse<Lab>> => {
    const { data } = await api.get<PaginatedResponse<Lab>>('/super-admin/labs', {
      params: { page, size },
    });
    return data;
  },

  createLab: async (lab: Partial<Lab>): Promise<Lab> => {
    const { data } = await api.post<Lab>('/super-admin/labs', lab);
    return data;
  },

  updateLab: async (id: number, lab: Partial<Lab>): Promise<Lab> => {
    const { data } = await api.put<Lab>(`/super-admin/labs/${id}`, lab);
    return data;
  },

  deleteLab: async (id: number): Promise<void> => {
    await api.delete(`/super-admin/labs/${id}`);
  },

  // Users Management
  getUsers: async (page = 0, size = 20): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>('/super-admin/users', {
      params: { page, size },
    });
    return data;
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const { data } = await api.post<User>('/super-admin/users', user);
    return data;
  },

  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>(`/super-admin/users/${id}`, user);
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/super-admin/users/${id}`);
  },
};

export default api;
