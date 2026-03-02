import api from './api';

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  task_id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  column_id: number;
  column_name?: string;
  board_name?: string;
  project_name?: string;
  project_id: number;
  assignee_id: number | null;
  assignees?: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
  }>;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_by: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

class TasksService {
  async getTasks() {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  }

  async getTask(projectId: number, taskId: number) {
    const response = await api.get<Task[]>('/tasks');
    const task = response.data.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
}

    // Get comments and attachments
    const [comments, attachments] = await Promise.all([
      api.get<Comment[]>(`/comments/task/${taskId}`),
      api.get<Attachment[]>(`/attachments/task/${taskId}`)
    ]);

    return {
      ...task,
      comments: comments.data,
      attachments: attachments.data
    };
  }

  async getTasksByDateRange(startDate: string, endDate: string) {
    const response = await api.get<Task[]>('/tasks/calendar', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async createTask(data: {
    title: string;
    description: string;
    project_id: number;
    column_id: number;
    assignee_id?: number;
    due_date: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  }

  async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      column_id?: number;
      assignee_id?: number | null;
      due_date?: string;
      priority?: 'low' | 'medium' | 'high';
    }
  ) {
    const response = await api.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(projectId: number, taskId: number) {
    await api.delete(`/tasks/${taskId}`);
  }

  async reorderTasks(tasks: Array<{ id: number; column_id: number; order_index: number }>) {
    const response = await api.put('/tasks/reorder', { tasks });
    return response.data;
  }

  async addComment(taskId: number, content: string) {
    const response = await api.post<Comment>('/comments', { task_id: taskId, content });
    return response.data;
  }

  async deleteComment(commentId: number) {
    await api.delete(`/comments/${commentId}`);
  }

  async uploadFile(taskId: number, file: any) {
    const response = await api.post<Attachment>('/attachments', {
      task_id: taskId,
      name: file.name,
      url: file.uri,
      type: file.type,
      size: file.size
    });
    return response.data;
  }

  async deleteFile(attachmentId: number) {
    await api.delete(`/attachments/${attachmentId}`);
  }
}

export const tasksService = new TasksService(); 