import { create } from 'zustand';
import axios from "axios";
import { StoreApiResponse, StoreState, UniqueStore } from "../types/store";
import { API_CONFIG, buildApiUrl } from "../config/api";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useStoreStore = create<StoreState>((set) => ({
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
          error instanceof Error ? error.message : "Failed to create warehouse",
        loading: false,
      });
    }
  },
  addStore: async (newStoreData) => {
        try {
            // Placeholder: implement via service when available
            console.warn("addStore not implemented: ", newStoreData);
        } catch (err) {
            console.error("Failed to add store", err);
            throw err; // Re-throw so the form can display an error
        }
    },
}));
