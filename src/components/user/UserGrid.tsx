'use client';

import { FC } from 'react';
import { User } from '@/types/user';
import UserCard from './UserCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

interface UserGridProps {
  users: User[];
  loading: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange?: (newPage: number) => void;
}

const UserGrid: FC<UserGridProps> = ({
  users,
  loading,
  error,
  pagination,
  onPageChange, }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading users</div>
          <div className="text-gray-600 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="text-center text-gray-500">No users found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className={cn(!pagination.hasPrevious && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => onPageChange(i)}
                  isActive={pagination.currentPage === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className={cn(!pagination.hasNext && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default UserGrid;


