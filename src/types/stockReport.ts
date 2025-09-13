import { PaginationInfo } from "./common"

export type StockReportSummaryItem = {
  productID: string
  productName: string
  productVersion: string
  storeName: string
  warehouseName: string
  month: string
  totalAddition: number
  totalReduction: number
  finalStock: number
  averagePrice: number
}

export type StockReportApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data: PaginationInfo & {
    content: StockReportSummaryItem[]
  }
}

export type ProductStockReportItem = {
  productName: string
  productVersion: string
  storeName: string
  warehouseName: string
  stockChange: number
  journal: string
  timestamp: string
  price: number
  changeType: string
}

export type ProductStockReportApiResponse = {
  success: boolean
  statusCode: number
  message: string
  data: PaginationInfo & {
    content: ProductStockReportItem[]
  }
}

export type StockReportFilters = {
  storeId?: string
  warehouseId?: string
  month?: string
  productName?: string
}

export type StockReportState = {
  reports: StockReportSummaryItem[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  page: number
  size: number
  filters: StockReportFilters
  lastFetched: number | null
  isFetching: boolean
  fetchReports: (opts?: { page?: number; size?: number; filters?: StockReportFilters }) => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: StockReportFilters) => void
  // Product-level report state
  productReports: ProductStockReportItem[]
  productPagination: PaginationInfo | null
  productPage: number
  productSize: number
  productMonth?: string
  fetchProductReports: (opts: { productId: string; page?: number; size?: number; month?: string }) => Promise<void>
  setProductPage: (page: number) => void
  setProductMonth: (month?: string) => void
}


