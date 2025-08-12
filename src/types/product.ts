export interface ProductImage {
  id: string;
  url: string;
  primary: boolean;
}

export interface Inventory {
  stock: number;
  warehouseID: string;
}

export interface ProductVersion {
  versionNumber: number;
  price: number;
  weight: number;
  inventories: Inventory[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  productVersionResponse: ProductVersion;
  productImages: ProductImage[];
}

export interface ProductCategory {
  id: string;
  parentID: string;
  name: string;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse {
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
    content: Product[];
  };
}

export interface ProductState {
  categories: ProductCategory[];
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchProducts: (
    page?: number,
    size?: number,
    search?: string,
    category?: string,
    sort?: string,
    userLatitude?: number,
    userLongitude?: number,
    maxDistanceKM?: number
  ) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product>;
  fetchCategories: () => Promise<void>;
} 