import { PaginationInfo } from "./common";

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  active: boolean;
}

export interface StoreApiResponse {
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
      content: Store[];
    };
}

export interface UniqueStore {
  id: string,
  name: string
}

export interface StoreState {
  stores: Store[];
  store: Store | null
  uniqueStores: UniqueStore[]
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isFetching: boolean;
  pagination: PaginationInfo | null
  fetchStores: (
    page?: number,
    size?: number,
    search?: string,
  ) => Promise<void>;
  fetchStoreByUser: () => Promise<void>;
  fetchUniqueStores: () => Promise<void>;
}