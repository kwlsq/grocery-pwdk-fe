export interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface WarehouseApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    content: Warehouse[];
  };
}


export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WarehouseState {
  pagination: PaginationInfo | null;
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  fetchWarehouses: (storeId: string) => Promise<void>;
}
