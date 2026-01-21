import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle as ActiveIcon,
  Block as SuspendIcon,
  PersonOff as InactiveIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { DataTable, Column, StatCard } from '@/components';
import { LabMember, UserStatus } from '@/types';
import { mockLabMembers } from '@/services/mockData';

// Onboarding wizard steps
const onboardingSteps = ['Personal Info', 'Contact Details', 'Employment Details', 'Review & Submit'];

// Extended member data with additional fields
const generateExtendedMembers = () => {
  return mockLabMembers.map(member => ({
    ...member,
    attendanceRate: Math.floor(Math.random() * 20) + 80,
    lastActive: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    pendingSalaries: Math.floor(Math.random() * 2),
    department: ['AI Research', 'ML Engineering', 'Data Science', 'Software Dev'][Math.floor(Math.random() * 4)],
  }));
};

const MembersManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LabMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkActionMenu, setBulkActionMenu] = useState<null | HTMLElement>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state for new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    baseSalary: 50000,
    status: 'ACTIVE' as UserStatus,
  });

  // Use extended mock data
  const members = useMemo(() => generateExtendedMembers(), []);
  const isLoading = false;

  // Filter members based on status and date
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'recent' && new Date(member.joinDate) > new Date(Date.now() - 90 * 86400000)) ||
        (dateFilter === 'old' && new Date(member.joinDate) <= new Date(Date.now() - 90 * 86400000));
      return matchesStatus && matchesDate;
    });
  }, [members, statusFilter, dateFilter]);

  // Statistics
  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    inactive: members.filter(m => m.status === 'INACTIVE').length,
    suspended: members.filter(m => m.status === 'SUSPENDED').length,
    avgAttendance: Math.round(members.reduce((acc, m) => acc + (m as any).attendanceRate, 0) / members.length),
  }), [members]);

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'default';
      case 'SUSPENDED': return 'error';
      default: return 'default';
    }
  };

  const handleAddMember = () => {
    setSnackbar({ open: true, message: 'Member added successfully!', severity: 'success' });
    setAddDialogOpen(false);
    setActiveStep(0);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0],
      baseSalary: 50000,
      status: 'ACTIVE',
    });
  };

  const handleViewMember = (member: LabMember) => {
    setSelectedMember(member);
    setViewDialogOpen(true);
  };

  const handleEditMember = (member: LabMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleBulkAction = (action: string) => {
    setSnackbar({ 
      open: true, 
      message: `${action} applied to ${selectedMembers.length} members`, 
      severity: 'success' 
    });
    setSelectedMembers([]);
    setBulkActionMenu(null);
  };

  const handleExport = () => {
    setSnackbar({ open: true, message: 'Exporting member data...', severity: 'info' });
  };

  const handleImport = () => {
    setSnackbar({ open: true, message: 'Import feature - select a CSV file', severity: 'info' });
  };

  const columns: Column<LabMember>[] = [
    {
      id: 'name',
      label: 'Member',
      format: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {row.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {row.id} • {(row as any).department || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Contact',
      format: (_, row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2">{row.email}</Typography>
          </Box>
          {row.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {row.phone}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'joinDate',
      label: 'Join Date',
      format: (value) => (
        <Box>
          <Typography variant="body2">
            {new Date(value as string).toLocaleDateString('default', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.floor((Date.now() - new Date(value as string).getTime()) / (86400000 * 30))} months ago
          </Typography>
        </Box>
      ),
    },
    {
      id: 'baseSalary',
      label: 'Base Salary',
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight={500}>
          ₹{Number(value).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'attendanceRate',
      label: 'Attendance',
      align: 'center',
      format: (_, row) => {
        const rate = (row as any).attendanceRate || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={rate} 
              sx={{ width: 50, height: 6, borderRadius: 3 }}
              color={rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'error'}
            />
            <Typography variant="body2" fontWeight={500}>
              {rate}%
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      format: (value) => (
        <Chip
          label={value as string}
          size="small"
          color={getStatusColor(value as UserStatus)}
          icon={value === 'ACTIVE' ? <ActiveIcon /> : value === 'SUSPENDED' ? <SuspendIcon /> : <InactiveIcon />}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View Profile">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleViewMember(row); }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Member">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleEditMember(row); }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View History">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/members/${row.id}/history`); }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Onboarding Wizard Dialog
  const OnboardingWizard = () => (
    <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          Add New Member
        </Box>
        <IconButton onClick={() => setAddDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {onboardingSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Enter the personal information for the new lab member
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newMember.department}
                  label="Department"
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                >
                  <MenuItem value="AI Research">AI Research</MenuItem>
                  <MenuItem value="ML Engineering">ML Engineering</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="Software Dev">Software Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Provide contact details for the member
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Set employment details and salary information
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Join Date"
                type="date"
                value={newMember.joinDate}
                onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Salary"
                type="number"
                value={newMember.baseSalary}
                onChange={(e) => setNewMember({ ...newMember, baseSalary: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newMember.status}
                  label="Status"
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as UserStatus })}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeStep === 3 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Please review the information before submitting
            </Alert>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight={500}>{newMember.name || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography variant="body1">{newMember.department || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{newMember.email || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{newMember.phone || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Join Date</Typography>
                    <Typography variant="body1">{newMember.joinDate}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Base Salary</Typography>
                    <Typography variant="body1">₹{newMember.baseSalary.toLocaleString('en-IN')}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
        )}
        {activeStep < onboardingSteps.length - 1 ? (
          <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleAddMember}>
            Add Member
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  // Member Quick Preview Dialog
  const MemberPreviewDialog = () => {
    if (!selectedMember) return null;
    const extMember = selectedMember as any;

    return (
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
            {selectedMember.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{selectedMember.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip 
                size="small" 
                label={selectedMember.status} 
                color={getStatusColor(selectedMember.status)}
              />
              <Chip 
                size="small" 
                label={extMember.department || 'N/A'} 
                variant="outlined"
              />
            </Box>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Attendance" />
            <Tab label="Salary" />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography variant="body2">{selectedMember.email}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                            <Typography variant="body2">{selectedMember.phone || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Join Date</Typography>
                            <Typography variant="body2">{new Date(selectedMember.joinDate).toLocaleDateString()}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Base Salary</Typography>
                            <Typography variant="body2">₹{selectedMember.baseSalary.toLocaleString('en-IN')}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">Current Month Attendance</Typography>
                <Typography variant="h6" color="success.main">{extMember.attendanceRate}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={extMember.attendanceRate} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
                color={extMember.attendanceRate >= 90 ? 'success' : extMember.attendanceRate >= 75 ? 'warning' : 'error'}
              />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h5" color="success.dark">18</Typography>
                    <Typography variant="caption" color="success.dark">Full Days</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="h5" color="warning.dark">2</Typography>
                    <Typography variant="caption" color="warning.dark">Half Days</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                    <Typography variant="h5" color="error.dark">1</Typography>
                    <Typography variant="caption" color="error.dark">LOP</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Showing salary information for the current month
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Base Salary</Typography>
                  <Typography variant="h6">₹{selectedMember.baseSalary.toLocaleString('en-IN')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Deductions</Typography>
                  <Typography variant="h6" color="error.main">-₹2,500</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={600}>Net Salary</Typography>
                    <Typography variant="h5" color="primary.main">
                      ₹{(selectedMember.baseSalary - 2500).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            onClick={() => { setViewDialogOpen(false); handleEditMember(selectedMember); }}
          >
            Edit Member
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/admin/members/${selectedMember.id}`)}
          >
            View Full Profile
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Edit Member Dialog
  const EditMemberDialog = () => {
    if (!selectedMember) return null;

    return (
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Member - {selectedMember.name}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue={selectedMember.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                defaultValue={selectedMember.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                defaultValue={selectedMember.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Salary"
                type="number"
                defaultValue={selectedMember.baseSalary}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedMember.status}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setEditDialogOpen(false);
              setSnackbar({ open: true, message: 'Member updated successfully!', severity: 'success' });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
            Lab Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lab members with onboarding wizard and bulk actions
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            onClick={handleImport}
          >
            Import CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Member
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Members"
            value={stats.total}
            icon={<PersonIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active"
            value={stats.active}
            subtitle={`${Math.round(stats.active / stats.total * 100)}% of total`}
            icon={<ActiveIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive/Suspended"
            value={stats.inactive + stats.suspended}
            icon={<InactiveIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Attendance"
            value={`${stats.avgAttendance}%`}
            icon={<CalendarIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Join Date</InputLabel>
              <Select
                value={dateFilter}
                label="Join Date"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="recent">Last 3 Months</MenuItem>
                <MenuItem value="old">Older</MenuItem>
              </Select>
            </FormControl>
            {selectedMembers.length > 0 && (
              <>
                <Divider orientation="vertical" flexItem />
                <Chip 
                  label={`${selectedMembers.length} selected`} 
                  onDelete={() => setSelectedMembers([])}
                  color="primary"
                />
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="success"
                  onClick={(e) => setBulkActionMenu(e.currentTarget)}
                >
                  Bulk Actions
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Bulk Action Menu */}
      <Menu
        anchorEl={bulkActionMenu}
        open={Boolean(bulkActionMenu)}
        onClose={() => setBulkActionMenu(null)}
      >
        <MenuItem onClick={() => handleBulkAction('Activated')}>
          <ListItemIcon><ActiveIcon color="success" fontSize="small" /></ListItemIcon>
          <ListItemText>Activate Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('Deactivated')}>
          <ListItemIcon><InactiveIcon color="warning" fontSize="small" /></ListItemIcon>
          <ListItemText>Deactivate Selected</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction('Suspended')}>
          <ListItemIcon><SuspendIcon color="error" fontSize="small" /></ListItemIcon>
          <ListItemText>Suspend Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Members Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        loading={isLoading}
        title="All Members"
        subtitle={`${filteredMembers.length} members found`}
        searchable={true}
        searchPlaceholder="Search by name, email, or department..."
        pagination={true}
        defaultRowsPerPage={10}
        getRowId={(row) => row.id}
        onRowClick={(row) => handleViewMember(row)}
      />

      {/* Dialogs */}
      <OnboardingWizard />
      <MemberPreviewDialog />
      <EditMemberDialog />

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

export default MembersManagement;
