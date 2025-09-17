'use client';

import { Warehouse } from '../../types/warehouse';
import WarehouseCard from './WarehouseCard';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

interface WarehouseGridProps {
  warehouses: Warehouse[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange?: (newPage: number) => void;
}

const WarehouseGrid = ({ warehouses, loading = false, error = null, pagination, onPageChange }: WarehouseGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading warehouses
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-semibold">
            No warehouses found
          </div>
          <p className="text-gray-400 mt-2">
            This store doesn&apos;t have any warehouses yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {warehouses.map((warehouse) => (
          <WarehouseCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pagination.currentPage - 1);
                }}
                className={cn(!pagination.hasPrevious && 'pointer-events-none opacity-50')}
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
                className={cn(!pagination.hasNext && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default WarehouseGrid;
