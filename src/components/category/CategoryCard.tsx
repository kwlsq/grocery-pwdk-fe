"use client";

import { ProductCategory } from '@/types/product';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function CategoryCard({ category, onDelete }: { category: ProductCategory; onDelete: (id: string) => void }) {

  const { user } = useAuthStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
      <span className="font-medium text-gray-900">{category.name}</span>
      <button
        className={cn("text-red-600 hover:text-red-700", user?.role === 'MANAGER' && "hidden")}
        aria-label={`Delete ${category.name}`}
        onClick={() => onDelete(category.id)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}


