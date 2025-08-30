import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import DiscountCard from '@/components/discount/DiscountCard';

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {

  const product = await useProductStore.getState().fetchProductById(params.id);

  if (!product) return notFound();

  const primaryImage = product.productImages.find(img => img.primary) || product.productImages[0];
  const { price, weight, versionNumber, inventories } = product.productVersionResponse;
  const totalStock = inventories.reduce((sum, inv) => sum + inv.stock, 0);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery */}
        <div className="flex-1">
          <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-2">
            {product.productImages.map(img => (
              <div key={img.id} className="relative w-16 h-16 rounded overflow-hidden border border-gray-200">
                <Image src={img.url} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className='flex-1 space-y-4'>
          {/* Product Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-green-600">${price.toFixed(2)}</span>
              <span className="text-gray-500">/ {weight}kg</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Version {versionNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Stock:</span>
              <span className={`font-semibold ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>{totalStock}</span>
            </div>
            <button
              disabled={totalStock === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mt-4"
            >
              {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
          <div className='flex'>
            {product.promotions.map((promotion) => (
              <div key={promotion.id}>
                <DiscountCard discount={promotion} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
