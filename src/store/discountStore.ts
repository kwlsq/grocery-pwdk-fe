import { create } from "zustand";
import {
  CreateDiscountDTO,
  DiscountState,
  DiscountsApiResponse,
} from "../types/discount";
import axios from "axios";
import { API_CONFIG, buildApiUrl } from "@/config/api";

export const useDiscountStore = create<DiscountState>((set, get) => ({
  discounts: [],
  loading: false,
  error: null,
  pagination: null,

  fetchDiscount: async () => {
    set({ loading: true, error: null });
    try {
      const token =
        (typeof window !== "undefined" &&
          localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" &&
          sessionStorage.getItem("accessToken")) ||
        "";

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DISCOUNT
      );

      const response = await axios.get<DiscountsApiResponse>(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          discounts: response.data.data.content,
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
    } catch (err) {
      console.error("Error fetching users:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to fetch users",
        loading: false,
      });
    }
  },

  createDiscount: async (data: CreateDiscountDTO) => {
    set({ loading: true, error: null });
    try {
      const token =
        (typeof window !== "undefined" &&
          localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" &&
          sessionStorage.getItem("accessToken")) ||
        "";

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISCOUNT}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        set({loading: false, error: null})
      } else {
        set({
          error: response.data.message || "Failed to create discount",
          loading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to fetch users",
        loading: false,
      });
    }
  },
}));
