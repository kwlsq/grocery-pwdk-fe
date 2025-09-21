'use client';

import { FC, useEffect, useState } from 'react';
import { useProductStore } from '@/store/productStore';

interface ProductSearchFilterProps {
  defaultSearch?: string;
  defaultCategory?: string;
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onChange: (params: { search: string; category: string; sortBy: string; sortDirection: 'asc' | 'desc' }) => void;
  debounceMs?: number;
}

const ProductSearchFilter: FC<ProductSearchFilterProps> = ({
  defaultSearch = '',
  defaultCategory = '',
  defaultSortBy = '',
  defaultSortDirection = 'asc',
  onChange,
  debounceMs = 400,
}) => {
  const { categories, fetchCategories } = useProductStore();
  const [search, setSearch] = useState(defaultSearch);
  const [category, setCategory] = useState(defaultCategory);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search, category, sortBy, sortDirection });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, category, sortBy, sortDirection, onChange, debounceMs]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="weight">Weight</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchFilter;


