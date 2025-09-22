import { create } from 'zustand';
import axios from "axios";
import { StoreApiResponse, StoreState, UniqueStore } from "../types/store";
import { API_CONFIG, buildApiUrl } from "../config/api";

const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('accessToken=')
  );
  
  return tokenCookie ? tokenCookie.split('=')[1].trim() : "";
};

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  uniqueStores: [],
  store: null,
  loading: false,
  error: null,
  lastFetched: null,
  isFetching: false,
  pagination: null,

  fetchStores: async (page = 0, size = 12, search = "", sortBy = "", sortDirection = "") => {
    set({ isFetching: true, loading: true, error: null });
    try {
      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE + "/all",
        {
          page,
          size,
          search,
          sortBy,
          sortDirection,
        }
      );
      const response = await axios.get<StoreApiResponse>(url, { withCredentials: true });

      if (response.data.success) {
        set({
          stores: response.data.data.content,
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
          error: response.data.message || "Failed to fetch stores",
          loading: false,
          isFetching: false,
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch stores",
        loading: false,
        isFetching: false,
      });
    }
  },

  fetchUniqueStores: async () => {
    set({ isFetching: true, loading: true, error: null });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE + "/unique"
      );

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const uniqueStores: UniqueStore[] = response.data.data;

        set({ uniqueStores, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch stores",
          loading: false,
        });
      }
      
    } catch (error) {
      console.error("Error fetching stores:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch stores",
        loading: false,
        isFetching: false,
      });
    }
  },

  fetchStoreByUser: async () => {
    set({ loading: true, error: null });
    try {
      const url = buildApiUrl(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE);

      const token = getAuthToken();

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        set({ store: response.data.data, loading: false });
      } else {
        set({
          store: null,
          error: response.data.message,
          loading: false,
        });
      }

    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch store for this users",
        loading: false,
      });
    }
  },

  unassignManagerFromStore: async (storeId: string) => {
    try {
      const token = getAuthToken();
      const url = buildApiUrl(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORE}/${storeId}/unassign-manager`
      );

      const response = await axios.delete(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const updatedStore = response.data.data;
        
        const currentStores = get().stores;
        const updatedStores = currentStores.map(store => 
          store.id === storeId 
            ? { ...store, storeManager: undefined }
            : store
        );
        
        set({ stores: updatedStores });

        const currentStore = get().store;
        if (currentStore && currentStore.id === storeId) {
          set({ store: { ...currentStore, storeManager: undefined } });
        }

        return updatedStore;
      } else {
        throw new Error(response.data.message || "Failed to unassign manager");
      }
    } catch (error) {
      console.error("Error unassigning manager:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw new Error(error instanceof Error ? error.message : "Failed to unassign manager");
    }
  },

  addStore: async (newStoreData) => {
    try {
      const token = getAuthToken();
      const url = buildApiUrl(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORE}`);

      const response = await axios.post(url, newStoreData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        const newStore = response.data;
        
        const currentStores = get().stores;
        set({ stores: [...currentStores, newStore] });
        
        return newStore;
      } else {
        throw new Error("Failed to create store");
      }
    } catch (error) {
      console.error("Failed to add store:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw new Error(error instanceof Error ? error.message : "Failed to create store");
    }
  },
}));