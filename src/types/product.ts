import { PaginationInfo } from "./common";
import { Discount } from "./discount";

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
  inventories: Inventory[];
  promotions: Discount[]
}

export interface ProductCategory {
  id: string;
  parentID: string;
  name: string;
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

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  weight: number;
  categoryID: string;
  storeID: string;
  inventories: {
    warehouseID: string;
    stock: number;
  }[];
}

export interface UpdateProductDTO {
  name: string;
  description: string;
  price: number;
  weight: number;
  categoryID: string;
  changeReason: string;
}

export interface ProductState {
  categories: ProductCategory[];
  products: Product[];
  productsThisStore: Product[],
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
  fetchProductByStoreID: (
    id: string, 
    page?: number,
    size?: number,
    search?: string,
    category?: string,
    sort?: string
  ) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: CreateProductDTO) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDTO) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
} 