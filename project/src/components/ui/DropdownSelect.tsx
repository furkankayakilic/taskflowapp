import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({ options, value, onChange, placeholder }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}; 