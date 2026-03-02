import React from 'react';
import { Avatar } from './Avatar';

interface AvatarGroupProps {
  users: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarGroup({ users, max = 5, size = 'md' }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user) => (
        <div key={user.id} className="relative">
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size={size}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative">
          <div className={`flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium
            ${size === 'xs' ? 'w-6 h-6 text-xs' :
              size === 'sm' ? 'w-8 h-8 text-sm' :
              size === 'md' ? 'w-10 h-10 text-base' :
              size === 'lg' ? 'w-12 h-12 text-lg' :
              'w-14 h-14 text-xl'}`}
          >
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
} 