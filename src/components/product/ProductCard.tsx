'use client';

import { Product } from '../../types/product';
import Image from 'next/image';
import Link from 'next/link';
import EditProduct from './EditProductDialog';
import { useAuthStore } from '@/store/authStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuthStore();

  // Get the primary image or first image available
  const primaryImage = product.productImages.find(img => img.primary) || product.productImages[0];
  
  // Get total stock from all inventories
  const totalStock = product.productVersionResponse.inventories.reduce(
    (sum, inventory) => sum + inventory.stock, 
    0
  );

  // Get price and weight from product version
  const { price, weight } = product.productVersionResponse;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <Link href={`/product-details/${product.id}`} className="block" aria-label={`View details for ${product.name}`}>
        <div className="relative h-48 w-full">
          {primaryImage ? (
            <Image
              src={primaryImage.url ?? "/Product Image Placeholder.webp"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {totalStock < 10 && totalStock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Low Stock
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Version {product.productVersionResponse.versionNumber}
            </span>
            <span className="text-xs text-gray-500">
              {weight}kg
            </span>
          </div>

          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">
                Rp. {price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">/kg</span>
            </div>

            <span className="text-xs text-gray-500">
              {totalStock} in stock
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {user?.role === 'ADMIN' ? (
          <EditProduct id={product.id} product={product} />
        ) : (
          <button
            disabled={totalStock === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
} 

export default ProductCard;