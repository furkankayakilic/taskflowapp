import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Teams', href: '/teams', icon: UserGroupIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Messages', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)]">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
} 