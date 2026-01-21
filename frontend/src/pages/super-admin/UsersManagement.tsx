import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@/components';
import { User, UserRole, UserStatus } from '@/types';
import { mockUsers } from '@/services/mockData';

const UsersManagement: React.FC = () => {
  // Use mock data instead of API
  const users = mockUsers;
  const isLoading = false;

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'error';
      case 'LAB_ADMIN':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: Column<User>[] = [
    {
      id: 'name',
      label: 'User',
      format: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {row.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      align: 'center',
      format: (value) => (
        <Chip
          label={value as string}
          size="small"
          color={getRoleColor(value as UserRole)}
        />
      ),
    },
    {
      id: 'labName',
      label: 'Lab',
      format: (value) => (value as string) || '—',
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
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Joined',
      format: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      format: () => (
        <Tooltip title="Edit">
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all system users
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add User
          </Button>
          <Tooltip title="Refresh">
            <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        title="All Users"
        subtitle={`${users.length} users registered`}
        searchable={true}
        pagination={true}
        getRowId={(row) => row.id}
      />
    </Box>
  );
};

export default UsersManagement;
