'use client';

import { FC, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DiscountSearchFilterProps {
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  defaultUnit?: Unit;
  onChange: (params: { unit: Unit; search: string; sortBy: string; sortDirection: 'asc' | 'desc' }) => void;
  debounceMs?: number;
}

type Unit = '' | 'PERCENTAGE' | 'NOMINAL' | 'PRODUCT' | 'all';

const DiscountSearchFilter: FC<DiscountSearchFilterProps> = ({
  defaultSearch = '',
  defaultSortBy = 'createdAt',
  defaultSortDirection = 'desc',
  defaultUnit = 'all',
  onChange,
  debounceMs = 400,
}) => {
  const [search, setSearch] = useState(defaultSearch);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({unit, search, sortBy, sortDirection });
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection, onChange, debounceMs, unit]);

  return (
    <div className="flex items-center gap-2">

      <div className="w-full sm:w-60">
        <Select
          value={unit}
          onValueChange={(value) => setUnit(value as Unit)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
            <SelectItem value="NOMINAL">Nominal</SelectItem>
            <SelectItem value="PRODUCT">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search discounts..."
        className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-md"
      />

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Newest</SelectItem>
          <SelectItem value="name">Name</SelectItem>
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

export default DiscountSearchFilter;