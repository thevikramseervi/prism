import React from 'react';
import { Box, Typography, Button, SxProps, Theme } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  sx?: SxProps<Theme>;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'error.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <ErrorOutline sx={{ fontSize: 40, color: 'error.main' }} />
      </Box>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 400, mb: 3 }}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorDisplay;
