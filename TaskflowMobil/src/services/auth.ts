import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/users/me', data);
    const updatedUser = response.data;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async changePassword(data: ChangePasswordData) {
    await api.put('/users/me/password', data);
  }

  async uploadAvatar(file: {
    uri: string;
    type: string;
    fileName?: string;
  }) {
    const formData = new FormData();
    formData.append('avatar', file as any);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const updatedUser = response.data;
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
}

export const authService = new AuthService(); 