import React from 'react';
import { Trash2, Edit, Paperclip, MessageSquare, Calendar, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Task, User } from '../types';
import { Avatar } from './ui/Avatar';
import { formatDate, priorityColorMap } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function TaskCard({ task, onEdit, onDelete, onClick }: TaskCardProps) {
  const { title, description, dueDate, priority, assignee, attachments, comments } = task;
  
  const priorityInfo = priorityColorMap[priority] || { color: 'text-gray-700', bgColor: 'bg-gray-100' };
  
  // Prevent events from bubbling up to the card's onClick handler
  const handleActionClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    callback();
  };
  
  return (
    <motion.div
      className="task-card cursor-pointer group"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleActionClick(onEdit)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleActionClick(onDelete)}
            className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-gray-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          {assignee && (
            <Avatar 
              src={assignee.avatarUrl} 
              name={assignee.name} 
              size="xs" 
            />
          )}
          
          <span className={`px-2 py-0.5 rounded-full text-xs ${priorityInfo.color} ${priorityInfo.bgColor}`}>
            {priority}
          </span>
          
          {dueDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={12} className="mr-1" />
              <span>{formatDate(dueDate, 'MMM d')}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 text-gray-500">
          {(attachments || []).length > 0 && (
            <div className="flex items-center text-xs">
              <Paperclip size={12} className="mr-1" />
              <span>{(attachments || []).length}</span>
            </div>
          )}
          {(comments || []).length > 0 && (
            <div className="flex items-center text-xs">
              <MessageSquare size={12} className="mr-1" />
              <span>{(comments || []).length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}