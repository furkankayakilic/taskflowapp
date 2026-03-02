import React, { useState } from 'react';
import { 
  Calendar, Paperclip, MessageSquare, UserCircle, 
  Tag, Trash2, Send, Upload
} from 'lucide-react';
import { formatDate, priorityColorMap } from '../lib/utils';
import { Task, User, Comment, Attachment } from '../types';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import { DropdownSelect } from './ui/Dropdown';

interface TaskDetailsModalProps {
  task: Task;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateAssignee: (userId?: string) => void;
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddAttachment: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

export function TaskDetailsModal({
  task,
  users,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateAssignee,
  onAddComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
}: TaskDetailsModalProps) {
  const [comment, setComment] = useState('');
  
  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(comment);
      setComment('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };
  
  const priorityInfo = priorityColorMap[task.priority];
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {task.description ? (
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>
            
            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Paperclip size={16} className="mr-2" />
                  Attachments ({(task.attachments || []).length})
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  startIcon={<Upload size={14} />}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Add file
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onAddAttachment(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              
              {(task.attachments || []).length > 0 ? (
                <div className="space-y-2">
                  {(task.attachments || []).map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded">
                          <Paperclip size={16} className="text-primary" />
                        </div>
                        <div>
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {attachment.name}
                          </a>
                          <p className="text-xs text-gray-500">
                            Added {formatDate(attachment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteAttachment(attachment.id)}
                      >
                        <Trash2 size={16} className="text-gray-500 hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-50 p-6 rounded-md border border-dashed">
                  <Paperclip size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No attachments yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload files by clicking "Add file"
                  </p>
                </div>
              )}
            </div>
            
            {/* Comments */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 flex items-center mb-4">
                <MessageSquare size={16} className="mr-2" />
                Comments ({(task.comments || []).length})
              </h3>
              
              <div className="space-y-4 mb-4">
                {(task.comments || []).map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar
                      src={comment.user.avatarUrl}
                      name={comment.user.name}
                      size="sm"
                    />
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-sm">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          <Trash2 size={14} className="text-gray-400 hover:text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {(task.comments || []).length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Avatar
                  src={users[0]?.avatarUrl}
                  name={users[0]?.name || 'User'}
                  size="sm"
                />
                <div className="flex-1">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a comment..."
                    className="w-full"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      size="sm"
                      startIcon={<Send size={14} />}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Status</h3>
              <div className="bg-secondary py-1 px-3 rounded text-sm font-medium inline-block">
                {task.columnId}
              </div>
            </div>
            
            {/* Assignee */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Assignee</h3>
              <div>
                <DropdownSelect
                  options={[
                    { label: 'Unassigned', value: '' },
                    ...users.map(user => ({ label: user.name, value: user.id }))
                  ]}
                  value={task.assigneeId || ''}
                  onChange={(value) => onUpdateAssignee(value || undefined)}
                  placeholder="Unassigned"
                />
              </div>
            </div>
            
            {/* Due date */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Due Date</h3>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span className="text-sm">
                  {task.dueDate ? formatDate(task.dueDate, 'MMM dd, yyyy') : 'No due date'}
                </span>
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Priority</h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${priorityInfo.color} ${priorityInfo.bgColor}`}>
                <Tag size={12} className="mr-1" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </div>
            
            {/* Created by */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Created By</h3>
              <div className="flex items-center">
                <UserCircle size={16} className="mr-2 text-gray-500" />
                <span className="text-sm">
                  {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
                </span>
              </div>
            </div>
            
            {/* Created/Updated dates */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Created</h3>
              <div className="text-sm mb-2">{formatDate(task.createdAt)}</div>
              
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Updated</h3>
              <div className="text-sm">{formatDate(task.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}