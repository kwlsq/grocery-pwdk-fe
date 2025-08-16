'use client';

import { Store } from '../../types/store';
import Link from 'next/link';

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <Link href={`/store-details/${store.id}`} className="block" aria-label={`View details for ${store.name}`}>
        <div className="relative h-48 w-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm text-gray-600 font-medium">Store</span>
          </div>

          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              store.active 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {store.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-lg">
            {store.name}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {store.description}
          </p>

          <div className="flex items-start gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-500 line-clamp-2">
              {store.address}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ID: {store.id.slice(0, 8)}...
            </span>
            
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors duration-200">
                Edit
              </button>
              <button className={`text-xs px-3 py-1 rounded-lg transition-colors duration-200 ${
                store.active 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}>
                {store.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StoreCard;
