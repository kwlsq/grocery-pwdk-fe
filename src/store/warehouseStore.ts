import { create } from "zustand";
import axios from "axios";
import { CreateWarehouseDTO, Warehouse, WarehouseApiResponse } from "../types/warehouse";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import { WarehouseState } from "../types/warehouse";

export const useWarehouseStore = create<WarehouseState>((set) => ({
  warehouses: [],
  loading: false,
  error: null,
  pagination: null,

  fetchWarehouses: async (storeId: string, page = 0, size = 12) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<WarehouseApiResponse>(
        buildApiUrl(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSE}/${storeId}`, {
          page,
          size
        })
      );

      if (response.data.success) {
        set({
          warehouses: response.data.data.content,
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
          error: response.data.message || "Failed to fetch products",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch warehouses",
        loading: false,
      });
    }
  },

  createWarehouse: async (data: CreateWarehouseDTO) => {
    set({ loading: true, error: null });
    try {
      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.WAREHOUSE
      );

      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      set({ loading: false, error: null });
    } catch (error) {
      console.error("Error while creating warehouse:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create warehouse",
        loading: false,
      });
    }
  }
}));
