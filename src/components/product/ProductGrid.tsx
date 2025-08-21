'use client';

import { FC, useEffect, useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { useLocationStore } from '../../store/locationStore';
import ProductCard from './ProductCard';
import LocationPrompt from '../location/LocationPrompt';
import SearchAndFilter from './SearchAndFilter';
import { Product } from '@/types/product';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange?: (newPage: number) => void;
  onSearch?: (searchTerm: string, category: string) => void;
  categories?: { id: string; name: string }[];
  showSearchAndFilter?: boolean;
}

const ProductGrid: FC<ProductGridProps> = ({
  products,
  loading,
  error,
  pagination,
  onPageChange,
  onSearch,
  categories = [],
  showSearchAndFilter = false,
}) => {

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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section - Only show when showSearchAndFilter is true */}
      {showSearchAndFilter && onSearch && (
        <SearchAndFilter onSearch={onSearch} categories={categories} />
      )}

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
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className={!pagination.hasPrevious ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => onPageChange(i)}
                  isActive={pagination.currentPage === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductGrid;
