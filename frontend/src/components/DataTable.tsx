import React, { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string | number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  actions?: React.ReactNode;
}

function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  error = null,
  title,
  subtitle,
  searchable = true,
  searchPlaceholder = 'Search...',
  pagination = true,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  onRefresh,
  onExport,
  onRowClick,
  getRowId,
  emptyMessage = 'No data available',
  stickyHeader = true,
  maxHeight = 600,
  actions,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Filter visible columns
  const visibleColumns = useMemo(() => columns.filter((col) => !col.hidden), [columns]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Apply sorting
    if (orderBy) {
      result.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[orderBy];
        const bValue = (b as Record<string, unknown>)[orderBy];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [data, searchQuery, orderBy, order]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    return processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [processedData, page, rowsPerPage, pagination]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    const keys = String(column.id).split('.');
    let value: unknown = row;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = undefined;
        break;
      }
    }

    if (column.format) {
      return column.format(value, row);
    }

    if (value === null || value === undefined) {
      return <Typography variant="body2" color="text.secondary">—</Typography>;
    }

    return String(value);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {(title || subtitle) && (
          <Box sx={{ p: 3, pb: 2 }}>
            {title && <Skeleton width={200} height={28} />}
            {subtitle && <Skeleton width={300} height={20} sx={{ mt: 1 }} />}
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell key={String(column.id)}>
                    <Skeleton width={100} height={20} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((column) => (
                    <TableCell key={String(column.id)}>
                      <Skeleton height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper sx={{ width: '100%', p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading data
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {error}
        </Typography>
        {onRefresh && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<RefreshIcon />}
              label="Retry"
              onClick={onRefresh}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header Section */}
      {(title || subtitle || searchable || actions || onRefresh || onExport) && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {searchable && (
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}

            {actions}

            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}

            {onExport && (
              <Tooltip title="Export">
                <IconButton onClick={onExport} size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Filter">
              <IconButton size="small">
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Table Section */}
      <TableContainer sx={{ maxHeight: stickyHeader ? maxHeight : 'none' }}>
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(String(column.id))}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={getRowId ? getRowId(row) : index}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={String(column.id)}
                      align={column.align}
                      style={{ maxWidth: column.maxWidth }}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && processedData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={processedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      )}
    </Paper>
  );
}

export default DataTable;
