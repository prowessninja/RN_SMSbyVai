// src/api/timetableApi.js
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
    console.error('📡 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Fetch teacher timetable
export const fetchTeacherTimetable = async (branchId) => {
  try {
    const response = await api.get(`period/teacher-timetable/?branch=${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    throw error;
  }
};

// Fetch sections list
export const fetchSections = async (branchId) => {
  try {
    const response = await api.get(`sections/?branch=${branchId}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
};

// Fetch timetable for specific section
export const fetchSectionTimetable = async (branchId, sectionId) => {
  try {
    const response = await api.get(`period/?section__standard__branch=${branchId}&section=${sectionId}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching section timetable:', error);
    throw error;
  }
};

// Add this to your existing timetableApi.js
export const fetchStudentsBySection = async (branchId, sectionId) => {
  try {
    console.log('📢 Fetching students with', { branchId, sectionId });

    const response = await api.get(
      `users/?group__name=Student&branch=${branchId}&section=${sectionId}&limit=200&omit=created_by`
    );

    console.log('✅ Students fetched:', response.data);

    return response.data.results || [];
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    return [];
  }
};

export const markStudentAttendance = async (payload) => {
  try {
    const response = await api.post('attendance/', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error posting attendance:', error.response?.data || error.message);
    throw error;
  }
};


