import { create } from "zustand";
import axios from "axios";
import { UsersState, UsersApiResponse } from "@/types/user";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import { RegisterUserDTO } from "../types/user";

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  pagination: null,
  selectedRole: "",
  setSelectedRole: (role) => set({ selectedRole: role }),

  fetchUsers: async (params) => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 12;
    const role = params?.role ?? get().selectedRole ?? "";

    set({ loading: true, error: null });
    try {

      const token =
        (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
        "";

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USERS,
        {
          page,
          size,
          role,
        }
      );

      const response = await axios.get<UsersApiResponse>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: true,
      });

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
        set({
          error: response.data.message || "Failed to fetch users",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch users",
        loading: false,
      });
    }
  },

  deleteUser: async (userID) => {
    set({ loading: true, error: null });
    try {
      const token =
        (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
        "";

      await axios.delete(
        buildApiUrl(
          API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE_ADMIN.DELETE + "/" + userID
        ),
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      set({ loading: false, error: null });
    } catch (error) {
      console.error("Error removing users:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to remove users",
        loading: false,
      });
    }
  },

  registerStoreAdmin: async (data: RegisterUserDTO) => {
    set({ loading: true, error: null });
    try {

      const token =
        (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
        "";

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE_ADMIN.REGISTER
      );

      await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error("Error while registering users:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to register users",
        loading: false,
      });
    }
  },
}));
