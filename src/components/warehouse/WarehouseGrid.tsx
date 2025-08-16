'use client';

import { Warehouse } from '../../types/warehouse';
import WarehouseCard from './WarehouseCard';

interface WarehouseGridProps {
  warehouses: Warehouse[];
  loading?: boolean;
  error?: string | null;
}

const WarehouseGrid = ({ warehouses, loading = false, error = null }: WarehouseGridProps) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {warehouses.map((warehouse) => (
        <WarehouseCard key={warehouse.id} warehouse={warehouse} />
      ))}
    </div>
  );
};

export default WarehouseGrid;
