import { create } from "zustand";
import axios from "axios";
import { ProductState, ApiResponse, ProductCategory } from "../types/product";
import { buildApiUrl, API_CONFIG } from "../config/api";

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  pagination: null,

  fetchProducts: async (
    page = 0,
    size = 10,
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
}));
