import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Visibility as PreviewIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { StatCard } from '@/components';
import { mockLabMembers } from '@/services/mockData';

// Report types
interface ReportItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  formats: readonly string[];
  category: 'attendance' | 'salary' | 'member' | 'analytics';
  lastGenerated?: string;
  frequency?: string;
}

interface ScheduledReport {
  id: number;
  reportId: number;
  reportTitle: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: string;
  recipients: string[];
  nextRun: string;
  isActive: boolean;
  lastRun?: string;
  lastStatus?: 'success' | 'failed';
}

// Mock data for reports
const reportsList: ReportItem[] = [
  {
    id: 1,
    title: 'Monthly Attendance Report',
    description: 'Complete attendance summary for all lab members including daily breakdown',
    icon: <CalendarIcon />,
    formats: ['xlsx', 'pdf', 'csv'],
    category: 'attendance',
    lastGenerated: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: 'Salary Report',
    description: 'Detailed salary breakdown, deductions, and payroll summary',
    icon: <ReceiptIcon />,
    formats: ['xlsx', 'pdf'],
    category: 'salary',
    lastGenerated: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    title: 'Member-wise Attendance',
    description: 'Individual attendance reports for each lab member',
    icon: <PersonIcon />,
    formats: ['xlsx', 'pdf', 'csv'],
    category: 'attendance',
    lastGenerated: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 4,
    title: 'Attendance Trends',
    description: 'Monthly and quarterly attendance trends with visualizations',
    icon: <TrendingIcon />,
    formats: ['xlsx', 'pdf'],
    category: 'analytics',
  },
  {
    id: 5,
    title: 'Payroll Summary',
    description: 'Consolidated payroll report with tax deductions and net amounts',
    icon: <MoneyIcon />,
    formats: ['xlsx', 'pdf'],
    category: 'salary',
    lastGenerated: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 6,
    title: 'Member Directory',
    description: 'Complete directory of all lab members with contact information',
    icon: <GroupIcon />,
    formats: ['xlsx', 'pdf', 'csv'],
    category: 'member',
  },
  {
    id: 7,
    title: 'Lab Performance Report',
    description: 'Overall lab performance metrics and KPIs',
    icon: <AssessmentIcon />,
    formats: ['xlsx', 'pdf'],
    category: 'analytics',
  },
  {
    id: 8,
    title: 'Leave Summary Report',
    description: 'Summary of leaves, half-days, and LOP for all members',
    icon: <DateRangeIcon />,
    formats: ['xlsx', 'pdf', 'csv'],
    category: 'attendance',
  },
];

