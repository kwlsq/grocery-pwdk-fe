// src/store/authStore.ts

import { create } from 'zustand';
import axios from 'axios';

// A simple type for user data
interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

// Configure axios to always send cookies
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  checkAuthStatus: async () => {
    try {
      const response = await apiClient.get('/api/users/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    try {
        // NOTE: Your /logout endpoint should clear the HttpOnly cookies
        await apiClient.post('/api/auth/logout', {});
    } finally {
        set({ user: null, isAuthenticated: false });
    }
  },
}));