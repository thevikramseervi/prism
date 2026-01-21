import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, UserRole } from '@/types';
import { authApi } from '@/services/api';

interface ExtendedAuthState extends AuthState {
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

// Helper function to map backend roles to frontend roles
const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
  switch (backendRole) {
    case 'SUPER_ADMIN':
      return 'SUPER_ADMIN';
    case 'LAB_ADMIN':
      return 'LAB_ADMIN';
    case 'LAB_MEMBER':
    default:
      return 'LAB_MEMBER';
  }
};

export const useAuthStore = create<ExtendedAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string = '', password: string = '') => {
        try {
          // Call real backend API
          const response = await authApi.login({ email, password });
          
          // Map backend response to frontend User type
          const user: User = {
            id: parseInt(response.user.id),
            email: response.user.email,
            name: response.user.full_name,
            role: mapBackendRoleToFrontend(response.user.roles?.[0] || 'LAB_MEMBER'),
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          localStorage.setItem('token', response.access_token);
          set({
            user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Login failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role: UserRole) => {
        // Note: Registration is typically admin-only in production
        // This is a placeholder for future implementation
        console.log('User registration requested:', { name, email, role });
        throw new Error('Registration is currently disabled. Please contact your administrator.');
      },

      forgotPassword: async (email: string) => {
        // Placeholder for future implementation
        console.log('Password reset requested for:', email);
        throw new Error('Password reset is currently unavailable. Please contact your administrator.');
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const storedState = localStorage.getItem('auth-storage');
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState);
            if (parsed.state?.user && parsed.state?.isAuthenticated) {
              set({
                user: parsed.state.user,
                token: parsed.state.token,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } catch {
            // Invalid stored state
          }
        }
        set({ isLoading: false, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
