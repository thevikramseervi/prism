import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Skeleton,
  TextField,
  InputAdornment,
  Avatar,
  LinearProgress,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  PendingActions as PendingIcon,
  Paid as PaidIcon,
  Report as DisputeIcon,
  Print as PrintIcon,
  CalendarMonth as CalendarIcon,
  HourglassEmpty as ProcessingIcon,
} from '@mui/icons-material';
import { StatCard } from '@/components';
import { getMonthOptions, SalarySlipStatus } from '@/types';
import { mockLabMembers } from '@/services/mockData';

// Generate salary data for each member
const generateSalaryData = () => {
  return mockLabMembers.map(member => ({
    id: member.id,
    memberId: member.id,
    memberName: member.name,
    email: member.email,
    baseSalary: member.baseSalary,
    fullDays: Math.floor(Math.random() * 5) + 17,
    halfDays: Math.floor(Math.random() * 3),
    lopDays: Math.floor(Math.random() * 2),
    halfDayDeduction: Math.floor(member.baseSalary / 22 / 2) * Math.floor(Math.random() * 3),
    lopDeduction: Math.floor(member.baseSalary / 22) * Math.floor(Math.random() * 2),
    otherDeductions: Math.floor(Math.random() * 500),
    bonus: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0,
    status: ['PENDING', 'APPROVED', 'PAID', 'DISPUTED'][Math.floor(Math.random() * 4)] as SalarySlipStatus,
    generatedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
    approvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() : undefined,
    approvedBy: Math.random() > 0.5 ? 'Admin User' : undefined,
    remarks: '',
  }));
};

