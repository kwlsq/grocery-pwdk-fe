'use client';

import { useProductStore } from '@/store/productStore';
import { FC, useState } from 'react';

interface SearchAndFilterProps {
  onSearch: (searchTerm: string, category: string, sortBy?: string, sortDirection?: string) => void;
}

const SearchAndFilter: FC<SearchAndFilterProps> = ({
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { categories } = useProductStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedCategory, sortField || '', sortOrder || 'asc');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Sort by</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="weight">Weight</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchAndFilter;
