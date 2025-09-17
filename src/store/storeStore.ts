import { create } from "zustand";
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

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  uniqueStores: [],
  store: null,
  loading: false,
  error: null,
  lastFetched: null,
  isFetching: false,
  pagination: null,

  fetchStores: async (page = 0, size = 12, search = "") => {
    set({ isFetching: true, loading: true, error: null });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE + "/all",
        {
          page,
          size,
          search,
        }
      );

      const response = await axios.get<StoreApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

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
    const state = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Return cached data if recent and available
    if (
      state.stores.length > 0 &&
      state.lastFetched &&
      now - state.lastFetched < CACHE_DURATION
    ) {
      return;
    }

    // Prevent duplicate requests
    if (state.isFetching) {
      return;
    }

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
          error: response.data.message || "Failed to fetch warehouse",
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
          error: "Failed to fetch warehouse by ID",
          loading: false,
        });
      }

      set({ loading: false, error: null });
    } catch (error) {
      console.error("Error while creating warehouse:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create warehouse",
        loading: false,
      });
    }
  },
}));
