import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Dropdown({
  children,
  trigger,
  align = 'left',
  width = 'auto',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const widthClasses = {
    auto: 'min-w-[10rem]',
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
  };
  
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  // Close dropdown when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);
  
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            alignClasses[align],
            widthClasses[width],
            className
          )}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  destructive?: boolean;
}

export function DropdownItem({
  children,
  icon,
  className,
  destructive = false,
  ...props
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'text-gray-700 hover:bg-gray-100',
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownSelectProps<T> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DropdownSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className,
  disabled = false,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  return (
    <div className={cn('relative inline-block w-full', className)} ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.value.toString()}
                className={cn(
                  'cursor-pointer select-none relative px-4 py-2 text-sm',
                  option.value === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}