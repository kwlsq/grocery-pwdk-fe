import { create } from "zustand";
import axios from "axios";
import { API_CONFIG, buildApiUrl } from "@/config/api";
import { SalesReportApiResponse, SalesReportFilters, SalesReportState } from "@/types/salesReport";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useSalesReportStore = create<SalesReportState>((set, get) => ({
  sales: [],
  loading: false,
  error: null,
  pagination: null,
  page: 0,
  size: API_CONFIG.DEFAULT_PAGE_SIZE,
  filters: {},

  fetchSales: async (opts) => {
    const page = opts?.page ?? get().page;
    const size = opts?.size ?? get().size;
    const filters: SalesReportFilters = {
      ...get().filters,
      ...(opts?.filters || {}),
    };

    set({ loading: true, error: null, page, size, filters });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES_REPORTS}`, {
        page,
        size,
        storeId: filters.storeId || "",
        categoryId: filters.categoryId || "",
        productId: filters.productId || "",
        startMonth: filters.startMonth || "",
        endMonth: filters.endMonth || "",
      });

      const response = await axios.get<SalesReportApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const data = response.data.data;
        set({
          sales: data.content,
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
        set({ error: response.data.message || "Failed to fetch sales reports", loading: false });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch sales reports", loading: false });
    }
  },

  setPage: (page) => set({ page }),
  setFilters: (filters) => set({ filters }),
}));


