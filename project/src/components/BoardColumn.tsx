import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Dropdown, DropdownItem } from './ui/Dropdown';

interface BoardColumnProps {
  column: Column;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask: (task: Task) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function BoardColumn({
  column,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onEditColumn,
  onDeleteColumn,
}: BoardColumnProps) {
  const { id, name, tasks } = column;
  
  return (
    <div className="board-column">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {(tasks || []).length}
          </span>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onAddTask(id)}
            className="p-1 text-gray-500 hover:text-primary rounded hover:bg-gray-100"
            aria-label="Add task"
          >
            <Plus size={16} />
          </button>
          
          <Dropdown
            trigger={
              <button
                className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                aria-label="Column options"
              >
                <MoreHorizontal size={16} />
              </button>
            }
            align="right"
          >
            <DropdownItem onClick={() => onEditColumn(column)}>Edit column</DropdownItem>
            <DropdownItem 
              onClick={() => onDeleteColumn(id)}
              destructive
            >
              Delete column
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {(tasks || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 border border-dashed rounded-md text-gray-400 text-sm">
            <span>No tasks yet</span>
            <button
              onClick={() => onAddTask(id)}
              className="mt-2 text-primary hover:underline"
            >
              Add a task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(tasks || [])
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onClick={() => onViewTask(task)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}