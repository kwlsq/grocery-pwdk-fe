import { PaginationInfo } from "./common";

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

export interface CreateWarehouseDTO {
  storeID: string,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  isActive: boolean
}


export interface WarehouseState {
  pagination: PaginationInfo | null;
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  fetchWarehouses: (storeId: string) => Promise<void>;
  createWarehouse: (data: CreateWarehouseDTO) => Promise<void>;
}
