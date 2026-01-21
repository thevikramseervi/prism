import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Link,
  InputAdornment,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  LockReset as LockResetIcon,
  KeyboardArrowUp as ArrowUpIcon,
  PersonRemove as DeleteAccountIcon,
} from '@mui/icons-material';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      navigate('/login');
    }, 3000);
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
            minHeight: 480,
          }}
        >
          {/* LEFT IMAGE PANEL */}
          <Box
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'block' },
              width: '50%',
              minHeight: 480,
            }}
          >
            <Box
              component="img"
              src="/background.jpeg"
              alt="SEED Reset Password"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Dark Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
                zIndex: 1,
              }}
            />

            {/* Text Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  letterSpacing: 4,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: { md: '2rem', lg: '2.5rem' },
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
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: { md: '1.5rem', lg: '2rem' },
                }}
              >
                SEED CENTRE
              </Typography>
            </Box>
          </Box>

          {/* RIGHT FORGOT PASSWORD PANEL */}
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
              <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                  <LockResetIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Forgot Password?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email to receive a reset link
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your email"
                  required
                />

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
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Back to Sign In
                  </Link>
                </Typography>
              </Box>
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

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={3000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Reset link sent to your email! Redirecting to login...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPasswordPage;
