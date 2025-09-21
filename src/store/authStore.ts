import { create } from 'zustand';
import { User } from '@/types/user'; 
import { fetchCurrentUser, logoutUser } from '../services/authService'; 

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  authChecked: false,
  isLoading: false,


 checkAuthStatus: async () => {
  if (get().isLoading) return;
  
  set({ isLoading: true });
  
  try {
    const response = await fetchCurrentUser();
    set({ user: response.data, isAuthenticated: true });
  } catch (error) {
    set({ user: null, isAuthenticated: false });
  } finally {
    set({ authChecked: true, isLoading: false });
  }
},

  login: (user) => set({ user, isAuthenticated: true, authChecked: true }),

  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({ user: null, isAuthenticated: false, authChecked: false });
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('intended_redirect');
        window.location.href = '/';
      }
    }
  },
}));