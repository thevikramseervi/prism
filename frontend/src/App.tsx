import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';

// Components
import { ProtectedRoute, Layout, ErrorDisplay } from '@/components';

// Auth Store
import { useAuthStore } from '@/stores/authStore';

// Pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  Dashboard,
  AttendanceSummary,
  SalarySlips,
  Profile,
  MembersManagement,
  AttendanceManagement,
  SalaryManagement,
  Reports,
  LabsManagement,
  UsersManagement,
  Settings,
} from '@/pages';

// Loading Component
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={48} sx={{ color: 'primary.main' }} />
  </Box>
);

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => (
  <ErrorDisplay
    title="Something went wrong"
    message={error.message}
    onRetry={resetErrorBoundary}
  />
);

// Not Found Page
const NotFound: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      p: 4,
    }}
  >
    <Box
      sx={{
        fontSize: '6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #0066CC 0%, #00ADEF 100%)',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 2,
      }}
    >
      404
    </Box>
    <Box sx={{ color: 'text.secondary', mb: 4 }}>
      The page you're looking for doesn't exist.
    </Box>
  </Box>
);

const App: React.FC = () => {
  const { checkAuth, isLoading, isAuthenticated, user } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // Helper function to get default route based on user role
  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'LAB_MEMBER':
        return '/member/dashboard';
      case 'LAB_ADMIN':
        return '/admin/dashboard';
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      default:
        return '/member/dashboard';
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <RegisterPage />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <ForgotPasswordPage />
              )
            }
          />

          {/* Lab Member Routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['LAB_MEMBER', 'LAB_ADMIN', 'SUPER_ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<AttendanceSummary />} />
            <Route path="salary-slips" element={<SalarySlips />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['LAB_ADMIN', 'SUPER_ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<MembersManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="labs" element={<LabsManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
