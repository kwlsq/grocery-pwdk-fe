import { create } from "zustand";
import axios from "axios";
import { Warehouse, WarehouseApiResponse } from "../types/warehouse";

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  fetchWarehouses: (storeId: string) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  warehouses: [],
  loading: false,
  error: null,

  fetchWarehouses: async (storeId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<WarehouseApiResponse>(
        `http://localhost:8080/api/v1/warehouse/${storeId}`
      );

      if (response.data.success) {
        set({ warehouses: response.data.data, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch warehouses",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch warehouses",
        loading: false,
      });
    }
  },
}));
