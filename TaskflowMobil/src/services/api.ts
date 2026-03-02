import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Platform bazlı base URL
const BASE_URL = Platform.select({
  android: 'http://172.20.10.3:5000/api', // Gerçek cihaz için WiFi IP
  ios: 'http://172.20.10.3:5000/api',     // Gerçek cihaz için WiFi IP
  default: 'http://172.20.10.3:5000/api'  // Fallback
});

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request URL:', config.url);
        console.log('Request Method:', config.method);
        console.log('Request Headers:', config.headers);
        console.log('Token added to request:', token.substring(0, 10) + '...');
      } else {
        console.log('No token found in AsyncStorage');
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    console.log('Response Status:', response.status);
    console.log('Response URL:', response.config.url);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access, removing token');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // TODO: Kullanıcıyı login ekranına yönlendir
    }
    return Promise.reject(error);
  }
);

export default api; 