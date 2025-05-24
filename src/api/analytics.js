import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
  timeout: 10000,
});

// Automatically attach token from storage
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: global error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[analytics.js] API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Fetch inventory dashboard data by branch
export const fetchInventoryAnalytics = async (branchId) => {
  try {
    const response = await api.get(`inventory/dashboard/?branch=${branchId}`);
    return response.data;
  } catch (error) {
    console.error('[fetchInventoryAnalytics] Failed:', error);
    throw error;
  }
};
