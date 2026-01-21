import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Skeleton,
  Avatar,
  AvatarGroup,
  Paper,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  WorkHistory as WorkHistoryIcon,
  AttachMoney as MoneyIcon,
  EventBusy as EventBusyIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assessment as ReportsIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Circle as CircleIcon,
  PendingActions as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  WatchLater as WatchIcon,
  Today as TodayIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components';
import { getSalaryStatusColor } from '@/types';
import { 
  mockAttendanceSummary, 
  mockSalarySlips, 
  mockDashboardStats,
  mockAdminAttendanceOverview,
  mockAdminSalaryOverview,
  mockLabMembers,
} from '@/services/mockData';

// Lab Member Dashboard Component
const LabMemberDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Use mock data instead of API calls
  const attendance = mockAttendanceSummary;
  const salarySlips = mockSalarySlips;
  const lastSalary = salarySlips[0];
  const attendanceLoading = false;
  const salaryLoading = false;

  const handleRefresh = () => {
    // No-op for demo mode
  };

  const currentDate = new Date();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's your attendance overview for {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Working Days"
            value={attendance?.workingDays || 0}
            subtitle={`of ${attendance?.totalDays || 0} total days`}
            icon={<CalendarIcon />}
            color="primary"
            loading={attendanceLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Full Days"
            value={attendance?.fullDays || 0}
            subtitle="Present full day"
            icon={<CheckCircleIcon />}
            color="success"
            loading={attendanceLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Half Days"
            value={attendance?.halfDays || 0}
            subtitle="Half day attendance"
            icon={<AccessTimeIcon />}
            color="warning"
            loading={attendanceLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="LOP Days"
            value={attendance?.lopDays || 0}
            subtitle="Loss of pay"
            icon={<EventBusyIcon />}
            color="error"
            loading={attendanceLoading}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Attendance Progress Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Attendance Overview"
              subheader={currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              action={
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/member/attendance')}
                  size="small"
                >
                  View Details
                </Button>
              }
            />
            <CardContent>
              {attendanceLoading ? (
                <Box>
                  <Skeleton height={80} />
                  <Skeleton height={80} />
                </Box>
              ) : (
                <Box>
                  {/* Progress Bar */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Attendance Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {attendance?.attendancePercentage?.toFixed(1) || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={attendance?.attendancePercentage || 0}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: `linear-gradient(90deg, #0066CC 0%, #00ADEF 100%)`,
                        },
                      }}
                    />
                  </Box>

                  {/* Attendance Breakdown */}
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(40, 167, 69, 0.08)' }}>
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {attendance?.fullDays || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Full Days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(255, 193, 7, 0.08)' }}>
                        <Typography variant="h5" fontWeight={700} color="warning.main">
                          {attendance?.halfDays || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Half Days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(220, 53, 69, 0.08)' }}>
                        <Typography variant="h5" fontWeight={700} color="error.main">
                          {attendance?.lopDays || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          LOP Days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(0, 102, 204, 0.08)' }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {attendance?.holidays || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Holidays
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Freeze Status */}
                  {attendance?.isFrozen && (
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(23, 162, 184, 0.08)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="info" fontSize="small" />
                      <Typography variant="body2" color="info.main">
                        Attendance for this month has been frozen on {new Date(attendance.frozenAt!).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Salary Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Latest Salary"
              subheader={lastSalary ? `${lastSalary.month}/${lastSalary.year}` : 'No salary data'}
              action={
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/member/salary-slips')}
                  size="small"
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {salaryLoading ? (
                <Box>
                  <Skeleton height={60} />
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                </Box>
              ) : lastSalary ? (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      ₹{lastSalary.netSalary.toLocaleString('en-IN')}
                    </Typography>
                    <Chip
                      label={lastSalary.status}
                      size="small"
                      color={getSalaryStatusColor(lastSalary.status)}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense disablePadding>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Base Salary" secondary={`₹${lastSalary.baseSalary.toLocaleString('en-IN')}`} />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Deductions"
                        secondary={
                          <Typography variant="body2" color="error.main">
                            -₹{lastSalary.totalDeductions.toLocaleString('en-IN')}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText primary="Days Worked" secondary={`${lastSalary.daysWorked} / ${lastSalary.totalWorkingDays}`} />
                    </ListItem>
                  </List>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => alert('Download feature (demo mode)')}
                    sx={{ mt: 2 }}
                  >
                    Download Slip
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MoneyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No salary slips available yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CalendarIcon />}
                    onClick={() => navigate('/member/attendance')}
                    sx={{ py: 2, justifyContent: 'flex-start' }}
                  >
                    View Attendance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/member/salary-slips')}
                    sx={{ py: 2, justifyContent: 'flex-start' }}
                  >
                    Salary Slips
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => alert('Download report feature (demo mode)')}
                    sx={{ py: 2, justifyContent: 'flex-start' }}
                  >
                    Download Report
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WorkHistoryIcon />}
                    onClick={() => navigate('/member/profile')}
                    sx={{ py: 2, justifyContent: 'flex-start' }}
                  >
                    My Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Use mock data
  const stats = {
    totalMembers: mockAdminAttendanceOverview.totalMembers,
    activeMembers: mockAdminAttendanceOverview.presentToday,
    absentToday: mockAdminAttendanceOverview.absentToday,
    onLeave: mockAdminAttendanceOverview.onLeave,
    pendingApprovals: mockAdminSalaryOverview.pendingApprovals,
    attendanceRate: mockAdminAttendanceOverview.attendanceRate,
    monthlyPayroll: mockAdminSalaryOverview.totalPayroll,
    paidThisMonth: mockAdminSalaryOverview.paidThisMonth,
    averageSalary: mockAdminSalaryOverview.averageSalary,
  };

  // Mock recent activities
  const recentActivities = [
    { id: 1, type: 'attendance', message: 'John Doe marked present', time: '2 mins ago', icon: <CheckCircleIcon color="success" /> },
    { id: 2, type: 'salary', message: 'Salary slip generated for Jane Smith', time: '15 mins ago', icon: <ReceiptIcon color="primary" /> },
    { id: 3, type: 'member', message: 'New member Alice Johnson added', time: '1 hour ago', icon: <PersonAddIcon color="info" /> },
    { id: 4, type: 'attendance', message: 'Bob Wilson marked half-day', time: '2 hours ago', icon: <AccessTimeIcon color="warning" /> },
    { id: 5, type: 'salary', message: 'Pending approval for 3 salary slips', time: '3 hours ago', icon: <PendingIcon color="warning" /> },
  ];

  // Mock upcoming tasks
  const upcomingTasks = [
    { id: 1, title: 'Review salary slips', dueDate: 'Today', priority: 'high', status: 'pending' },
    { id: 2, title: 'Freeze attendance for Dec', dueDate: 'Tomorrow', priority: 'medium', status: 'pending' },
    { id: 3, title: 'Generate monthly report', dueDate: 'In 3 days', priority: 'low', status: 'pending' },
  ];

  // Mock attendance trend data (last 7 days)
  const attendanceTrend = [85, 92, 88, 95, 80, 0, 0]; // Weekend zeros
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate trend
  const lastWeekRate = 82;
  const trendPercentage = stats.attendanceRate - lastWeekRate;
  const isTrendUp = trendPercentage >= 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? 'Good Morning' : currentDate.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Box>
      {/* Enhanced Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {greeting}, Admin! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening in your lab today, {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => {}} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            },
          }}
          onClick={() => navigate('/admin/members')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <PeopleIcon />
                </Avatar>
                <Chip 
                  label={`+2 this month`} 
                  size="small" 
                  sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="h3" fontWeight={700}>{stats.totalMembers}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Lab Members</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                <CircleIcon sx={{ fontSize: 8, color: '#4ade80' }} />
                <Typography variant="caption">{stats.activeMembers} active today</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            },
          }}
          onClick={() => navigate('/admin/attendance')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isTrendUp ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                  <Typography variant="caption">{isTrendUp ? '+' : ''}{trendPercentage.toFixed(1)}%</Typography>
                </Box>
              </Box>
              <Typography variant="h3" fontWeight={700}>{stats.attendanceRate}%</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Attendance Rate</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>vs last week: {lastWeekRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            },
          }}
          onClick={() => navigate('/admin/salary')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <PendingIcon />
                </Avatar>
                {stats.pendingApprovals > 0 && (
                  <Chip 
                    label="Action Required" 
                    size="small" 
                    sx={{ bgcolor: alpha('#fff', 0.3), color: 'white', fontSize: '0.65rem' }}
                  />
                )}
              </Box>
              <Typography variant="h3" fontWeight={700}>{stats.pendingApprovals}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Salary slips awaiting review</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            },
          }}
          onClick={() => navigate('/admin/salary')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
              <Typography variant="h3" fontWeight={700}>₹{(stats.monthlyPayroll / 1000).toFixed(0)}K</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Monthly Payroll</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Avg: ₹{stats.averageSalary.toLocaleString('en-IN')}/member</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Today's Attendance Overview */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TodayIcon color="primary" />
                  <Typography variant="h6">Today's Attendance Overview</Typography>
                </Box>
              }
              action={
                <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/attendance')}
                  size="small"
                >
                  Manage
                </Button>
              }
            />
            <CardContent>
              {/* Attendance Stats Row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                        <CheckCircleIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">{stats.activeMembers}</Typography>
                    <Typography variant="caption" color="text.secondary">Present</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.08), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                        <EventBusyIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="error.main">{stats.absentToday}</Typography>
                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.08), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                        <WatchIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{stats.onLeave}</Typography>
                    <Typography variant="caption" color="text.secondary">On Leave</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <PeopleIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">{stats.totalMembers}</Typography>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Weekly Trend Chart (simplified visual) */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Weekly Attendance Trend
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 100 }}>
                  {attendanceTrend.map((value, index) => (
                    <Tooltip key={index} title={`${weekDays[index]}: ${value}%`}>
                      <Box
                        sx={{
                          flex: 1,
                          height: `${value}%`,
                          bgcolor: value === 0 ? 'grey.300' : index === 4 ? 'primary.main' : alpha(theme.palette.primary.main, 0.5),
                          borderRadius: '4px 4px 0 0',
                          minHeight: 8,
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: value === 0 ? 'grey.400' : 'primary.dark',
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  {weekDays.map((day) => (
                    <Typography key={day} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
                      {day}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Active Members Avatars */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Members Present Today
                  </Typography>
                  <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                    {mockLabMembers.slice(0, 5).map((member) => (
                      <Tooltip key={member.id} title={member.name}>
                        <Avatar 
                          sx={{ 
                            bgcolor: `hsl(${member.name.charCodeAt(0) * 10}, 70%, 50%)`,
                            width: 36,
                            height: 36,
                          }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/admin/attendance')}
                  size="small"
                >
                  Mark Attendance
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Tasks / To-Do */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="h6">Upcoming Tasks</Typography>
                </Box>
              }
              subheader="Things that need your attention"
            />
            <CardContent sx={{ pt: 0 }}>
              <List disablePadding>
                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem 
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: alpha(theme.palette[getPriorityColor(task.priority) as 'error' | 'warning' | 'success'].main, 0.1),
                          }}
                        >
                          <CircleIcon 
                            sx={{ 
                              fontSize: 12, 
                              color: `${getPriorityColor(task.priority)}.main`,
                            }} 
                          />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">{task.dueDate}</Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        color={getPriorityColor(task.priority) as any}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                    </ListItem>
                    {index < upcomingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/salary')}
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNoteIcon color="primary" />
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
              }
              action={
                <IconButton size="small">
                  <MoreIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <List disablePadding>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.default' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">{activity.message}</Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Salary Status Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6">Salary Status</Typography>
                </Box>
              }
              subheader={`${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`}
              action={
                <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/admin/salary')}
                  size="small"
                >
                  Manage
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {/* Progress indicator */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Salary Processing Progress</Typography>
                  <Typography variant="body2" fontWeight={600}>{Math.round((stats.paidThisMonth / stats.totalMembers) * 100)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.paidThisMonth / stats.totalMembers) * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #0066CC 0%, #00ADEF 100%)',
                    },
                  }}
                />
              </Box>

              {/* Stats breakdown */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                    <ApprovedIcon color="success" sx={{ mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={700} color="success.main">{stats.paidThisMonth}</Typography>
                    <Typography variant="caption" color="text.secondary">Paid</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
                    <PendingIcon color="warning" sx={{ mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={700} color="warning.main">{stats.pendingApprovals}</Typography>
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                    <ScheduleIcon color="info" sx={{ mb: 0.5 }} />
                    <Typography variant="h5" fontWeight={700} color="info.main">{stats.totalMembers - stats.paidThisMonth - stats.pendingApprovals}</Typography>
                    <Typography variant="caption" color="text.secondary">Not Started</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<ReceiptIcon />}
                onClick={() => navigate('/admin/salary')}
                sx={{ mt: 3 }}
              >
                Generate Salary Slips
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardHeader 
          title="Quick Actions" 
          subheader="Frequently used actions for efficient management"
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/members')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <PersonAddIcon />
                <Typography variant="caption">Add Member</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/attendance')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <CalendarIcon />
                <Typography variant="caption">Attendance</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/salary')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <ReceiptIcon />
                <Typography variant="caption">Salary Slips</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/reports')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <ReportsIcon />
                <Typography variant="caption">Reports</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => alert('Download feature (demo mode)')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <DownloadIcon />
                <Typography variant="caption">Export Data</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/admin/members')}
                sx={{ 
                  py: 2.5, 
                  flexDirection: 'column', 
                  gap: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <PeopleIcon />
                <Typography variant="caption">All Members</Typography>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Super Admin Dashboard Component
const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Use mock data
  const stats = mockDashboardStats;
  const isLoading = false;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System-wide overview and management
          </Typography>
        </Box>
        <IconButton onClick={() => {}} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Labs"
            value={stats.totalLabs || 0}
            subtitle={`${stats.activeLabs || 0} active`}
            icon={<CalendarIcon />}
            color="primary"
            loading={isLoading}
            onClick={() => navigate('/super-admin/labs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalMembers || 0}
            subtitle={`${stats.activeMembers || 0} active`}
            icon={<WorkHistoryIcon />}
            color="secondary"
            loading={isLoading}
            onClick={() => navigate('/super-admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Payroll"
            value={`₹${(stats.totalPaidThisMonth || 0).toLocaleString('en-IN')}`}
            subtitle="All labs combined"
            icon={<MoneyIcon />}
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Salaries"
            value={stats.pendingSalaries || 0}
            subtitle="Awaiting approval"
            icon={<WarningIcon />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard Component - Role-based rendering
const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Not authenticated</Typography>
        <Typography color="text.secondary">Please log in to continue.</Typography>
      </Box>
    );
  }

  switch (user.role) {
    case 'LAB_MEMBER':
      return <LabMemberDashboard />;
    case 'LAB_ADMIN':
      return <AdminDashboard />;
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    default:
      return <LabMemberDashboard />;
  }
};

export default Dashboard;
