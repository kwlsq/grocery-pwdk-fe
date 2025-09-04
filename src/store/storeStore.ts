import { create } from "zustand";
import axios from "axios";
import { Store, StoreApiResponse } from "../types/store";
import { API_CONFIG, buildApiUrl } from "../config/api";

interface StoreState {
  stores: Store[];
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
}

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  loading: false,
  error: null,

  fetchStores: async () => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.STORE,
        {}
      );

      const response = await axios.get<StoreApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        set({ stores: response.data.data, loading: false });
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
      });
    }
  },
}));
