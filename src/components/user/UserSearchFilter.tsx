'use client';

import { FC, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Role = '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN' | 'all';

interface UserSearchFilterProps {
  defaultSearch?: string;
  defaultRole?: Role;
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onChange: (params: { search: string; role: Role; sortBy: string; sortDirection: 'asc' | 'desc' }) => void;
  debounceMs?: number;
}

const UserSearchFilter: FC<UserSearchFilterProps> = ({
  defaultSearch = '',
  defaultRole = 'all',
  defaultSortBy = 'createdAt',
  defaultSortDirection = 'desc',
  onChange,
  debounceMs = 400,
}) => {
  const [search, setSearch] = useState(defaultSearch);
  const [role, setRole] = useState<Role>(defaultRole);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search, role, sortBy, sortDirection });
    }, debounceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, sortBy, sortDirection, debounceMs]);

  return (
    <div className="flex gap-3 items-center w-full sm:w-auto">
      <div className="w-full sm:w-60">
        <Select
          value={role}
          onValueChange={(value) => setRole(value as Role)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-md"
      />

      <Select
        value={sortBy}
        onValueChange={setSortBy}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Newest</SelectItem>
          <SelectItem value="fullName">Name</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortDirection}
        onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
      >
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

export default UserSearchFilter;


