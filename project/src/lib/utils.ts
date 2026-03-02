import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatString = 'MMM dd, yyyy'): string {
  if (!date) return '';
  try {
    console.log('Formatting date:', date, typeof date);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    console.log('Converted to Date object:', dateObj);
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export const priorityColorMap: Record<string, { color: string, bgColor: string }> = {
  low: { color: 'text-green-700', bgColor: 'bg-green-100' },
  medium: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  high: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  urgent: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

export function getRandomColor(): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-teal-500',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getFileIconByType(fileType: string): string {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf')) return 'file-text';
  if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'file-spreadsheet';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'archive';
  if (fileType.includes('code') || fileType.includes('javascript') || fileType.includes('typescript')) return 'code';
  return 'file';
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}