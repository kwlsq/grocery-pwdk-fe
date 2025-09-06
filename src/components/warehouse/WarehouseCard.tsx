'use client';

import { Warehouse } from '../../types/warehouse';
import EditWarehouseDialog from './EditWarehouseDialog';

interface WarehouseCardProps {
  warehouse: Warehouse;
}

const WarehouseCard = ({ warehouse }: WarehouseCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <span className="text-sm text-gray-600 font-medium">Warehouse</span>
        </div>

        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${warehouse.active
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
            }`}>
            {warehouse.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-lg">
          {warehouse.name}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              Lat: {warehouse.latitude.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              Long: {warehouse.longitude.toFixed(4)}
            </span>
          </div>
        </div>

        <EditWarehouseDialog id={warehouse.id} warehouse={warehouse}/>
      </div>
    </div>
  );
};

export default WarehouseCard;
