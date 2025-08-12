"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/cartStore";
import { useEffect } from "react";

const Header = () => {
  const router = useRouter();
  const { items, fetchCartItems, getItemCount } = useCartStore();

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleCartClick = () => {
    router.push("/cart");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-green-600">FreshGrocer</h1>
            <span className="ml-2 text-sm text-gray-500">
              Fresh groceries delivered to your door
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={handleCartClick}
                className="p-2 text-gray-600 hover:text-green-600 cursor-pointer transition-colors duration-200"
              >
                <img src="/cart.svg" alt="Cart" className="w-6 h-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
