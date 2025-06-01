// feeApi.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const fetchFeeStructures = async (branchId, academicYearId) => {
  const response = await api.get('fees/', {
    params: {
      branch: branchId,
      academic_year: academicYearId,
      is_active: true,
      limit: 100,
    },
  });
  return response.data.results;
};

// feeApi.js

// Fetch fee types
export const fetchFeeTypes = async (branchId) => {
  const response = await api.get('fee-types/', {
    params: {
      branch: branchId,
      //is_active: true,
      omit: 'created_by,modified_by',
    },
  });
  console.log('Branch ID:', branchId);

  return response.data?.results || [];
};

// Create a new fee type
export const createFeeType = async (payload) => {
  // payload: { name, description, branch_id, academic_year_id }
  const response = await api.post('fee-types/', payload);
  return response.data;
};

// Update an existing fee type
export const updateFeeType = async (id, payload) => {
  // payload: { is_active, name, description }
  const response = await api.patch(`fee-types/${id}/`, payload);
  return response.data;
};

// Delete a fee type
export const deleteFeeType = async (id) => {
  const response = await api.delete(`fee-types/${id}/`);
  return response.data;
};

// feeApi.js

export const fetchStudentFeeSummaries = async (branchId, academicYearId, limit = 40, offset = 0) => {
  try {
    const response = await api.get('total-fee-summary/', {
      params: {
        branch: branchId,
        academic_year: academicYearId,
        limit,
        offset,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student fee summaries:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch fee summary
export const fetchFeeSummary = async (userId, academicYearId) => {
  const response = await api.get(`fee-summary/`, {
    params: { user: userId, academic_year: academicYearId },
  });
  return response.data;
};

// Fetch fee payments
export const fetchFeePayments = async (userId) => {
  const response = await api.get(`fee-payments/`, {
    params: {
      omit: "created_by,modified_by,user__created_by,user__modified_by,fee__created_by,fee__modified_by",
      user: userId,
    },
  });
  return response.data;
};

// Fetch total fee summary
export const fetchTotalFeeSummary = async (branchId, academicYearId, standardId, userId) => {
  const response = await api.get(`total-fee-summary/`, {
    params: {
      branch: branchId,
      limit: 1,
      academic_year: academicYearId,
      standard: standardId,
      user: userId,
    },
  });
  return response.data;
};

// Fetch fee types based on branch, standard, academic year
export const getFeeTypesByStandard = async (branchId, standardId, academicYearId) => {
  const response = await api.get('fees/', {
    params: {
      branch: branchId,
      standard: standardId,
      academic_year: academicYearId,
    },
  });
  return response.data.results;
};

// Submit new concession
export const createFeeConcession = async (payload) => {
  const response = await api.post('fee-concessions/', payload);
  return response.data;
};

// Edit existing concession
export const editFeeConcession = async (id, payload) => {
  const response = await api.put(`fee-concessions/${id}/`, payload);
  return response.data;
};

// Submit single payment
export const createFeePayment = async (payload) => {
  const response = await api.post('fee-payments/', payload);
  return response.data;
};

// Submit multiple fee payments
export const createMultipleFeePayments = async (payload) => {
  const response = await api.post('fee-payments/custom-fee-payments-all/', payload);
  return response.data;
};

export const fetchAllFeePayments = async ({ branch, academic_year }) => {
  try {
    const response = await api.get('fee-payments/', {
      params: {
        branch,
        academic_year,
        limit: 10000, // assume upper cap
      },
    });
    return response.data;
  } catch (error) {
    console.error('[fetchAllFeePayments] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const createFeeStructure = async (payload) => {
  console.log('[createFeeStructure] Payload:', payload);
  try {
    const response = await api.post('fees/', payload);
    console.log('[createFeeStructure] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[createFeeStructure] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateFeeStructure = async (id, payload) => {
  console.log(`[updateFeeStructure] ID: ${id}`, payload);
  try {
    const response = await api.patch(`fees/${id}/`, payload);
    console.log('[updateFeeStructure] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[updateFeeStructure] Error:', error.response?.data || error.message);
    throw error;
  }
};







