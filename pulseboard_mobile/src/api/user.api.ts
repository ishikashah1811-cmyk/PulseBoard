import api from './client'; // Import the file you just fixed above
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'; 

const api1 = axios.create({
  baseURL: API_URL,
});

// Auto-add token to every request
api1.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserProfile = async () => {
  try {
    // Uses the shared client with the Token logic automatically included
    const response = await api.get('/api/users/me'); 
    
    // Return user data with core member fields
    return {
      ...response.data,
      // ADD THESE FIELDS from backend response
      isCoreMember: response.data.isCoreMember || false,
      coreMembership: response.data.coreMembership || null
      // coreMembership structure expected:
      // {
      //   clubId: string,
      //   clubName: string,
      //   clubColor: string,
      //   clubIcon: string,
      //   role: 'core' | 'admin' | 'moderator'
      // }
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};