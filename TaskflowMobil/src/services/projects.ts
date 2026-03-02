import api from './api';

export interface Project {
  id: number;
  name: string;
  description: string;
  team_id: number;
  team_name?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed';
  boards?: Array<{
    id: number;
    name: string;
    columns: Array<{
      id: number;
      name: string;
      tasks: Array<{
        id: number;
        title: string;
        description: string;
        due_date: string;
        priority: 'low' | 'medium' | 'high';
        assignee_id: number | null;
      }>;
    }>;
  }>;
  members?: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
    role: string;
  }>;
}

class ProjectsService {
  async getProjects() {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  }

  async getProject(id: number) {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async getTeamProjects(teamId: number) {
    const response = await api.get<Project[]>(`/teams/${teamId}/projects`);
    return response.data;
  }

  async createProject(data: {
    name: string;
    description: string;
    team_id: number;
  }) {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  }

  async updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
      team_id?: number;
    }
  ) {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: number) {
    await api.delete(`/projects/${id}`);
  }

  async addProjectMember(projectId: number, userId: number, role: string) {
    const response = await api.post(`/projects/${projectId}/members`, {
      userId,
      role
    });
    return response.data;
  }

  async removeProjectMember(projectId: number, userId: number) {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  }

  async createBoard(projectId: number, name: string = 'Ana Board') {
    const response = await api.post(`/boards`, { 
      project_id: projectId,
      name 
    });
    return response.data;
  }

  async createColumn(boardId: number, name: string) {
    const response = await api.post(`/columns`, { 
      board_id: boardId,
      name 
    });
    return response.data;
  }

  async createDefaultBoardAndColumns(projectId: number) {
    try {
      // Create default board
      const board = await this.createBoard(projectId);
      
      // Create default columns
      const columns = await Promise.all([
        this.createColumn(board.id, 'Yapılacak'),
        this.createColumn(board.id, 'Devam Ediyor'),
        this.createColumn(board.id, 'Tamamlandı')
      ]);

      // Refresh project data to get the updated structure
      const updatedProject = await this.getProject(projectId);
      return {
        board: updatedProject.boards?.[0],
        columns: updatedProject.boards?.[0]?.columns || []
      };
    } catch (error) {
      console.error('Error creating default board and columns:', error);
      throw error;
    }
  }
}

export const projectsService = new ProjectsService(); 