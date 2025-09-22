'use client';

import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { Discount } from '@/types/discount';

interface PromotionSelectorProps {
  discounts: Discount[];
  selectedPromotions: string[];
  setSelectedPromotions: (promotions: string[]) => void;
}

export default function PromotionSelector({
  discounts,
  selectedPromotions,
  setSelectedPromotions,
}: PromotionSelectorProps) {
  const now = new Date();

  const filteredDiscount = discounts.filter((discount) => {
    const end = new Date(discount.endAt);
    return end >= now;
  });

  if (filteredDiscount.length <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="block text-sm font-medium text-gray-700">Promotions</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredDiscount.map((discount) => {
          const isSelected = selectedPromotions.includes(discount.id);
          return (
            <button
              type="button"
              key={discount.id}
              onClick={() => {
                setSelectedPromotions(
                  selectedPromotions.includes(discount.id)
                    ? selectedPromotions.filter((id) => id !== discount.id)
                    : [...selectedPromotions, discount.id]
                );
              }}
              className={cn(
                "text-left p-4 border rounded-xl transition-colors",
                isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{discount.name}</span>
                <span className="text-xs text-gray-500">min Rp {discount.minPurchase.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{discount.description}</p>
              <span className="text-sm font-semibold text-green-700">
                {discount.unit === 'PERCENTAGE'
                  ? `${discount.value}%`
                  : (discount.unit === 'currency' ? `Rp ${discount.value.toLocaleString()}` : `B1G1`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
