// notificationsApi.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';



const api = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
  timeout: 10000,
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[notificationsApi] API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchNotifications = async () => {
  try {
    const response = await api.get('notifications/?omit=modified_by,created_by');
    return response.data.results;
  } catch (error) {
    throw error;
  }
};

export const fetchAnnouncements = async () => {
  try {
    const response = await api.get('announcements/');
    return response.data.results;
  } catch (error) {
    throw error;
  }
};

export const postAnnouncement = async (payload) => {
  try {
    const response = await api.post('announcements/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

