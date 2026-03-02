import api from './api';

export interface Team {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

class TeamsService {
  async getTeams() {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  }

  async getTeam(id: number) {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  }

  async getTeamMembers(teamId: number) {
    const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
    return response.data;
  }

  async createTeam(data: { name: string; description: string }) {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  }

  async updateTeam(id: number, data: { name?: string; description?: string }) {
    const response = await api.put<Team>(`/teams/${id}`, data);
    return response.data;
  }

  async deleteTeam(id: number) {
    await api.delete(`/teams/${id}`);
  }

  async addTeamMember(teamId: number, userId: number, role: 'admin' | 'member') {
    const response = await api.post<TeamMember>(`/teams/${teamId}/members`, {
      user_id: userId,
      role,
    });
    return response.data;
  }

  async removeTeamMember(teamId: number, userId: number) {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  }

  async inviteTeamMember(teamId: number, email: string, role: 'member' | 'admin' = 'member') {
    const response = await api.post<{ message: string }>(`/teams/${teamId}/invite`, {
      email,
      role,
    });
    return response.data;
  }
}

export const teamsService = new TeamsService(); 