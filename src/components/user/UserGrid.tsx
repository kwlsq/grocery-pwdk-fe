'use client';

import { FC } from 'react';
import { User } from '@/types/user';
import UserCard from './UserCard';

interface UserGridProps {
  users: User[];
  loading: boolean;
  error?: string | null;
}

const UserGrid: FC<UserGridProps> = ({ users, loading, error }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UserGrid;


