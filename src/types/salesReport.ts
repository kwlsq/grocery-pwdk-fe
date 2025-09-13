import { PaginationInfo } from "./common";

export interface SalesReportItem {
  updatedAt: string;
  orderId: string;
  status: string;
  storeId: string;
  storeName: string;
  totalRevenue: number;
  items: Array<{
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    quantity: number;
    price: number;
    revenue: number;
  }>;
};

export interface SalesReportApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PaginationInfo & {
    content: SalesReportItem[];
  };
};

export interface SalesReportFilters {
  storeId?: string;
  categoryId?: string;
  productId?: string;
  startMonth?: string;
  endMonth?: string;
};

export interface MonthlyCount {
  month: string;
  orderCount: number
}

export interface SalesReportState {
  sales: SalesReportItem[];
  monthlySales: MonthlyCount[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  page: number;
  size: number;
  filters: SalesReportFilters;
  lastFetched: number | null;
  isFetching: boolean;
  fetchSales: (opts?: { page?: number; size?: number; filters?: SalesReportFilters }) => Promise<void>;
  fetchMonthlySales: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: SalesReportFilters) => void;
};


