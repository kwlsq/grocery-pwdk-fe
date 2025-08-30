import { PaginationInfo } from "./common"

export type StockReportSummaryItem = {
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
  fetchReports: (opts?: { page?: number; size?: number; filters?: StockReportFilters }) => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: StockReportFilters) => void
}


