import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@/components';
import { Lab, LabStatus } from '@/types';
import { mockLabs } from '@/services/mockData';

const LabsManagement: React.FC = () => {
  // Use mock data instead of API
  const labs = mockLabs;
  const isLoading = false;

  const getStatusColor = (status: LabStatus) => {
    return status === 'ACTIVE' ? 'success' : 'default';
  };

  const columns: Column<Lab>[] = [
    {
      id: 'name',
      label: 'Lab',
      format: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <BusinessIcon />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Code: {row.code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'adminName',
      label: 'Admin',
      format: (value) => (value as string) || 'Not assigned',
    },
    {
      id: 'memberCount',
      label: 'Members',
      align: 'center',
      format: (value) => (
        <Chip label={value as number} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      format: (value) => (
        <Chip
          label={value as string}
          size="small"
          color={getStatusColor(value as LabStatus)}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      format: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      format: () => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View">
            <IconButton size="small">
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
            Labs Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all SEED Labs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Lab
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
        data={labs}
        loading={isLoading}
        title="All Labs"
        subtitle={`${labs.length} labs registered`}
        searchable={true}
        pagination={true}
        getRowId={(row) => row.id}
      />
    </Box>
  );
};

export default LabsManagement;