const scheduledReports: ScheduledReport[] = [
  {
    id: 1,
    reportId: 1,
    reportTitle: 'Monthly Attendance Report',
    frequency: 'monthly',
    format: 'pdf',
    recipients: ['admin@seedlabs.com', 'hr@seedlabs.com'],
    nextRun: new Date(Date.now() + 86400000 * 15).toISOString(),
    isActive: true,
    lastRun: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastStatus: 'success',
  },
  {
    id: 2,
    reportId: 2,
    reportTitle: 'Salary Report',
    frequency: 'monthly',
    format: 'xlsx',
    recipients: ['finance@seedlabs.com'],
    nextRun: new Date(Date.now() + 86400000 * 20).toISOString(),
    isActive: true,
    lastRun: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastStatus: 'success',
  },
  {
    id: 3,
    reportId: 4,
    reportTitle: 'Attendance Trends',
    frequency: 'weekly',
    format: 'pdf',
    recipients: ['manager@seedlabs.com'],
    nextRun: new Date(Date.now() + 86400000 * 3).toISOString(),
    isActive: false,
    lastRun: new Date(Date.now() - 86400000 * 14).toISOString(),
    lastStatus: 'failed',
  },
];

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf',
    recipients: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter reports by category
  const filteredReports = categoryFilter === 'all' 
    ? reportsList 
    : reportsList.filter(r => r.category === categoryFilter);

  const handlePreview = (report: ReportItem) => {
    setSelectedReport(report);
    setPreviewDialogOpen(true);
  };

  const handleDownload = (report: ReportItem, format?: string) => {
    setSelectedReport(report);
    if (format) {
      // Direct download
      setIsGenerating(true);
      setGenerationStep(0);
      const interval = setInterval(() => {
        setGenerationStep(prev => {
          if (prev >= 3) {
            clearInterval(interval);
            setIsGenerating(false);
            setSnackbar({ open: true, message: `${report.title} downloaded as ${format.toUpperCase()}`, severity: 'success' });
            return 0;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      setDownloadDialogOpen(true);
    }
  };

  const handleScheduleReport = (report: ReportItem) => {
    setSelectedReport(report);
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    setSnackbar({ open: true, message: 'Report scheduled successfully!', severity: 'success' });
    setScheduleDialogOpen(false);
    setScheduleForm({ frequency: 'monthly', format: 'pdf', recipients: '' });
  };

  const handleToggleSchedule = (_scheduleId: number) => {
    setSnackbar({ open: true, message: 'Schedule updated', severity: 'info' });
  };

  const handleDeleteSchedule = (_scheduleId: number) => {
    setSnackbar({ open: true, message: 'Scheduled report deleted', severity: 'info' });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'xlsx': return <ExcelIcon color="success" />;
      case 'csv': return <CsvIcon color="primary" />;
      default: return <DownloadIcon />;
    }
  };

  const getCategoryColor = (category: string): 'primary' | 'success' | 'warning' | 'info' => {
    switch (category) {
      case 'attendance': return 'primary';
      case 'salary': return 'success';
      case 'member': return 'warning';
      case 'analytics': return 'info';
      default: return 'primary';
    }
  };

  // Report Preview Dialog
  const PreviewDialog = () => {
    if (!selectedReport) return null;

    // Mock preview data
    const previewData = mockLabMembers.slice(0, 5);

    return (
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedReport.icon}</Avatar>
            <Box>
              <Typography variant="h6">{selectedReport.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Preview - {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setPreviewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a preview of the first 5 records. Download the full report for complete data.
          </Alert>

          {/* Date Range Info */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip 
              icon={<DateRangeIcon />} 
              label={`From: ${new Date(dateRange.startDate).toLocaleDateString()}`} 
              variant="outlined" 
            />
            <Chip 
              icon={<DateRangeIcon />} 
              label={`To: ${new Date(dateRange.endDate).toLocaleDateString()}`} 
              variant="outlined" 
            />
          </Box>

          {/* Preview Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Member</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Full Days</TableCell>
                  <TableCell align="center">Half Days</TableCell>
                  <TableCell align="center">LOP</TableCell>
                  <TableCell align="right">Base Salary</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{member.name.charAt(0)}</Avatar>
                        {member.name}
                      </Box>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell align="center">{Math.floor(Math.random() * 5) + 17}</TableCell>
                    <TableCell align="center">{Math.floor(Math.random() * 3)}</TableCell>
                    <TableCell align="center">{Math.floor(Math.random() * 2)}</TableCell>
                    <TableCell align="right">₹{member.baseSalary.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="center">
                      <Chip label={member.status} size="small" color={member.status === 'ACTIVE' ? 'success' : 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Showing 5 of {mockLabMembers.length} records
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<ScheduleIcon />}
            onClick={() => { setPreviewDialogOpen(false); handleScheduleReport(selectedReport); }}
          >
            Schedule
          </Button>
          {selectedReport.formats.map(format => (
            <Button 
              key={format}
              variant="contained" 
              startIcon={getFormatIcon(format)}
              onClick={() => { setPreviewDialogOpen(false); handleDownload(selectedReport, format); }}
            >
              Download {format.toUpperCase()}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    );
  };

  // Download Dialog with Date Range
  const DownloadDialog = () => {
    if (!selectedReport) return null;

    return (
      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Download Report</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedReport.icon}</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{selectedReport.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedReport.description}</Typography>
            </Box>
          </Box>

          <Typography variant="subtitle2" gutterBottom>Select Date Range</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>Select Format</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {selectedReport.formats.map(format => (
              <Button
                key={format}
                variant="outlined"
                size="large"
                startIcon={getFormatIcon(format)}
                onClick={() => { setDownloadDialogOpen(false); handleDownload(selectedReport, format); }}
                sx={{ flex: 1, minWidth: 100 }}
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </Box>

          {isGenerating && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Generating report...</Typography>
              <Stepper activeStep={generationStep}>
                <Step><StepLabel>Fetching data</StepLabel></Step>
                <Step><StepLabel>Processing</StepLabel></Step>
                <Step><StepLabel>Generating file</StepLabel></Step>
                <Step><StepLabel>Complete</StepLabel></Step>
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Schedule Report Dialog
  const ScheduleDialog = () => {
    if (!selectedReport) return null;

    return (
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedReport.icon}</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{selectedReport.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Automatically generate and send this report
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={scheduleForm.frequency}
                  label="Frequency"
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value as any })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly (Every Monday)</MenuItem>
                  <MenuItem value="monthly">Monthly (1st of month)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={scheduleForm.format}
                  label="Format"
                  onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })}
                >
                  {selectedReport.formats.map(format => (
                    <MenuItem key={format} value={format}>{format.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipients (comma-separated emails)"
                value={scheduleForm.recipients}
                onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })}
                placeholder="admin@example.com, hr@example.com"
                helperText="Reports will be sent to these email addresses"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Next scheduled run: {scheduleForm.frequency === 'daily' ? 'Tomorrow' : 
                                scheduleForm.frequency === 'weekly' ? 'Next Monday' : 
                                '1st of next month'}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSchedule} startIcon={<ScheduleIcon />}>
            Schedule Report
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate, schedule, and download attendance and salary reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton 
              sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
              onClick={() => setSnackbar({ open: true, message: 'Reports refreshed', severity: 'info' })}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reports"
            value={reportsList.length}
            icon={<AssessmentIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled"
            value={scheduledReports.filter(s => s.isActive).length}
            subtitle="Active schedules"
            icon={<ScheduleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Generated Today"
            value={3}
            icon={<DownloadIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={scheduledReports.filter(s => s.lastStatus === 'failed').length}
            subtitle="Failed schedules"
            icon={<ErrorIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={(_, v) => setTabValue(v)} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Reports" icon={<AssessmentIcon />} iconPosition="start" />
        <Tab label="Scheduled Reports" icon={<ScheduleIcon />} iconPosition="start" />
        <Tab label="Report History" icon={<HistoryIcon />} iconPosition="start" />
      </Tabs>

      {/* All Reports Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Category Filter */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {['all', 'attendance', 'salary', 'member', 'analytics'].map(category => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setCategoryFilter(category)}
                color={categoryFilter === category ? 'primary' : 'default'}
                variant={categoryFilter === category ? 'filled' : 'outlined'}
              />
            ))}
          </Box>

          {/* Reports Grid */}
          <Grid container spacing={3}>
            {filteredReports.map((report) => (
              <Grid item xs={12} md={6} lg={4} key={report.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: `${getCategoryColor(report.category)}.light` }}>
                        <Box sx={{ color: `${getCategoryColor(report.category)}.main` }}>
                          {report.icon}
                        </Box>
                      </Avatar>
                    }
                    title={report.title}
                    subheader={
                      <Box>
                        <Chip 
                          label={report.category} 
                          size="small" 
                          color={getCategoryColor(report.category)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                    action={
                      <Tooltip title="Preview Report">
                        <IconButton onClick={() => handlePreview(report)}>
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {report.description}
                    </Typography>
                    {report.lastGenerated && (
                      <Typography variant="caption" color="text.secondary">
                        Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {report.formats.map((format) => (
                        <Tooltip key={format} title={`Download ${format.toUpperCase()}`}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownload(report, format)}
                          >
                            {getFormatIcon(format)}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                    <Button 
                      size="small" 
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleScheduleReport(report)}
                    >
                      Schedule
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Scheduled Reports Tab */}
      {tabValue === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Scheduled reports are automatically generated and sent to specified email addresses.
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Last Status</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledReports.map((schedule) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{schedule.reportTitle}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={schedule.frequency} 
                        size="small" 
                        variant="outlined"
                        color={schedule.frequency === 'daily' ? 'error' : schedule.frequency === 'weekly' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{getFormatIcon(schedule.format)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {schedule.recipients.map((email, idx) => (
                          <Chip key={idx} label={email} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(schedule.nextRun).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {schedule.lastStatus === 'success' ? (
                        <Chip icon={<SuccessIcon />} label="Success" size="small" color="success" />
                      ) : (
                        <Chip icon={<ErrorIcon />} label="Failed" size="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch 
                        checked={schedule.isActive} 
                        onChange={() => handleToggleSchedule(schedule.id)}
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Run Now">
                          <IconButton size="small" color="primary">
                            <RunIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(schedule.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Report History Tab */}
      {tabValue === 2 && (
        <Box>
          <List>
            {[...Array(10)].map((_, index) => {
              const report = reportsList[index % reportsList.length];
              const date = new Date(Date.now() - 86400000 * index * 2);
              const isSuccess = Math.random() > 0.2;

              return (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: isSuccess ? 'success.light' : 'error.light' }}>
                        {isSuccess ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={report.title}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption">{date.toLocaleString()}</Typography>
                          <Chip label="PDF" size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            Generated by Admin User
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Download">
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      )}

      {/* Dialogs */}
      <PreviewDialog />
      <DownloadDialog />
      <ScheduleDialog />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
