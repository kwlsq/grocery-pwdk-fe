import { create } from "zustand";
import axios from "axios";
import { CartState, CartApiResponse } from "../types/cart";
import { buildApiUrl, API_CONFIG } from "../config/api";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  userId: 'b3b8c7e2-1234-4a5b-9cde-123456789abc', // Default userId for demo

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  fetchCartItems: async () => {
    set({ loading: true, error: null });
    try {
      const userId = get().userId;
      const response = await axios.get<CartApiResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}?userId=${userId}`
      );

      if (response.data.success) {
        set({
          items: response.data.data,
          loading: false,
        });
      } else {
        set({
          error: response.data.message || "Failed to fetch cart items",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch cart items",
        loading: false,
      });
    }
  },

  updateItemQuantity: async (itemId: string, quantity: number) => {
   
  },

  removeItem: async (itemId: string) => {
    set({ loading: true, error: null });
    try {
      const userId = get().userId;
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CART}/${itemId}?userId=${userId}`
      );

      if (response.data.success) {
        // Refresh cart items after removal
        await get().fetchCartItems();
      } else {
        set({
          error: response.data.message || "Failed to remove item",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to remove item",
        loading: false,
      });
    }
  },

  clearCart: async () => {
    
  },
}));
