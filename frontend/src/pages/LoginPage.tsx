import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Divider,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  KeyboardArrowUp as ArrowUpIcon,
  PersonRemove as DeleteAccountIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('admin@seedlab.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by App.tsx based on user role
      window.location.href = '/';
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#f0f2f5',
          p: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            borderRadius: 3,
            overflow: 'hidden',
            maxWidth: 900,
            width: '100%',
            minHeight: 520,
          }}
        >
          {/* LEFT GRADIENT PANEL */}
          <Box
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              width: '50%',
              minHeight: 520,
              background: 'linear-gradient(135deg, #0066CC 0%, #00ADEF 50%, #0066CC 100%)',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 4,
            }}
          >
            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 70% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)',
                zIndex: 0,
              }}
            />

            {/* Text Content */}
            <Box sx={{ zIndex: 1, textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  letterSpacing: 4,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  fontSize: { md: '2rem', lg: '2.5rem' },
                  mb: 1,
                }}
              >
                SAMSUNG
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  letterSpacing: 4,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  fontSize: { md: '1.5rem', lg: '2rem' },
                  mb: 4,
                }}
              >
                SEED CENTRE
              </Typography>
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: 'white',
                  mx: 'auto',
                  borderRadius: 2,
                  mb: 3,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  maxWidth: 300,
                  mx: 'auto',
                }}
              >
                Attend Ease
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  mt: 1,
                }}
              >
                Automated Attendance & Salary Management
              </Typography>
            </Box>
          </Box>

          {/* RIGHT LOGIN PANEL */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 3, md: 4 },
              backgroundColor: '#fff',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 380 }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0066CC 0%, #00ADEF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <LoginIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to access your dashboard
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your email"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your password"
                />


                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    underline="hover"
                    sx={{ color: 'primary.main' }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0066CC 0%, #00ADEF 100%)',
                    boxShadow: '0 4px 14px rgba(0, 102, 204, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #005bb5 0%, #0099d6 100%)',
                      boxShadow: '0 6px 20px rgba(0, 102, 204, 0.5)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Don't have an account?
                </Typography>
              </Divider>

              <Button
                component={RouterLink}
                to="/register"
                fullWidth
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(0, 102, 204, 0.04)',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Main Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#1a3eff',
          color: 'white',
          py: 4,
          px: { xs: 3, md: 6 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-start' },
            gap: 4,
            maxWidth: 1400,
            mx: 'auto',
          }}
        >
          {/* Left Section - Got Queries */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Got Queries?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <EmailIcon sx={{ fontSize: 20 }} />
              <Link
                href="mailto:seed@samsung.com"
                sx={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                seed@samsung.com
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DeleteAccountIcon sx={{ fontSize: 20 }} />
              <Link
                href="#"
                sx={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Delete user account
              </Link>
            </Box>
          </Box>

          {/* Right Section - Information */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Information
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 2, md: 4 },
              }}
            >
              {['About Us', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'FAQs'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            maxWidth: 1400,
            mx: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Copyright SEED
          </Typography>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              color: 'white',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Back to Top
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpIcon sx={{ color: '#1a3eff' }} />
            </Box>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
