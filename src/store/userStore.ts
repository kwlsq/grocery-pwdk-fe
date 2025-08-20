import { create } from 'zustand';
import axios from 'axios';
import { UsersState, UsersApiResponse } from '@/types/user';
import { API_CONFIG, buildApiUrl } from '@/config/api';

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  pagination: null,
  selectedRole: '',
  setSelectedRole: (role) => set({ selectedRole: role }),

  fetchUsers: async (params) => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 12;
    const role = params?.role ?? get().selectedRole ?? '';

    set({ loading: true, error: null });
    try {
      const url = buildApiUrl(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USERS, {
        page,
        size,
        role,
      });

      const response = await axios.get<UsersApiResponse>(url);

      if (response.data.success) {
        set({
          users: response.data.data.content,
          pagination: {
            page: response.data.data.page,
            size: response.data.data.size,
            totalElements: response.data.data.totalElements,
            totalPages: response.data.data.totalPages,
            hasNext: response.data.data.hasNext,
            hasPrevious: response.data.data.hasPrevious,
          },
          loading: false,
        });
      } else {
        set({ error: response.data.message || 'Failed to fetch users', loading: false });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch users', loading: false });
    }
  },
}));


