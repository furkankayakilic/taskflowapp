import React from 'react';
import { getInitials } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
}

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  borderColor, 
  className,
  ...props 
}: AvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };
  
  const initials = getInitials(name);
  const randomColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  // Create a stable color based on the name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % randomColors.length;
  const bgColor = randomColors[colorIndex];
  
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full text-white ${
        sizeClasses[size]
      } ${borderColor ? `border-2 ${borderColor}` : ''} ${className || ''}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center rounded-full ${bgColor}`}>
          {initials}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ 
  users, 
  max = 3, 
  size = 'sm' 
}: { 
  users: { id: string; name: string; avatarUrl?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user) => (
        <Avatar
          key={user.id}
          src={user.avatarUrl}
          name={user.name}
          size={size}
          borderColor="border-white"
          className="ring-2 ring-white"
        />
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`
            inline-flex items-center justify-center rounded-full 
            bg-gray-200 text-xs text-gray-600 ring-2 ring-white
            ${size === 'xs' ? 'h-6 w-6' : size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : size === 'lg' ? 'h-12 w-12' : 'h-16 w-16'}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}