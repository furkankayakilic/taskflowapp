import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const [userJson, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);

      setState({
        user: userJson ? JSON.parse(userJson) : null,
        token,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
      setState({ user: null, token: null, loading: false });
    }
  };

  const login = async (user: User, token: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(user)),
        AsyncStorage.setItem('token', token),
      ]);
      setState({ user, token, loading: false });
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('token'),
      ]);
      setState({ user: null, token: null, loading: false });
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  return {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    logout,
  };
} 