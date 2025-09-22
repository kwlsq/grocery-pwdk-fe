export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CartApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CartItem[];
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  userId: string;
  getItemCount: () => number;
  fetchCartItems: () => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}