const SalaryManagement: React.FC = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateStep, setGenerateStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSlips, setSelectedSlips] = useState<number[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const monthOptions = getMonthOptions();
  const salaryData = useMemo(() => generateSalaryData(), []);

  // Calculate net salary for each slip
  const processedSalaryData = useMemo(() => {
    return salaryData.map(slip => ({
      ...slip,
      totalDeductions: slip.halfDayDeduction + slip.lopDeduction + slip.otherDeductions,
      netSalary: slip.baseSalary - slip.halfDayDeduction - slip.lopDeduction - slip.otherDeductions + slip.bonus,
    }));
  }, [salaryData]);

  // Filter salary slips
  const filteredSlips = useMemo(() => {
    return processedSalaryData.filter(slip => {
      const matchesSearch = slip.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           slip.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || slip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedSalaryData, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = processedSalaryData.reduce((acc, s) => acc + s.netSalary, 0);
    const approved = processedSalaryData.filter(s => s.status === 'APPROVED' || s.status === 'PAID').length;
    const pending = processedSalaryData.filter(s => s.status === 'PENDING').length;
    const disputed = processedSalaryData.filter(s => s.status === 'DISPUTED').length;
    return { total, approved, pending, disputed };
  }, [processedSalaryData]);

  const isLoading = false;

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleGenerateSlips = () => {
    setIsGenerating(true);
    // Simulate generation progress
    const steps = [0, 1, 2, 3];
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setGenerateStep(currentStep);
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsGenerating(false);
        setGenerateDialogOpen(false);
        setGenerateStep(0);
        setSnackbar({ open: true, message: 'Salary slips generated successfully!', severity: 'success' });
      }
    }, 1000);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSlips(filteredSlips.map(s => s.id));
    } else {
      setSelectedSlips([]);
    }
  };

  const handleSelectSlip = (slipId: number) => {
    setSelectedSlips(prev => 
      prev.includes(slipId) 
        ? prev.filter(id => id !== slipId)
        : [...prev, slipId]
    );
  };

  const handleBatchApprove = () => {
    setApprovalDialogOpen(true);
  };

  const handleApproveSlips = () => {
    setSnackbar({ open: true, message: `${selectedSlips.length} salary slips approved!`, severity: 'success' });
    setSelectedSlips([]);
    setApprovalDialogOpen(false);
  };

  const handleViewSlip = (slip: any) => {
    setSelectedSlip(slip);
    setViewDialogOpen(true);
  };

  const handleOpenDispute = (slip: any) => {
    setSelectedSlip(slip);
    setDisputeDialogOpen(true);
  };

  const handleSubmitDispute = () => {
    setSnackbar({ open: true, message: 'Dispute submitted successfully', severity: 'warning' });
    setDisputeDialogOpen(false);
  };

  const getStatusIcon = (status: SalarySlipStatus) => {
    switch (status) {
      case 'APPROVED': return <ApproveIcon fontSize="small" />;
      case 'PAID': return <PaidIcon fontSize="small" />;
      case 'PENDING': return <PendingIcon fontSize="small" />;
      case 'DISPUTED': return <DisputeIcon fontSize="small" />;
      default: return <ProcessingIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: SalarySlipStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PAID': return 'info';
      case 'PENDING': return 'warning';
      case 'DISPUTED': return 'error';
      default: return 'default';
    }
  };

  // Salary Breakdown Preview Component
  const SalaryBreakdown = ({ slip }: { slip: any }) => (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Earnings</Typography>
          <List dense disablePadding>
            <ListItem disablePadding>
              <ListItemText primary="Base Salary" secondary={`₹${slip.baseSalary.toLocaleString('en-IN')}`} />
            </ListItem>
            {slip.bonus > 0 && (
              <ListItem disablePadding>
                <ListItemText 
                  primary="Bonus" 
                  secondary={<Typography color="success.main">+₹{slip.bonus.toLocaleString('en-IN')}</Typography>} 
                />
              </ListItem>
            )}
          </List>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Deductions</Typography>
          <List dense disablePadding>
            <ListItem disablePadding>
              <ListItemText 
                primary="Half Day" 
                secondary={<Typography color="error.main">-₹{slip.halfDayDeduction.toLocaleString('en-IN')}</Typography>} 
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText 
                primary="LOP" 
                secondary={<Typography color="error.main">-₹{slip.lopDeduction.toLocaleString('en-IN')}</Typography>} 
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText 
                primary="Other" 
                secondary={<Typography color="error.main">-₹{slip.otherDeductions.toLocaleString('en-IN')}</Typography>} 
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>Net Salary</Typography>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              ₹{slip.netSalary.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // View Slip Dialog
  const ViewSlipDialog = () => {
    if (!selectedSlip) return null;

    return (
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedSlip.memberName.charAt(0)}</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{selectedSlip.memberName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Salary Slip - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Chip 
            icon={getStatusIcon(selectedSlip.status)}
            label={selectedSlip.status} 
            color={getStatusColor(selectedSlip.status)}
          />
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="Salary Details" />
            <Tab label="Attendance" />
            <Tab label="History" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Salary Breakdown
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mb: 2 }}>
                        <Typography variant="caption" color="success.dark">Total Earnings</Typography>
                        <Typography variant="h5" color="success.dark">
                          ₹{(selectedSlip.baseSalary + selectedSlip.bonus).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Base Salary" />
                          <ListItemSecondaryAction>
                            <Typography>₹{selectedSlip.baseSalary.toLocaleString('en-IN')}</Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {selectedSlip.bonus > 0 && (
                          <ListItem>
                            <ListItemText primary="Bonus" />
                            <ListItemSecondaryAction>
                              <Typography color="success.main">+₹{selectedSlip.bonus.toLocaleString('en-IN')}</Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, mb: 2 }}>
                        <Typography variant="caption" color="error.dark">Total Deductions</Typography>
                        <Typography variant="h5" color="error.dark">
                          ₹{selectedSlip.totalDeductions.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemText primary={`Half Day (${selectedSlip.halfDays} days)`} />
                          <ListItemSecondaryAction>
                            <Typography color="error.main">-₹{selectedSlip.halfDayDeduction.toLocaleString('en-IN')}</Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary={`LOP (${selectedSlip.lopDays} days)`} />
                          <ListItemSecondaryAction>
                            <Typography color="error.main">-₹{selectedSlip.lopDeduction.toLocaleString('en-IN')}</Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Other Deductions" />
                          <ListItemSecondaryAction>
                            <Typography color="error.main">-₹{selectedSlip.otherDeductions.toLocaleString('en-IN')}</Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary.dark">Net Salary</Typography>
                    <Typography variant="h4" color="primary.dark" fontWeight={700}>
                      ₹{selectedSlip.netSalary.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {selectedSlip.approvedBy && (
                <Alert severity="success" icon={<ApproveIcon />}>
                  Approved by {selectedSlip.approvedBy} on {new Date(selectedSlip.approvedAt).toLocaleString()}
                </Alert>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h3" color="success.dark">{selectedSlip.fullDays}</Typography>
                    <Typography variant="body2" color="success.dark">Full Days</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="h3" color="warning.dark">{selectedSlip.halfDays}</Typography>
                    <Typography variant="body2" color="warning.dark">Half Days</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'error.light', borderRadius: 2 }}>
                    <Typography variant="h3" color="error.dark">{selectedSlip.lopDays}</Typography>
                    <Typography variant="body2" color="error.dark">LOP Days</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Attendance Rate</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round((selectedSlip.fullDays + selectedSlip.halfDays * 0.5) / 22 * 100)} 
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    color="success"
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round((selectedSlip.fullDays + selectedSlip.halfDays * 0.5) / 22 * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Showing salary history for the last 6 months
              </Alert>
              <List>
                {[...Array(6)].map((_, index) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() - index);
                  return (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <CalendarIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        secondary={index === 0 ? 'Current' : 'Paid'}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" fontWeight={500}>
                          ₹{(selectedSlip.baseSalary - Math.floor(Math.random() * 5000)).toLocaleString('en-IN')}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button startIcon={<PrintIcon />} variant="outlined">Print</Button>
          <Button startIcon={<DownloadIcon />} variant="outlined">Download PDF</Button>
          {selectedSlip.status === 'PENDING' && (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<ApproveIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                setSnackbar({ open: true, message: 'Salary slip approved!', severity: 'success' });
              }}
            >
              Approve
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // Generate Slips Dialog with Progress
  const GenerateSlipsDialog = () => (
    <Dialog open={generateDialogOpen} onClose={() => !isGenerating && setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Salary Slips</DialogTitle>
      <DialogContent dividers>
        {!isGenerating ? (
          <>
            <Typography gutterBottom>
              Generate salary slips for all members for{' '}
              <strong>
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </strong>
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              This will calculate salaries based on attendance records. Make sure attendance is frozen before generating slips.
            </Alert>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Members</Typography>
                  <Typography variant="h6">{processedSalaryData.length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Estimated Payroll</Typography>
                  <Typography variant="h6">₹{stats.total.toLocaleString('en-IN')}</Typography>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <Box>
            <Stepper activeStep={generateStep} orientation="vertical">
              <Step>
                <StepLabel>Fetching attendance data</StepLabel>
                <StepContent>
                  <LinearProgress />
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Calculating deductions</StepLabel>
                <StepContent>
                  <LinearProgress />
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Generating salary slips</StepLabel>
                <StepContent>
                  <LinearProgress />
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Finalizing</StepLabel>
                <StepContent>
                  <LinearProgress />
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setGenerateDialogOpen(false)} disabled={isGenerating}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleGenerateSlips}
          disabled={isGenerating}
          startIcon={isGenerating ? <ProcessingIcon /> : <CalculateIcon />}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Dispute Dialog
  const DisputeDialog = () => (
    <Dialog open={disputeDialogOpen} onClose={() => setDisputeDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Raise Dispute</DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Submit a dispute for review. The HR team will investigate and respond within 3-5 business days.
        </Alert>
        <TextField
          fullWidth
          label="Dispute Reason"
          multiline
          rows={4}
          placeholder="Please describe the issue with this salary slip..."
          sx={{ mt: 2 }}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Dispute Category</InputLabel>
          <Select label="Dispute Category" defaultValue="">
            <MenuItem value="attendance">Attendance Discrepancy</MenuItem>
            <MenuItem value="deduction">Incorrect Deduction</MenuItem>
            <MenuItem value="bonus">Missing Bonus</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDisputeDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={handleSubmitDispute}>
          Submit Dispute
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Batch Approval Dialog
  const ApprovalDialog = () => (
    <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Batch Approval</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          You are about to approve {selectedSlips.length} salary slips
        </Alert>
        <Typography variant="subtitle2" gutterBottom>Selected Members:</Typography>
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {selectedSlips.map(id => {
            const slip = processedSalaryData.find(s => s.id === id);
            return slip ? (
              <ListItem key={id}>
                <ListItemIcon>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{slip.memberName.charAt(0)}</Avatar>
                </ListItemIcon>
                <ListItemText primary={slip.memberName} secondary={`₹${slip.netSalary.toLocaleString('en-IN')}`} />
              </ListItem>
            ) : null;
          })}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Total Amount</Typography>
          <Typography variant="h6" color="primary.main">
            ₹{selectedSlips.reduce((acc, id) => {
              const slip = processedSalaryData.find(s => s.id === id);
              return acc + (slip?.netSalary || 0);
            }, 0).toLocaleString('en-IN')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleApproveSlips} startIcon={<ApproveIcon />}>
          Approve All
        </Button>
      </DialogActions>
    </Dialog>
  );

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
            Salary Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate, approve, and manage salary slips with batch workflows
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Generate Slips
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setSnackbar({ open: true, message: 'Exporting salary report...', severity: 'info' })}
          >
            Export Report
          </Button>

          <Tooltip title="Refresh">
            <IconButton 
              sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
              onClick={() => setSnackbar({ open: true, message: 'Data refreshed', severity: 'info' })}
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
            title="Total Payroll"
            value={`₹${(stats.total / 100000).toFixed(1)}L`}
            subtitle={`${processedSalaryData.length} members`}
            icon={<MoneyIcon />}
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved/Paid"
            value={stats.approved}
            subtitle={`${Math.round(stats.approved / processedSalaryData.length * 100)}% complete`}
            icon={<ApproveIcon />}
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approval"
            value={stats.pending}
            subtitle="Awaiting review"
            icon={<PendingIcon />}
            color="warning"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Disputed"
            value={stats.disputed}
            subtitle="Requires attention"
            icon={<DisputeIcon />}
            color="error"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="DISPUTED">Disputed</MenuItem>
              </Select>
            </FormControl>
            {selectedSlips.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={`${selectedSlips.length} selected`} 
                  onDelete={() => setSelectedSlips([])}
                  color="primary"
                />
                <Button 
                  size="small" 
                  variant="contained" 
                  color="success" 
                  startIcon={<ApproveIcon />}
                  onClick={handleBatchApprove}
                >
                  Batch Approve
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Salary Slips Table */}
      <Card>
        <CardHeader
          title="Salary Slips"
          subheader={`${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} • ${filteredSlips.length} slips`}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedSlips.length > 0 && selectedSlips.length < filteredSlips.length}
                    checked={filteredSlips.length > 0 && selectedSlips.length === filteredSlips.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Member</TableCell>
                <TableCell align="right">Base Salary</TableCell>
                <TableCell align="right">Deductions</TableCell>
                <TableCell align="right">Net Salary</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <TableCell key={i}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredSlips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No salary slips found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSlips.map((slip) => (
                  <React.Fragment key={slip.id}>
                    <TableRow hover selected={selectedSlips.includes(slip.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSlips.includes(slip.id)}
                          onChange={() => handleSelectSlip(slip.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>{slip.memberName.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{slip.memberName}</Typography>
                            <Typography variant="caption" color="text.secondary">{slip.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">₹{slip.baseSalary.toLocaleString('en-IN')}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          -₹{slip.totalDeductions.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          ₹{slip.netSalary.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={getStatusIcon(slip.status)}
                          label={slip.status} 
                          size="small" 
                          color={getStatusColor(slip.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewSlip(slip)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {slip.status === 'PENDING' && (
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => {
                                  setSnackbar({ open: true, message: 'Salary slip approved!', severity: 'success' });
                                }}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Raise Dispute">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleOpenDispute(slip)}
                            >
                              <DisputeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => setExpandedRow(expandedRow === slip.id ? null : slip.id)}
                        >
                          {expandedRow === slip.id ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRow === slip.id} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2 }}>
                            <SalaryBreakdown slip={slip} />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialogs */}
      <GenerateSlipsDialog />
      <ViewSlipDialog />
      <DisputeDialog />
      <ApprovalDialog />

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

export default SalaryManagement;
