// src/app/product-details/[id]/page.tsx
"use client"

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { useUserVerification } from '@/hooks/useUserVerification';
import { useAuthStore } from '@/store/authStore';
import DiscountCard from '@/components/discount/DiscountCard';
import Navbar from '../../../components/Navbar/Index';
import RedirectService from '@/services/redirectService';

export default function ProductDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedProduct } = useProductStore();
  const { canAccessFeature } = useUserVerification();
  const { isAuthenticated, user } = useAuthStore();

  if (!selectedProduct) return notFound();

  const primaryImage = selectedProduct.productImages.find(img => img.primary) || selectedProduct.productImages[0];
  const { price, weight, inventories } = selectedProduct.productVersionResponse;
  const totalStock = inventories.reduce((sum, inv) => sum + inv.stock, 0);

  const handleAuthRequired = () => {
    RedirectService.setIntendedRedirect(pathname);
    router.push('/auth');
  };

  const renderAddToCartButton = () => {
    if (totalStock === 0) {
      return (
        <button disabled className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed font-medium">
          Out of Stock
        </button>
      );
    }

    if (!isAuthenticated) {
      return (
        <button
          onClick={handleAuthRequired}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Login to Shop
        </button>
      );
    }

    if (!user?.verified) {
      return (
        <button
          disabled
          className="w-full bg-yellow-400 text-yellow-800 py-3 px-4 rounded-lg cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Verify Account to Shop
        </button>
      );
    }

    return (
      <button
        onClick={() => console.log('Add to cart:', selectedProduct.id)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a1 1 0 100-2 1 1 0 000 2zM9 21a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        Add to Cart
      </button>
    );
  };

  return (
    <div className='w-full'>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8 pt-8">
          <div className="flex-1">
            <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
              {primaryImage ? (
                <Image src={primaryImage.url} alt={selectedProduct.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="flex gap-2">
              {selectedProduct.productImages.map(img => (
                <div key={img.id} className="relative w-16 h-16 rounded overflow-hidden border border-gray-200">
                  <Image src={img.url} alt={selectedProduct.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className='flex-1 space-y-4'>
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <p className="text-gray-600 text-lg">{selectedProduct.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-green-600">${price.toFixed(2)}</span>
                <span className="text-gray-500">/ {weight}kg</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Available stocks:</span>
                <span className={`font-semibold ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>{totalStock}</span>
              </div>
              {renderAddToCartButton()}
            </div>
            <div className='flex flex-col'>
              <span>Promotions for this product</span>
              {selectedProduct.promotions.map((promotion) => (
                <div key={promotion.id}>
                  <DiscountCard discount={promotion} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}