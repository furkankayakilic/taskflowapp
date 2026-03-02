import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
}

const API_URL = 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials');
          }

          // Convert date strings to Date objects
          const user: User = {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
            updatedAt: new Date(data.user.updatedAt),
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          // Convert date strings to Date objects
          const user: User = {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
            updatedAt: new Date(data.user.updatedAt),
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);