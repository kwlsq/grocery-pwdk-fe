import { PaginationInfo } from "./common";

export interface Warehouse {
  storeID: string;
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  active: boolean;
  warehouseAdmin: WarehouseAdmin
}

export interface WarehouseAdmin {
  userID: string,
  userName: string,
  userRole: string,
  photo: string,
  phoneNumber: string
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
  storeAdminID?: string | null
}

export interface UpdateWarehouseDTO {
  storeID: string,
  name?: string,
  address?: string,
  latitude?: number,
  longitude?: number,
  isActive?: boolean
  storeAdminID?: string
}

export interface UniqueWarehouse {
  id: string,
  name: string
}

export interface WarehouseState {
  pagination: PaginationInfo | null;
  warehouses: Warehouse[];
  uniqueWarehouses: UniqueWarehouse[];
  loading: boolean;
  error: string | null;
  fetchWarehouses: (
    storeId: string,
    page?: number,
    size?: number,
    search?: string,
    sortBy?: string,
    sortDirection?: string,
  ) => Promise<void>;
  createWarehouse: (data: CreateWarehouseDTO) => Promise<void>;
  fetchUniqueWarehouse: (storeId: string) => Promise<void>;
}
