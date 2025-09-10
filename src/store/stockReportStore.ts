import { create } from "zustand";
import axios from "axios";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import {
  StockReportState,
  StockReportApiResponse,
  StockReportFilters,
  ProductStockReportApiResponse,
} from "@/types/stockReport";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useStockReportStore = create<StockReportState>((set, get) => ({
  reports: [],
  loading: false,
  error: null,
  pagination: null,
  page: 0,
  size: API_CONFIG.DEFAULT_PAGE_SIZE,
  filters: {},
  productReports: [],
  productPagination: null,
  productPage: 0,
  productSize: API_CONFIG.DEFAULT_PAGE_SIZE,
  productMonth: undefined,

  fetchReports: async (opts) => {
    const page = opts?.page ?? get().page;
    const size = opts?.size ?? get().size;
    const filters: StockReportFilters = {
      ...get().filters,
      ...(opts?.filters || {}),
    };

    set({ loading: true, error: null, page, size, filters });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_REPORTS}/summary`,
        {
          page,
          size,
          storeId: filters.storeId || "",
          warehouseId: filters.warehouseId || "",
          month: filters.month || "",
          productName: filters.productName || "",
        }
      );

      const response = await axios.get<StockReportApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        const data = response.data.data;
        set({
          reports: data.content,
          pagination: {
            page: data.page,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
          },
          loading: false,
        });
      } else {
        set({
          error: response.data.message || "Failed to fetch stock reports",
          loading: false,
        });
      }
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to fetch stock reports",
        loading: false,
      });
    }
  },

  setPage: (page) => set({ page }),
  setFilters: (filters) => set({ filters }),

  fetchProductReports: async ({ productId, page, size, month }) => {
    const currentPage = page ?? get().productPage;
    const currentSize = size ?? get().productSize;
    const currentMonth = month ?? get().productMonth;

    set({ loading: true, error: null, productPage: currentPage, productSize: currentSize, productMonth: currentMonth });
    try {
      const token = getAuthToken();

      const params: Record<string, string | number> = {
        page: currentPage,
        size: currentSize,
      };
      if (currentMonth && currentMonth !== "all") {
        params["month"] = currentMonth;
      }

      const url = buildApiUrl(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_REPORTS}/product/${productId}`, params);
      const response = await axios.get<ProductStockReportApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.data.success) {
        const data = response.data.data;
        set({
          productReports: data.content,
          productPagination: {
            page: data.page,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
          },
          loading: false,
        });
      } else {
        set({ error: response.data.message || "Failed to fetch product stock reports", loading: false });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch product stock reports", loading: false });
    }
  },
  setProductPage: (page) => set({ productPage: page }),
  setProductMonth: (month) => set({ productMonth: month }),
}));
