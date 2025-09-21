'use client';

import { FC, useEffect, useState } from 'react';

interface WarehouseSearchFilterProps {
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onChange: (params: { search: string; sortBy: string; sortDirection: 'asc' | 'desc' }) => void;
  debounceMs?: number;
}

const WarehouseSearchFilter: FC<WarehouseSearchFilterProps> = ({
  defaultSearch = '',
  defaultSortBy = 'id',
  defaultSortDirection = 'asc',
  onChange,
  debounceMs = 400,
}) => {
  const [search, setSearch] = useState(defaultSearch);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ search, sortBy, sortDirection });
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection, onChange, debounceMs]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search warehouses..."
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="id">ID</option>
        <option value="name">Name</option>
        <option value="createdAt">Created At</option>
      </select>
      <select
        value={sortDirection}
        onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
        className="px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>
    </div>
  );
};

export default WarehouseSearchFilter;


