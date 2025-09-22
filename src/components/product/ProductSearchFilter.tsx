'use client';

import { FC, useEffect, useState } from 'react';
import { useProductStore } from '@/store/productStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
      const categoryValue = category === 'all' ? '' : category;
      onChange({ search, category: categoryValue, sortBy, sortDirection });
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
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort by</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="createdAt">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select
            value={sortDirection}
            onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchFilter;


