"use client";

import { ProductCategory } from '@/types/product';
import CategoryCard from './CategoryCard';

export default function CategoryGrid({ categories, onDelete }: { categories: ProductCategory[]; onDelete: (id: string) => void }) {
  if (!categories || categories.length === 0) {
    return <div className="text-center text-gray-500">No categories yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} onDelete={onDelete} />
      ))}
    </div>
  );
}


