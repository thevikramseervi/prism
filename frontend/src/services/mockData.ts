// Mock Data for Frontend Demo (No Backend Required)

import { 
  AttendanceSummary, 
  AttendanceRecord,
  MonthlyAttendance, 
  SalarySlip, 
  Lab, 
  LabMember, 
  User,
  DashboardStats,
  AttendanceStatus,
} from '@/types';

// Helper function to generate dates
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// ============================================
// Mock Attendance Data
// ============================================
export const generateMockAttendanceRecords = (year: number, month: number): MonthlyAttendance => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const records: AttendanceRecord[] = [];
  
  let fullDays = 0;
  let halfDays = 0;
  let lopDays = 0;
  let holidays = 0;
  let weekends = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    let status: AttendanceStatus;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'WEEKEND';
      weekends++;
    } else if (day === 15 || day === 26) {
      status = 'HOLIDAY';
      holidays++;
    } else if (day % 7 === 0) {
      status = 'HALF';
      halfDays++;
    } else if (day % 11 === 0) {
      status = 'LOP';
      lopDays++;
    } else {
      status = 'FULL';
      fullDays++;
    }
    
    records.push({
      id: day,
      labMemberId: 1,
      date: date.toISOString().split('T')[0],
      status,
      remarks: status === 'HOLIDAY' ? 'Public Holiday' : undefined,
      createdAt: getDateString(0),
      updatedAt: getDateString(0),
    });
  }
  
  const workingDays = daysInMonth - weekends - holidays;
  const effectiveWorkingDays = fullDays + (halfDays * 0.5);
  
  return {
    summary: {
      year,
      month,
      totalDays: daysInMonth,
      workingDays,
      fullDays,
      halfDays,
      lopDays,
      holidays,
      effectiveWorkingDays,
      attendancePercentage: (effectiveWorkingDays / workingDays) * 100,
      isFrozen: month < new Date().getMonth() + 1,
      frozenAt: month < new Date().getMonth() + 1 ? getDateString(5) : undefined,
    },
    records,
  };
};

export const mockAttendanceSummary: AttendanceSummary = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  totalDays: 30,
  workingDays: 22,
  fullDays: 18,
  halfDays: 2,
  lopDays: 1,
  holidays: 1,
  effectiveWorkingDays: 19,
  attendancePercentage: 86.36,
  isFrozen: false,
};

// ============================================
// Mock Salary Data
// ============================================
export const mockSalarySlips: SalarySlip[] = [
  {
    id: 1,
    labMemberId: 1,
    labMemberName: 'John Doe',
    month: 12,
    year: 2025,
    baseSalary: 50000,
    totalWorkingDays: 22,
    daysWorked: 20,
    fullDays: 18,
    halfDays: 2,
    lopDays: 2,
    halfDayDeductions: 2273,
    lopDeductions: 4545,
    totalDeductions: 6818,
    netSalary: 43182,
    status: 'PAID',
    generatedAt: getDateString(10),
    approvedAt: getDateString(5),
    approvedBy: 'Jane Smith',
  },
  {
    id: 2,
    labMemberId: 1,
    labMemberName: 'John Doe',
    month: 11,
    year: 2025,
    baseSalary: 50000,
    totalWorkingDays: 21,
    daysWorked: 21,
    fullDays: 21,
    halfDays: 0,
    lopDays: 0,
    halfDayDeductions: 0,
    lopDeductions: 0,
    totalDeductions: 0,
    netSalary: 50000,
    status: 'PAID',
    generatedAt: getDateString(40),
    approvedAt: getDateString(35),
    approvedBy: 'Jane Smith',
  },
  {
    id: 3,
    labMemberId: 1,
    labMemberName: 'John Doe',
    month: 10,
    year: 2025,
    baseSalary: 50000,
    totalWorkingDays: 23,
    daysWorked: 22,
    fullDays: 20,
    halfDays: 2,
    lopDays: 1,
    halfDayDeductions: 2174,
    lopDeductions: 2174,
    totalDeductions: 4348,
    netSalary: 45652,
    status: 'PAID',
    generatedAt: getDateString(70),
    approvedAt: getDateString(65),
    approvedBy: 'Jane Smith',
  },
];

export const mockCurrentSalary: SalarySlip = {
  id: 4,
  labMemberId: 1,
  labMemberName: 'John Doe',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  baseSalary: 50000,
  totalWorkingDays: 22,
  daysWorked: 19,
  fullDays: 17,
  halfDays: 2,
  lopDays: 1,
  halfDayDeductions: 2273,
  lopDeductions: 2273,
  totalDeductions: 4546,
  netSalary: 45454,
  status: 'PENDING',
  generatedAt: getDateString(1),
};

