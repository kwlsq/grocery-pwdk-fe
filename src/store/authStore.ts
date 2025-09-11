import { create } from 'zustand';
import { User } from '@/types/user'; // Adjust path if needed
import { fetchCurrentUser, logoutUser } from '../services/authService'; // Import from your new service

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  checkAuthStatus: async () => {
    try {
      const response = await fetchCurrentUser();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));

