import { create } from 'zustand';
import axios from 'axios';
import { Product, ProductState, ApiResponse } from '../types/product';
import { buildApiUrl, API_CONFIG } from '../config/api';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  cart: [],
  pagination: null,

  fetchProducts: async (page = 0, size = 10, search = '', category = '', sort = '') => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<ApiResponse>(buildApiUrl(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PRODUCTS, {
        page,
        size,
        search,
        category,
        sort
      }));
      
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
          loading: false 
        });
      } else {
        set({ 
          error: response.data.message || 'Failed to fetch products', 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products', 
        loading: false 
      });
    }
  },

  addToCart: (product: Product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // If item already exists, you might want to increase quantity
      // For now, we'll just add it again
      set({ cart: [...cart, product] });
    } else {
      set({ cart: [...cart, product] });
    }
  },

  removeFromCart: (productId: string) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.id !== productId) });
  }
})); 