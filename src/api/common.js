// common.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your existing PageHeader code
export const PageHeader = ({ navigation, title, iconName = 'group-add' }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={28} color="#2d3e83" />
    </TouchableOpacity>
    <Icon name={iconName} size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

// Axios instance setup for API calls
const api = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
  timeout: 10000,
});

// Adding Authorization to request headers
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

// Logging API response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Existing API functions
export const fetchCurrentUserInfo = async () => {
  return await api.get('users/current-user/');
};

export const fetchActiveBranches = async () => {
  return await api.get('branches/?is_active=true');
};

export const fetchAcademicYears = async () => {
  return await api.get('academic-years/');
};

// New helper function to fetch standards based on year and branch
export const fetchStandardsForYearBranch = async (yearId, branchId, token) => {
  try {
    const response = await api.get('standards/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        year: yearId,
        branch: branchId,
      }
    });
    return response.data; // Data containing standards, total students, sections, status, etc.
  } catch (error) {
    console.error('Error fetching standards data:', error);
    throw error;
  }
};

// Exporting the new function
export default {
  fetchActiveBranches,
  fetchAcademicYears,
  fetchCurrentUserInfo,
  fetchStandardsForYearBranch, // Export the new function
};
