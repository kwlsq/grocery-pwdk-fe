'use client';

import { FC, useEffect, useState } from 'react';

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
  }, [search, role, sortBy, sortDirection, debounceMs]);

  return (
    <div className="flex gap-3 items-center w-full sm:w-auto">
      <div className="w-full sm:w-60">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All</option>
          <option value="MANAGER">Manager</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-md"
      />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="createdAt">Newest</option>
        <option value="fullName">Name</option>
        <option value="email">Email</option>
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

export default UserSearchFilter;