// ============================================
// Mock Lab Members Data
// ============================================
export const mockLabMembers: LabMember[] = [
  {
    id: 1,
    userId: 1,
    labId: 1,
    name: 'John Doe',
    email: 'john.doe@seedlabs.com',
    phone: '+91 98765 43210',
    joinDate: '2024-01-15',
    status: 'ACTIVE',
    role: 'LAB_MEMBER',
    baseSalary: 50000,
  },
  {
    id: 2,
    userId: 2,
    labId: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@seedlabs.com',
    phone: '+91 98765 43211',
    joinDate: '2024-02-01',
    status: 'ACTIVE',
    role: 'LAB_MEMBER',
    baseSalary: 45000,
  },
  {
    id: 3,
    userId: 3,
    labId: 1,
    name: 'Bob Williams',
    email: 'bob.williams@seedlabs.com',
    phone: '+91 98765 43212',
    joinDate: '2024-03-10',
    status: 'ACTIVE',
    role: 'LAB_MEMBER',
    baseSalary: 48000,
  },
  {
    id: 4,
    userId: 4,
    labId: 1,
    name: 'Carol Davis',
    email: 'carol.davis@seedlabs.com',
    phone: '+91 98765 43213',
    joinDate: '2024-04-05',
    status: 'ACTIVE',
    role: 'LAB_MEMBER',
    baseSalary: 52000,
  },
  {
    id: 5,
    userId: 5,
    labId: 1,
    name: 'David Brown',
    email: 'david.brown@seedlabs.com',
    joinDate: '2024-05-20',
    endDate: '2025-11-30',
    status: 'INACTIVE',
    role: 'LAB_MEMBER',
    baseSalary: 40000,
  },
];

// ============================================
// Mock Labs Data
// ============================================
export const mockLabs: Lab[] = [
  {
    id: 1,
    name: 'AI Research Lab',
    code: 'AI-001',
    description: 'Artificial Intelligence and Machine Learning Research',
    adminId: 2,
    adminName: 'Jane Smith',
    memberCount: 5,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'IoT Development Lab',
    code: 'IOT-002',
    description: 'Internet of Things and Embedded Systems',
    adminId: 6,
    adminName: 'Mike Wilson',
    memberCount: 8,
    status: 'ACTIVE',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
  {
    id: 3,
    name: 'Security Research Lab',
    code: 'SEC-003',
    description: 'Cybersecurity and Privacy Research',
    adminId: 7,
    adminName: 'Sarah Lee',
    memberCount: 4,
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 4,
    name: 'Data Analytics Lab',
    code: 'DATA-004',
    description: 'Big Data and Analytics Research',
    memberCount: 0,
    status: 'INACTIVE',
    createdAt: '2024-04-10T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
];

// ============================================
// Mock Users Data (for Super Admin)
// ============================================
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'john.doe@seedlabs.com',
    name: 'John Doe',
    role: 'LAB_MEMBER',
    labId: 1,
    labName: 'AI Research Lab',
    status: 'ACTIVE',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 2,
    email: 'jane.smith@seedlabs.com',
    name: 'Jane Smith',
    role: 'LAB_ADMIN',
    labId: 1,
    labName: 'AI Research Lab',
    status: 'ACTIVE',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 3,
    email: 'admin@seedlabs.com',
    name: 'Admin User',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    email: 'alice.johnson@seedlabs.com',
    name: 'Alice Johnson',
    role: 'LAB_MEMBER',
    labId: 1,
    labName: 'AI Research Lab',
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 5,
    email: 'bob.williams@seedlabs.com',
    name: 'Bob Williams',
    role: 'LAB_MEMBER',
    labId: 1,
    labName: 'AI Research Lab',
    status: 'ACTIVE',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 6,
    email: 'mike.wilson@seedlabs.com',
    name: 'Mike Wilson',
    role: 'LAB_ADMIN',
    labId: 2,
    labName: 'IoT Development Lab',
    status: 'ACTIVE',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 7,
    email: 'sarah.lee@seedlabs.com',
    name: 'Sarah Lee',
    role: 'LAB_ADMIN',
    labId: 3,
    labName: 'Security Research Lab',
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

// ============================================
// Mock Dashboard Stats
// ============================================
export const mockDashboardStats: DashboardStats = {
  totalMembers: 17,
  activeMembers: 15,
  totalLabs: 4,
  activeLabs: 3,
  pendingSalaries: 12,
  totalPaidThisMonth: 485000,
};

// ============================================
// Mock Admin Dashboard Data
// ============================================
export const mockAdminAttendanceOverview = {
  totalMembers: 5,
  presentToday: 4,
  absentToday: 1,
  onLeave: 0,
  attendanceRate: 80,
};

export const mockAdminSalaryOverview = {
  totalPayroll: 245000,
  pendingApprovals: 3,
  paidThisMonth: 2,
  averageSalary: 49000,
};
