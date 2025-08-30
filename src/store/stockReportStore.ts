import { create } from "zustand";
import axios from "axios";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import {
  StockReportState,
  StockReportApiResponse,
  StockReportFilters,
} from "@/types/stockReport";

export const useStockReportStore = create<StockReportState>((set, get) => ({
  reports: [],
  loading: false,
  error: null,
  pagination: null,
  page: 0,
  size: API_CONFIG.DEFAULT_PAGE_SIZE,
  filters: {},

  fetchReports: async (opts) => {
    const page = opts?.page ?? get().page;
    const size = opts?.size ?? get().size;
    const filters: StockReportFilters = { ...get().filters, ...(opts?.filters || {}) };

    set({ loading: true, error: null, page, size, filters });
    try {
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

      const response = await axios.get<StockReportApiResponse>(url);
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
        set({ error: response.data.message || "Failed to fetch stock reports", loading: false });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch stock reports", loading: false });
    }
  },

  setPage: (page) => set({ page }),
  setFilters: (filters) => set({ filters }),
}));


