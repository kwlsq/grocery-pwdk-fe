'use client';

import { FC, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">ID</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="createdAt">Newest</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Asc</SelectItem>
          <SelectItem value="desc">Desc</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WarehouseSearchFilter;


