'use client';
import { FC } from 'react';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
}

const roleColor: Record<User['role'], string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-green-100 text-green-700',
};

const UserCard: FC<UserCardProps> = ({ user }) => {
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
        <div className='text-gray-300'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" />
          </svg>
        </div>
        <div className='text-red-300'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UserCard;


