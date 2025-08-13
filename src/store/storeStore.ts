import { create } from "zustand";
import axios from "axios";
import { Store, StoreApiResponse } from "../types/store";

interface StoreState {
  stores: Store[];
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  loading: false,
  error: null,

  fetchStores: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<StoreApiResponse>(
        'http://localhost:8080/api/v1/store'
      );

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
        error: error instanceof Error ? error.message : "Failed to fetch stores",
        loading: false,
      });
    }
  },
}));
