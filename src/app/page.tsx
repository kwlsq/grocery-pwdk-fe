import Header from '@/components/layout/Header';
import ProductGrid from '@/components/product/ProductGrid';
import LocationPrompt from '@/components/location/LocationPrompt';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Our Products
          </h2>
          <p className="text-gray-600">
            Discover our selection of fresh and quality groceries
          </p>
        </div>
        
        <ProductGrid />
      </main>
    </div>
  );
}
