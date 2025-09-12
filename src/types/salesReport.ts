import { PaginationInfo } from "./common";

export type SalesReportItem = {
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

export type SalesReportApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: PaginationInfo & {
    content: SalesReportItem[];
  };
};

export type SalesReportFilters = {
  storeId?: string;
  categoryId?: string;
  productId?: string;
  startMonth?: string; // YYYY-MM
  endMonth?: string;   // YYYY-MM
};

export type SalesReportState = {
  sales: SalesReportItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  page: number;
  size: number;
  filters: SalesReportFilters;
  fetchSales: (opts?: { page?: number; size?: number; filters?: SalesReportFilters }) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: SalesReportFilters) => void;
};


