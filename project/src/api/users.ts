import axios from '../lib/axios';

export interface UpdateProfileData {
  name: string;
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await axios.put('/users/me', data);
  return response.data;
};

export const updateAvatar = async (avatarUrl: string) => {
  const response = await axios.put('/users/me/avatar', { avatarUrl });
  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await axios.put('/users/me/password', data);
  return response.data;
}; 