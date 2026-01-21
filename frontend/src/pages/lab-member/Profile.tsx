import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { mockLabMembers, mockLabs } from '@/services/mockData';

const Profile: React.FC = () => {
  const { user: authUser } = useAuthStore();

  // Use mock data - find the mock member profile
  const mockProfile = mockLabMembers[0];
  const mockLab = mockLabs.find(lab => lab.id === mockProfile.labId);
  const user = authUser || {
    id: mockProfile.id,
    email: mockProfile.email,
    name: mockProfile.name,
    role: 'LAB_MEMBER' as const,
    status: mockProfile.status,
    labId: mockProfile.labId,
    labName: mockLab?.name || 'N/A',
    createdAt: mockProfile.joinDate,
    updatedAt: mockProfile.joinDate,
  };
  
  // Extra profile data from mock
  const profileData = {
    phone: mockProfile.phone || 'Not provided',
    joinDate: mockProfile.joinDate,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: 'error' as const };
      case 'LAB_ADMIN':
        return { label: 'Lab Admin', color: 'primary' as const };
      default:
        return { label: 'Lab Member', color: 'default' as const };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active', color: 'success' as const };
      case 'INACTIVE':
        return { label: 'Inactive', color: 'default' as const };
      case 'SUSPENDED':
        return { label: 'Suspended', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your account information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ pt: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user?.name}
              </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                    {user?.role && (
                      <Chip
                        label={getRoleBadge(user.role).label}
                        color={getRoleBadge(user.role).color}
                        size="small"
                      />
                    )}
                    {user?.status && (
                      <Chip
                        label={getStatusBadge(user.status).label}
                        color={getStatusBadge(user.status).color}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Account Information"
              subheader="Your personal and work details"
            />
            <CardContent>
              <List disablePadding>
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={user?.name || '—'}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      secondary={user?.email || '—'}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={profileData.phone}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <BusinessIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Lab"
                      secondary={user?.labName || 'Not assigned'}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <BadgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={getRoleBadge(user?.role || '').label}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>

                  <Divider component="li" />

                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Join Date"
                      secondary={profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString('default', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'Not available'}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
