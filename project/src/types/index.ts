export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  createdBy: string;
  members: ProjectMember[];
  boards: Board[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  name: string;
  board_id: string;
  order_index: number;
  tasks: Task[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  assigneeId?: string;
  assignee?: User;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order: number;
  attachments: Attachment[];
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}