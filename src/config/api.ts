// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    PRODUCTS: '/products/public',
    PRODUCTS_ADMIN: '/products/admin',
    CATEGORY: '/products/public/categories',
    PRODUCTS_CREATE: '/products/create',
    CART: '/cart-items',
    WAREHOUSE: '/warehouse',
    IMAGE: '/images'
  },
  DEFAULT_PAGE_SIZE: 10,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  return url.toString();
}; 