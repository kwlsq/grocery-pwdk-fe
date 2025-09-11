'use client';

import { FC } from 'react';
import DiscountCard from './DiscountCard';
import { Discount } from '@/types/discount';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

interface DiscountGridProps {
  discounts: Discount[];
  loading: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange?: (newPage: number) => void;
}

const DiscountGrid: FC<DiscountGridProps> = ({
  discounts,
  loading,
  error,
  pagination,
  onPageChange,
}) => {

  if (loading && discounts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && discounts.length === 0) {
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

      {/* Discounts Grid */}
      {discounts.length === 0 && !loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-semibold">
              No discounts found
            </div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {discounts.map((discount) => (
            <DiscountCard key={discount.id} discount={discount} />
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
                className={cn(!pagination.hasPrevious && "pointer-events-none opacity-50")}
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
                className={cn(!pagination.hasNext && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default DiscountGrid;
