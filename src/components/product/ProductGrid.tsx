'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { products, loading, error, pagination, fetchProducts } = useProductStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts(currentPage, 10, searchTerm, selectedCategory);
  }, [fetchProducts, currentPage, searchTerm, selectedCategory]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page when searching
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading products
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => fetchProducts(currentPage, 10, searchTerm, selectedCategory)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="fruits">Fruits</option>
              <option value="vegetables">Vegetables</option>
              <option value="dairy">Dairy</option>
              <option value="bakery">Bakery</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-semibold">
              No products found
            </div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevious}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === i
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Results Info */}
      {pagination && (
        <div className="text-center text-gray-600 text-sm">
          Showing {pagination.page * pagination.size + 1} to{' '}
          {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
          {pagination.totalElements} products
        </div>
      )}
    </div>
  );
} 