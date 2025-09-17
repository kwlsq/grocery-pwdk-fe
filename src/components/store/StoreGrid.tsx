'use client';

import { Store } from '@/types/store';
import SearchAndFilter from '../product/SearchAndFilter';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import StoreCard from './StoreCard';
import { cn } from '@/lib/utils';

interface StoreGridProps {
  stores: Store[];
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
  showSearchAndFilter?: boolean;
}

const StoreGrid = ({
  stores,
  loading = false,
  error = null,
  pagination,
  onSearch,
  onPageChange,
  showSearchAndFilter = false,
}: StoreGridProps) => {
  if (loading && stores.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && stores.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading stores
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      { onSearch && (
        <SearchAndFilter onSearch={onSearch} />
      )}

      {stores.length === 0 && !loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-semibold">
              No stores found
            </div>
            <p className="text-gray-400 mt-2">
              There are no stores available at the moment
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

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
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(i);
                  }}
                  isActive={pagination.currentPage === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pagination.currentPage + 1);
                }}
                className={cn(!pagination.hasNext && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default StoreGrid;
