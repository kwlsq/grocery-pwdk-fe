import { create } from "zustand";
import axios from "axios";
import { CreateWarehouseDTO, WarehouseApiResponse } from "../types/warehouse";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import { WarehouseState } from "../types/warehouse";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  warehouse: null,
  loading: false,
  error: null,
  pagination: null,

  fetchWarehouses: async (storeId: string) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.WAREHOUSE + "/store/" + storeId
      );

      const response = await axios.get<WarehouseApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

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

      const token = getAuthToken();

      await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
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
  },

  fetchWarehouseByID : async (id) => {
    set({ loading: true, error: null });
    try {
      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.WAREHOUSE + "/" + id
      );

      const token = getAuthToken();

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        set({ warehouse: response.data.data, loading: false });
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
