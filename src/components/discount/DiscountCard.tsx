'use client';

import { Discount } from '../../types/discount';

interface DiscountCardProps {
  discount: Discount;
}

const DiscountCard = ({ discount }: DiscountCardProps) => {
  const isActive = new Date(discount.startAt) <= new Date() && new Date(discount.endAt) >= new Date();
  const formattedRange = `${new Date(discount.startAt).toLocaleDateString()} - ${new Date(discount.endAt).toLocaleDateString()}`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full capitalize">
            {discount.type.toLowerCase()}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
          {discount.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {discount.description}
        </p>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">
              {discount.unit === 'percentage' ? `${discount.value}%` : (discount.unit === 'currency' ? `Rp ${discount.value.toLocaleString()}` : `B1G1`)}
            </span>
            <span className="text-xs text-gray-500">min Rp {discount.minPurchase.toLocaleString()}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">{formattedRange}</div>
      </div>
    </div>
  );
}

export default DiscountCard;