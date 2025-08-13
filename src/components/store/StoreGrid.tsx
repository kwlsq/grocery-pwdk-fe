'use client';

import { Store } from '../../types/store';
import StoreCard from './StoreCard';

interface StoreGridProps {
  stores: Store[];
  loading?: boolean;
  error?: string | null;
}

const StoreGrid = ({ stores, loading = false, error = null }: StoreGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
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

  if (stores.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};

export default StoreGrid;
