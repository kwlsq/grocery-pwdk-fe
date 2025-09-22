'use client';

import { Product } from '../../types/product';
import Image from 'next/image';
import EditProduct from './EditProductDialog';
import { useAuthStore } from '@/store/authStore';
import ProductStock from './ProductStockDialog';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { useUserVerification } from '@/hooks/useUserVerification';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setSelectedProduct } = useProductStore();
  const { canAccessFeature } = useUserVerification();
  const { price, weight } = product.productVersionResponse;


  const formattedPrice = price.toLocaleString('id-ID');
  const weightKg = weight / 1000;

const formattedWeight = weightKg.toLocaleString('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

  const primaryImage = product.productImages.find(img => img.primary) || product.productImages[0];
  const totalStock = product.productVersionResponse.inventories.reduce(
    (sum, inventory) => sum + inventory.stock, 0
  );

  const handleClick = () => {
    setSelectedProduct(product);
    router.push(`/product-details/${product.id}`);
  };

  const canAddToCart = canAccessFeature(true, false);

  const renderButton = () => {
    if (totalStock === 0) {
      return (
        <button disabled className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed">
          Out of Stock
        </button>
      );
    }

    if (!canAddToCart) {
      return (
        <button
          onClick={() => router.push('/auth')}
          className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Login to Shop
        </button>
      );
    }

    const canAddToCartVerified = canAccessFeature(true, true);
    
    if (!canAddToCartVerified) {
      return (
        <button
          disabled
          className="w-full bg-yellow-400 text-yellow-800 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
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
        onClick={() => onAddToCart?.(product.id)}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a1 1 0 100-2 1 1 0 000 2zM9 21a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        Add to Cart
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border">
      <div onClick={handleClick} className="cursor-pointer">
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

          {totalStock < 10 && totalStock > 0 && user?.role === 'ADMIN' && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Low Stock
            </div>
          )}

          {!canAddToCart && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Login Required
            </div>
          )}

          {canAddToCart && !canAccessFeature(true, true) && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Verify Account
            </div>
          )}
        </div>

        <div className="p-4">

          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-1 md:line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-green-600">
                Rp. {formattedPrice}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500">/{formattedWeight}kg</span>
            </div>

            <span className="hidden md:flex text-xs text-gray-500">
              {totalStock} in stock
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 w-full">
        {user?.role === 'ADMIN' ? (
          <div className='w-full flex gap-2' onClick={(e) => e.stopPropagation()}>
            <div className='w-full'>
              <EditProduct id={product.id} product={product} />
            </div>
            <div className='w-fit'>
              <ProductStock id={product.id} product={product} />
            </div>
          </div>
        ) : (
          renderButton()

        )}
      </div>
    </div>
  );
}

export default ProductCard;