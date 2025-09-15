import { create } from "zustand";
import axios from "axios";
import {
  ProductState,
  ApiResponse,
  ProductCategory,
  CreateCategoryRequest,
  UniqueProduct,
} from "../types/product";
import { buildApiUrl, API_CONFIG } from "../config/api";

const getAuthToken = (): string => {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && sessionStorage.getItem("accessToken")) ||
    "";

  return token;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  productsThisStore: [],
  uniqueProducts: [],
  categories: [],
  loading: false,
  error: null,
  pagination: null,

  fetchProducts: async (
    page = 0,
    size = 12,
    search = "",
    category = "",
    sort = "",
    userLatitude?: number,
    userLongitude?: number,
    maxDistanceKM?: number
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<ApiResponse>(
        buildApiUrl(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS, {
          page,
          size,
          search,
          category,
          sort,
          ...(userLatitude !== undefined ? { userLatitude: userLatitude } : {}),
          ...(userLongitude !== undefined
            ? { userLongitude: userLongitude }
            : {}),
          ...(maxDistanceKM !== undefined
            ? { maxDistanceKM: maxDistanceKM }
            : {}),
        })
      );

      if (response.data.success) {
        set({
          products: response.data.data.content,
          pagination: {
            page: response.data.data.page,
            size: response.data.data.size,
            totalElements: response.data.data.totalElements,
            totalPages: response.data.data.totalPages,
            hasNext: response.data.data.hasNext,
            hasPrevious: response.data.data.hasPrevious,
          },
          loading: false,
        });
      } else {
        set({
          error: response.data.message || "Failed to fetch products",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
        loading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`
      );
      if (response.data.success) {
        const product = response.data.data;
        set({ products: [product], loading: false });
        return product;
      } else {
        throw new Error(response.data.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch product",
        loading: false,
      });
      return null;
    }
  },

  fetchProductByStoreID: async (
    id: string,
    page = 0,
    size = 12,
    search = "",
    category = "",
    sort = ""
  ) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      const url = buildApiUrl(
        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS_ADMIN + "/" + id,
        {
          page,
          size,
          search,
          category,
          sort,
        }
      );

      const response = await axios.get<ApiResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          productsThisStore: response.data.data.content,
          pagination: {
            page: response.data.data.page,
            size: response.data.data.size,
            totalElements: response.data.data.totalElements,
            totalPages: response.data.data.totalPages,
            hasNext: response.data.data.hasNext,
            hasPrevious: response.data.data.hasPrevious,
          },
          loading: false,
        });
      } else {
        set({
          error: response.data.message || "Failed to fetch products",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch product",
        loading: false,
      });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });

    try {
      //Check if categories exist in localStorage
      const cachedCategories = localStorage.getItem("categories");
      
      if (cachedCategories) {
        set({ categories: JSON.parse(cachedCategories), loading: false });
        return; // ✅ Skip API call if cache exists
      }

      //Fetch from API if no cache
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY}`
      );

      if (response.data.success) {
        const categories: ProductCategory[] = response.data.data;

        //Save to state and localStorage
        set({ categories, loading: false });
        localStorage.setItem("categories", JSON.stringify(categories));
      } else {
        set({
          error: response.data.message || "Failed to fetch categories",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
        loading: false,
      });
    }
  },

  createCategory: async (data: CreateCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY_CRUD}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      set(() => ({ loading: false }));
      return response.data;
    } catch (e) {
      console.error(e);
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORY_CRUD}/${id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CRUD}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      set((state) => ({
        products: [response.data, ...state.products],
        loading: false,
      }));

      return response.data.data.id;
    } catch (e) {
      console.error(e);
    }
  },

  updateProduct: async (id, data) => {
    if (!id?.trim()) {
      throw new Error("Product ID is required");
    }

    set({ loading: true, error: null });

    try {
      const token = getAuthToken();

      const url = `${API_CONFIG.BASE_URL}${
        API_CONFIG.ENDPOINTS.PRODUCTS_CRUD
      }/${id.trim()}`;

      const response = await axios.patch(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        const updatedProduct = response.data.data;

        // Update the product in both arrays
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? updatedProduct : product
          ),
          productsThisStore: state.productsThisStore.map((product) =>
            product.id === id ? updatedProduct : product
          ),
          loading: false,
        }));

        return updatedProduct;
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      const errorMessage = "Error : " + error;
      console.error("Error updating product:", errorMessage);
      set({
        error: errorMessage,
        loading: false,
      });
      throw error; // Re-throw for component error handling
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CRUD}/${id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
  },

  updateProductStock: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const token = getAuthToken();

      await axios.patch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CRUD}/stocks/${id}`,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
  },

  fetchUniqueProduct: async () => {
    set({ loading: true, error: null });

    try {
      const token = getAuthToken();

      //Fetch from API if no cache
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CRUD}/unique`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const uniqueProducts: UniqueProduct[] = response.data.data;

        //Save to state and localStorage
        set({ uniqueProducts, loading: false });
      } else {
        set({
          error: response.data.message || "Failed to fetch categories",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
        loading: false,
      });
    }
  },
}));
