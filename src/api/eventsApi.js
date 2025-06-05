// eventsApi.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) config.headers.Authorization = `Token ${token}`;
    return config;
});

export const fetchAllEvents = async () => {
    try {
        const response = await api.get('events/?is_active=true');
        return response.data?.results || [];
    } catch (error) {
        console.error('❌ Error fetching events:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchDepartmentsByBranch = async (branchId) => {
  try {
    const response = await api.get('departments/', {
      params: { branch: branchId, is_active: true },
    });
    return response.data?.results || [];
  } catch (error) {
    console.error('❌ Error fetching departments:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchSectionsByBranch = async (branchId) => {
  try {
    const response = await api.get('sections/', {
      params: { branch: branchId },
    });
    return response.data?.results || [];
  } catch (error) {
    console.error('❌ Error fetching sections:', error.response?.data || error.message);
    throw error;
  }
};

export const updateEvent = async (eventId, payload) => {
  try {
    const response = await api.patch(`events/${eventId}/`, payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error in updateEvent:', error.response?.data || error.message);
    throw error;
  }
};

export const createEvent = async (payload) => {
  try {
    const response = await api.post('events/', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error in createEvent:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const res = await api.delete(`events/${eventId}/`);
    return res.data;
  } catch (err) {
    console.error('❌ Delete error:', err.response?.data || err.message);
    throw err;
  }
};





