'use client';
import { FC } from 'react';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';
import EditUserDialog from './EditUserDialog';
import { useUsersStore } from '@/store/userStore';

interface UserCardProps {
  user: User;
}

const roleColor: Record<User['role'], string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-green-100 text-green-700',
};

const UserCard: FC<UserCardProps> = ({ user }) => {

  const { deleteUser } = useUsersStore();


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500">
        {user.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoUrl} alt={user.fullName ?? user.email} className="h-full w-full object-cover" />
        ) : (
          <span className="font-semibold">{(user.fullName || user.email).charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{user.fullName ?? '—'}</p>
          {user.verified && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Verified</span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{user.email}</p>
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${roleColor[user.role]}`}>{user.role}</span>
      </div>
      <div className={cn('flex h-full gap-2', user.role !== 'MANAGER' && "hidden")}>
        <EditUserDialog user={user}/>
      </div>
      
    </div>
  );
};

export default UserCard;


