import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Page header UI component
export const PageHeader = ({ navigation, title, iconName = 'group-add' }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={28} color="#2d3e83" />
    </TouchableOpacity>
    <Icon name={iconName} size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3e83',
    marginLeft: 10,
  },
});

// Axios instance
const api = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
  timeout: 10000,
});

// Attach Authorization token automatically
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

// Error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Core API functions
export const fetchCurrentUserInfo = async () => {
  return await api.get('users/current-user/');
};

export const fetchActiveBranches = async () => {
  return await api.get('branches/?is_active=true');
};

export const fetchAcademicYears = async () => {
  return await api.get('academic-years/');
};

export const fetchStandardsForYearBranch = async (yearId, branchId, token) => {
  try {
    const response = await api.get('standards/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        year: yearId,
        branch: branchId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching standards data:', error);
    throw error;
  }
};

// ✅ New function to fetch sections by branch and standard
export const fetchSectionsByBranchAndStandard = async (branchId, standardId) => {
  try {
    const response = await api.get('sections/', {
      params: {
        branch: branchId,
        standard: standardId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
};

export default {
  fetchActiveBranches,
  fetchAcademicYears,
  fetchCurrentUserInfo,
  fetchStandardsForYearBranch,
  fetchSectionsByBranchAndStandard, // included in the default export
};
