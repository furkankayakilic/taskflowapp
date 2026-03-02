import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, LogOut, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './ui/Avatar';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and desktop navigation */}
          <div className="flex items-center space-x-10">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-primary rounded-md p-1.5 text-white mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">TaskFlow</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/teams" className="text-gray-700 hover:text-primary transition-colors">
                Teams
              </Link>
              <Link to="/projects" className="text-gray-700 hover:text-primary transition-colors">
                Projects
              </Link>
              <Link to="/calendar" className="text-gray-700 hover:text-primary transition-colors">
                Calendar
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-primary transition-colors">
                Messages
              </Link>
            </nav>
          </div>
          
          {/* Search, notifications and user menu */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={<Search size={16} className="text-gray-400" />}
                className="w-56 bg-gray-50 focus:bg-white"
              />
            </form>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="relative" 
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {user ? (
              <Dropdown
                trigger={
                  <button className="flex items-center">
                    <Avatar 
                      src={user.avatarUrl} 
                      name={user.name} 
                      size="sm" 
                    />
                  </button>
                }
                align="right"
                width="sm"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownItem icon={<User size={16} />} onClick={() => navigate('/profile')}>
                  Profile
                </DropdownItem>
                <DropdownItem icon={<Settings size={16} />} onClick={() => navigate('/settings')}>
                  Settings
                </DropdownItem>
                <DropdownItem icon={<LogOut size={16} />} onClick={handleLogout} destructive>
                  Logout
                </DropdownItem>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-3"
            >
              <div className="py-2">
                <form onSubmit={handleSearch} className="mb-4">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startIcon={<Search size={16} className="text-gray-400" />}
                    className="w-full bg-gray-50"
                  />
                </form>
                
                <nav className="flex flex-col space-y-3">
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/teams" 
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Teams
                  </Link>
                  <Link 
                    to="/projects" 
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Projects
                  </Link>
                  <Link 
                    to="/calendar" 
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Calendar
                  </Link>
                  <Link 
                    to="/chat" 
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}