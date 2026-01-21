import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  RemoveCircle as HalfIcon,
  Event as EventIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { StatCard } from '@/components';
import {
  AttendanceRecord,
  AttendanceStatus,
  getStatusColor,
  getMonthOptions,
} from '@/types';
import { generateMockAttendanceRecords } from '@/services/mockData';

const AttendanceSummary: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const monthOptions = getMonthOptions();

  // Use mock data instead of API
  const attendance = useMemo(() => 
    generateMockAttendanceRecords(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  const isLoading = false;

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'FULL':
        return <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'HALF':
        return <HalfIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'LOP':
        return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'HOLIDAY':
        return <EventIcon sx={{ color: 'info.main', fontSize: 20 }} />;
      case 'WEEKEND':
        return <EventIcon sx={{ color: 'text.disabled', fontSize: 20 }} />;
      default:
        return undefined;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'FULL':
        return 'Full Day';
      case 'HALF':
        return 'Half Day';
      case 'LOP':
        return 'Loss of Pay';
      case 'HOLIDAY':
        return 'Holiday';
      case 'WEEKEND':
        return 'Weekend';
      default:
        return status;
    }
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days: (AttendanceRecord | null)[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendance?.records.find((r) => r.date === dateStr);
      days.push(record || {
        id: 0,
        labMemberId: 0,
        date: dateStr,
        status: new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6 ? 'WEEKEND' : 'LOP',
        createdAt: '',
        updatedAt: '',
      } as AttendanceRecord);
    }

    return days;
  };

  const calendarDays = generateCalendarGrid();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your daily attendance and view summaries
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Month Selector */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={`${selectedYear}-${selectedMonth}`}
              label="Month"
              onChange={(e) => handleMonthChange(e.target.value)}
            >
              {monthOptions.map((option) => (
                <MenuItem key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="calendar">
              <Tooltip title="Calendar View">
                <GridIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list">
              <Tooltip title="List View">
                <ListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Export Button */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => alert('Export feature (demo mode)')}
          >
            Export
          </Button>

          <Tooltip title="Refresh">
            <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Working Days"
            value={attendance?.summary.workingDays || 0}
            icon={<CalendarIcon />}
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Full Days"
            value={attendance?.summary.fullDays || 0}
            icon={<CheckIcon />}
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Half Days"
            value={attendance?.summary.halfDays || 0}
            icon={<HalfIcon />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="LOP Days"
            value={attendance?.summary.lopDays || 0}
            icon={<CancelIcon />}
            color="error"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Holidays"
            value={attendance?.summary.holidays || 0}
            icon={<EventIcon />}
            color="info"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            title="Attendance %"
            value={`${attendance?.summary.attendancePercentage?.toFixed(1) || 0}%`}
            icon={<CalendarIcon />}
            color="secondary"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Frozen Status Alert */}
      {attendance?.summary.isFrozen && (
        <Alert
          severity="info"
          icon={<LockIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
            <strong>Attendance Frozen:</strong> This month's attendance has been finalized on{' '}
            {new Date(attendance.summary.frozenAt!).toLocaleDateString()}
            {attendance.summary.frozenBy && ` by ${attendance.summary.frozenBy}`}
          </Typography>
        </Alert>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="h6">
                  {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            }
          />
          <CardContent>
            {isLoading ? (
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            ) : (
              <Box>
                {/* Week Headers */}
                <Grid container sx={{ mb: 1 }}>
                  {weekDays.map((day) => (
                    <Grid
                      item
                      xs={12 / 7}
                      key={day}
                      sx={{
                        textAlign: 'center',
                        py: 1,
                        fontWeight: 600,
                        color: day === 'Sun' || day === 'Sat' ? 'text.secondary' : 'text.primary',
                        fontSize: '0.75rem',
                      }}
                    >
                      {isMobile ? day.charAt(0) : day}
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Days */}
                <Grid container spacing={0.5}>
                  {calendarDays.map((record, index) => (
                    <Grid item xs={12 / 7} key={index}>
                      {record ? (
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="body2">
                                {new Date(record.date).toLocaleDateString('default', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </Typography>
                              <Typography variant="caption">{getStatusLabel(record.status)}</Typography>
                              {record.remarks && (
                                <Typography variant="caption" display="block">
                                  Note: {record.remarks}
                                </Typography>
                              )}
                            </Box>
                          }
                          arrow
                        >
                          <Box
                            sx={{
                              aspectRatio: '1',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              bgcolor:
                                record.status === 'FULL'
                                  ? 'rgba(40, 167, 69, 0.12)'
                                  : record.status === 'HALF'
                                  ? 'rgba(255, 193, 7, 0.12)'
                                  : record.status === 'LOP'
                                  ? 'rgba(220, 53, 69, 0.12)'
                                  : record.status === 'HOLIDAY'
                                  ? 'rgba(23, 162, 184, 0.12)'
                                  : 'rgba(0, 0, 0, 0.04)',
                              border: '1px solid',
                              borderColor:
                                record.status === 'FULL'
                                  ? 'success.light'
                                  : record.status === 'HALF'
                                  ? 'warning.light'
                                  : record.status === 'LOP'
                                  ? 'error.light'
                                  : record.status === 'HOLIDAY'
                                  ? 'info.light'
                                  : 'divider',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: 1,
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color:
                                  record.status === 'WEEKEND'
                                    ? 'text.disabled'
                                    : 'text.primary',
                              }}
                            >
                              {new Date(record.date).getDate()}
                            </Typography>
                            {!isMobile && getStatusIcon(record.status)}
                          </Box>
                        </Tooltip>
                      ) : (
                        <Box sx={{ aspectRatio: '1' }} />
                      )}
                    </Grid>
                  ))}
                </Grid>

                {/* Legend */}
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                  }}
                >
                  {[
                    { status: 'FULL' as AttendanceStatus, label: 'Full Day' },
                    { status: 'HALF' as AttendanceStatus, label: 'Half Day' },
                    { status: 'LOP' as AttendanceStatus, label: 'LOP' },
                    { status: 'HOLIDAY' as AttendanceStatus, label: 'Holiday' },
                    { status: 'WEEKEND' as AttendanceStatus, label: 'Weekend' },
                  ].map(({ status, label }) => (
                    <Box
                      key={status}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {getStatusIcon(status)}
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListIcon color="primary" />
                <Typography variant="h6">Attendance Records</Typography>
              </Box>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Marked By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : attendance?.records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        No attendance records for this month
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance?.records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(record.date).toLocaleDateString('default', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(record.date).toLocaleDateString('default', { weekday: 'long' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(record.status)}
                            label={getStatusLabel(record.status)}
                            size="small"
                            color={getStatusColor(record.status)}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {record.remarks || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {record.markedByName || 'System'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default AttendanceSummary;
