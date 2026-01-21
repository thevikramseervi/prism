import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Samsung Enterprise Design System Colors
const samsungColors = {
  primary: {
    main: '#0066CC',
    light: '#3384D6',
    dark: '#004C99',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00ADEF',
    light: '#33BDF2',
    dark: '#0087BC',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#28A745',
    light: '#53B96A',
    dark: '#1E7B34',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FFC107',
    light: '#FFCD38',
    dark: '#C79100',
    contrastText: '#212529',
  },
  error: {
    main: '#DC3545',
    light: '#E35D6A',
    dark: '#A71D2A',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#17A2B8',
    light: '#45B4C6',
    dark: '#117A8B',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
};

// Create base theme
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: samsungColors.primary,
    secondary: samsungColors.secondary,
    success: samsungColors.success,
    warning: samsungColors.warning,
    error: samsungColors.error,
    info: samsungColors.info,
    grey: samsungColors.grey,
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      disabled: '#ADB5BD',
    },
    divider: '#DEE2E6',
  },
  typography: {
    fontFamily: "'Roboto', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 600,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  spacing: 8, // 8px grid system
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 6px rgba(0, 0, 0, 0.1)',
    '0px 6px 8px rgba(0, 0, 0, 0.1)',
    '0px 8px 12px rgba(0, 0, 0, 0.1)',
    '0px 10px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 20px rgba(0, 0, 0, 0.1)',
    '0px 14px 24px rgba(0, 0, 0, 0.1)',
    '0px 16px 28px rgba(0, 0, 0, 0.1)',
    '0px 18px 32px rgba(0, 0, 0, 0.1)',
    '0px 20px 36px rgba(0, 0, 0, 0.1)',
    '0px 22px 40px rgba(0, 0, 0, 0.1)',
    '0px 24px 44px rgba(0, 0, 0, 0.1)',
    '0px 26px 48px rgba(0, 0, 0, 0.1)',
    '0px 28px 52px rgba(0, 0, 0, 0.15)',
    '0px 30px 56px rgba(0, 0, 0, 0.15)',
    '0px 32px 60px rgba(0, 0, 0, 0.15)',
    '0px 34px 64px rgba(0, 0, 0, 0.15)',
    '0px 36px 68px rgba(0, 0, 0, 0.15)',
    '0px 38px 72px rgba(0, 0, 0, 0.15)',
    '0px 40px 76px rgba(0, 0, 0, 0.15)',
    '0px 42px 80px rgba(0, 0, 0, 0.2)',
    '0px 44px 84px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F3F5',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CED4DA',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#ADB5BD',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E9ECEF',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        subheader: {
          fontSize: '0.8125rem',
          color: '#6C757D',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#DEE2E6',
            },
            '&:hover fieldset': {
              borderColor: '#0066CC',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0066CC',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E9ECEF',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F9FA',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: '#495057',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '2px solid #DEE2E6',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FAFBFC',
          },
          '&:hover': {
            backgroundColor: '#F1F3F5',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '14px 16px',
          borderBottom: '1px solid #E9ECEF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#D4EDDA',
            color: '#155724',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#FFF3CD',
            color: '#856404',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#F8D7DA',
            color: '#721C24',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#D1ECF1',
            color: '#0C5460',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212529',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E9ECEF',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 102, 204, 0.08)',
            color: '#0066CC',
            '& .MuiListItemIcon-root': {
              color: '#0066CC',
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 102, 204, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: '#D4EDDA',
          color: '#155724',
        },
        standardError: {
          backgroundColor: '#F8D7DA',
          color: '#721C24',
        },
        standardWarning: {
          backgroundColor: '#FFF3CD',
          color: '#856404',
        },
        standardInfo: {
          backgroundColor: '#D1ECF1',
          color: '#0C5460',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#343A40',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '8px 12px',
        },
        arrow: {
          color: '#343A40',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;
