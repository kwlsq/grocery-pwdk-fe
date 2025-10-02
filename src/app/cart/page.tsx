// src/app/cart/page.tsx
"use client";

import { useEffect } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useCartStore } from "../../store/cartStore";
import { CartItem as CartItemType } from "../../types/cart";
import CartItem from "../../components/cart/CartItem";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import { VerificationRequiredModal } from "@/components/auth/VerificationRequiredModal";
import Link from "next/link";

const CartPage = () => {
  const { 
    isLoading: authLoading, 
    isAuthenticated, 
    showAuthModal, 
    showVerificationModal,
    handleGoToAuth, 
    handleGoHome,
    handleGoToVerification,
    accessDenied 
  } = useProtectedRoute({
    requireAuth: true,
    requireVerification: true, // Cart requires verification
    allowedRoles: ['CUSTOMER']
  });

  const { items, loading, error, fetchCartItems, updateItemQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated && !authLoading && !showVerificationModal) {
      fetchCartItems();
    }
  }, [isAuthenticated, authLoading, showVerificationModal, fetchCartItems]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      await updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if access denied (will redirect automatically)
  if (accessDenied) {
    return null;
  }

  // Show verification modal if needed
  if (showVerificationModal) {
    return (
      <VerificationRequiredModal 
        isOpen={showVerificationModal}
        onResendVerification={handleGoToVerification}
        onGoHome={handleGoHome}
        featureName="your shopping cart"
      />
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthRequiredModal 
        isOpen={showAuthModal}
        onGoToAuth={handleGoToAuth}
        onGoHome={handleGoHome}
        pageName="your shopping cart"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchCartItems()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
              <Link
                href="/"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="px-6 py-4">
                {items.map((item: CartItemType) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleClearCart}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;