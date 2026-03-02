import { create } from 'zustand';
import { Team } from '../types';
import { useAuthStore } from './authStore';

interface TeamState {
  teams: Team[];
  loading: boolean;
  fetchTeams: () => Promise<Team[]>;
  createTeam: (team: Partial<Team>) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeamMember: (teamId: string, userId: string, role: 'owner' | 'admin' | 'member') => Promise<Team>;
  removeTeamMember: (teamId: string, userId: string) => Promise<Team>;
}

const API_URL = 'http://localhost:5000/api';

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  loading: false,
  
  fetchTeams: async () => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      const teams = await response.json();
      set({ teams, loading: false });
      return teams;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  createTeam: async (team) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(team),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create team');
      }
      
      const newTeam = await response.json();
    
    set(state => ({
      teams: [...state.teams, newTeam],
      loading: false,
    }));
    
    return newTeam;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  updateTeam: async (teamId, updates) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update team');
        }
      
      const updatedTeam = await response.json();
      
      set(state => ({
        teams: state.teams.map(t => 
          t.id === teamId ? updatedTeam : t
        ),
        loading: false,
      }));
    
    return updatedTeam;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  deleteTeam: async (teamId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      set(state => ({
        teams: state.teams.filter(t => t.id !== teamId),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addTeamMember: async (teamId, userId, role) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add team member');
      }
      
      const updatedTeam = await response.json();
      
      set(state => ({
        teams: state.teams.map(t => 
          t.id === teamId ? updatedTeam : t
        ),
        loading: false,
      }));
    
    return updatedTeam;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  removeTeamMember: async (teamId, userId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }
      
      const updatedTeam = await response.json();
      
      set(state => ({
        teams: state.teams.map(t => 
          t.id === teamId ? updatedTeam : t
        ),
        loading: false,
      }));
    
    return updatedTeam;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));