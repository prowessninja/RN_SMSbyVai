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
        is_active: true,
        academic_year: yearId,
        branch: branchId,
      },
    });
    console.log('Academic Year and Branch to Fetch Stationery:', yearId, branchId);
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

export const getDepartmentsForBranchAndYear = async (selectedBranchId, selectedYearId) => {
  try {
    const response = await api.get('departments/', {
      params: {
        is_active: true,
        branch: selectedBranchId,
        academic_year: selectedYearId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to retrieve department list:', error);
    throw error;
  }
};

export const fetchBranchDetailsById = async (branchId) => {
  try {
    const response = await api.get(`branches/?branch=${branchId}`);
    console.log('From common.js:', response.data.results[0]);
    return response.data.results[0];
  } catch (error) {
    console.error('Failed to fetch branch details:', error);
    throw error;
  }
};

export const fetchStationeryForYearBranch = async (yearId, branchId, token) => {
  try {
    const response = await api.get('stationary/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        year: yearId,
        branch: branchId,
      },
    });

    //console.log('Full API Response for stationery:', response); // 🔍 Logs full Axios response object
    return response.data;
  } catch (error) {
    console.error('Error fetching stationery data:', error);
    throw error;
  }
};

export const fetchAllStationery = async () => {
  try {
    const response = await api.get('stationary/');

    const data = response.data?.results || [];

    const formatted = data.map((item) => ({
      id: item.id,
      name: item.name?.name || item.name || 'Unnamed',
    }));

    return formatted;
  } catch (error) {
    console.error('Error fetching all stationery:', error);
    throw error;
  }
};

export const updateStandard = async (standard) => {
  try {
    console.log('[updateStandard] Starting standard update...');
    console.log('[updateStandard] Payload:', standard);

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.warn('[updateStandard] No token found');
      throw new Error('User token not available');
    }

    const payload = {
      id: standard.id,
      name: standard.name,
      branch: standard.branch,
      is_active: standard.is_active,
      stationary_ids: standard.stationary_ids,
      academic_year_id: standard.academic_year_id,
    };

    console.log('Payload:', payload);

    console.log('[updateStandard] Sending PUT request to:', `standards/${standard.id}/`);

    const response = await api.put(`standards/${standard.id}/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[updateStandard] Update successful. Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[updateStandard] Error updating standard:', error.response?.data || error.message);
    throw error;
  }
};

// common.js
export const markStandardInactive = async (standardId) => {
  try {
    const response = await api.delete(`standards/${standardId}/`);

    if (response.status === 204) {
      console.log(`[markStandardInactive] Standard ${standardId} marked as inactive.`);
      return true;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('[markStandardInactive] Authentication error:', error.response.data);
      throw new Error('Unauthorized: Please log in again.');
    }

    console.error('[markStandardInactive] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchTeachingStaffByBranch = async (branchId) => {
  console.log('[fetchTeachingStaffByBranch] Called with branchId:', branchId);

  // Manually build the query string
  const query = `branch=${branchId}&is_active=true&group__group_type__type!=Non-Teaching`;
  const fullUrl = `users/?${query}`;

  console.log('[fetchTeachingStaffByBranch] Full API URL:', fullUrl);

  try {
    const response = await api.get(`users/?${query}`);
    console.log('[fetchTeachingStaffByBranch] API response:', response.data);

    const results = response.data?.results || [];
    const mappedResults = results.map((user) => ({
      label: `${user.first_name} ${user.last_name}`,
      value: user.id,
    }));

    console.log('[fetchTeachingStaffByBranch] Mapped results:', mappedResults);
    return mappedResults;
  } catch (error) {
    console.error('[fetchTeachingStaffByBranch] Error:', error.response?.data || error.message);
    throw error;
  }
};



export const addSection = async ({ name, standard_id, head_teacher_id }) => {
  try {
    const payload = {
      name,
      standard_id,
      head_teacher_id,
      is_active: true,
    };

    const response = await api.post('sections/', payload);

    if (response.status === 201) {
      console.log('[addSection] Successfully created section:', response.data);
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('[addSection] Error creating section:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch class, section, and student details
export const fetchClassAndSectionDetails = async (branchId, sectionId, standardId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Authorization token not found.');
    }

    const authHeader = {
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    };

    // Helper to normalize response data
    const normalizeResponse = (data) =>
      Array.isArray(data) ? data : data?.results || [];

    // SECTION DETAILS BY BRANCH
    const sectionConfig = {
      url: 'sections/',
      params: { branch: branchId },
    };
    console.log('[URL] Section:', api.getUri(sectionConfig));
    const sectionResponse = await api.get(sectionConfig.url, {
      ...authHeader,
      params: sectionConfig.params,
    });
    console.log('[Response] Section:', sectionResponse.data);

    // SECTION DETAILS BY STANDARD
    const sectionByStandardConfig = {
      url: 'sections/',
      params: {
        branch: branchId,
        standard: standardId,
        omit: 'created_by',
      },
    };
    console.log('[URL] Section By Standard:', api.getUri(sectionByStandardConfig));
    const sectionByStandardResponse = await api.get(sectionByStandardConfig.url, {
      ...authHeader,
      params: sectionByStandardConfig.params,
    });
    console.log('[Response] Section By Standard:', JSON.stringify(sectionByStandardResponse.data, null, 2));

    // STUDENT DETAILS
    const studentConfig = {
      url: 'users/',
      params: {
        group__name: 'Student',
        branch: branchId,
        section: sectionId,
        limit: 0,

      },
    };
    console.log('[URL] Students:', api.getUri(studentConfig));
    const studentResponse = await api.get(studentConfig.url, {
      ...authHeader,
      params: studentConfig.params,
    });
    console.log('[Response] Students:', studentResponse.data);

    // SCHEDULE DETAILS
    const scheduleConfig = {
      url: 'schedules/',
      params: { branch: branchId },
    };
    console.log('[URL] Schedule:', api.getUri(scheduleConfig));
    const scheduleResponse = await api.get(scheduleConfig.url, {
      ...authHeader,
      params: scheduleConfig.params,
    });
    console.log('[Response] Schedule:', scheduleResponse.data);

    return {
      section: normalizeResponse(sectionResponse.data),
      sectionByStandard: normalizeResponse(sectionByStandardResponse.data),
      students: normalizeResponse(studentResponse.data),
      schedule: normalizeResponse(scheduleResponse.data),
    };
  } catch (error) {
    console.error('[fetchClassAndSectionDetails] Error:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch students assigned to sections for a given branch and standard
export const addStudentsToSection = async (branchId, standardId) => {
  try {
    const response = await api.get('users/', {
      params: {
        group__name: 'Student',
        section_assigned: true,
        branch: branchId,
        standard: standardId,
      },
    });

    const data = response.data?.results || [];

    // Log desired student details
    data.forEach(student => {
      const admissionNumber = student.admission_number || 'N/A';
      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
      const phone = student.phone || 'N/A';
      const email = student.email || 'N/A';

      console.log(`Admission No: ${admissionNumber}, Name: ${fullName}, Phone: ${phone}, Email: ${email}`);
    });

    return data;
  } catch (error) {
    console.error('[addStudentsToSection] Error:', error.response?.data || error.message);
    throw error;
  }
};

// common.js

export const submitStudentsToSection = async ({
  sectionId,
  standardId,
  students,
  academicYear,
  classRepresentative,
}) => {
  try {
    const payload = {
      standard_id: standardId,
      id: sectionId,
      students,
      academic_year: academicYear,
      class_representative: classRepresentative,
    };

    const response = await api.post(`sections/${sectionId}/add-students/`, payload);

    return response.data;
  } catch (error) {
    console.error('[submitStudentsToSection] Error:', error.response?.data || error.message);
    throw error;
  }
};

// common.js

export const fetchChangeStudentsModalData = async ({
  branchId,
  academicYearId,
  standardId,
  sectionId,
  studentSearch = '',
}) => {
  try {
    // Fetch standards (active + inactive)
    const standardsResponse = await api.get('standards/', {
      params: {
        branch: branchId,
        academic_year: academicYearId,
        is_active: true,
        inactive: true,
      },
    });

    // Fetch sections for selected standard
    const sectionsResponse = await api.get('sections/', {
      params: {
        branch: branchId,
        standard: standardId,
        is_active: true,
        omit: 'created_by',
      },
    });

    // Fetch students for selected section and optional search
    const studentsResponse = await api.get('users/', {
      params: {
        group__name: 'Student',
        branch: branchId,
        section: sectionId,
        limit: 0,
        omit: 'created_by',
        search: studentSearch.trim(),
      },
    });

    return {
      standards: standardsResponse.data.results || [],
      sections: sectionsResponse.data.results || [],
      students: studentsResponse.data.results || [],
    };
  } catch (error) {
    console.error('Error fetching modal data:', error.response?.data || error.message);
    throw error;
  }
};

// common.js
export async function changeStudentsSubmit(payload) {
  try {
    const response = await api.post('sections/bulk-update-sections/', payload);
    console.log('Payload sent >>>>>', payload);
    console.log('Response status >>>>>', response.status);
    console.log('Response data >>>>>', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in changeStudentsSubmit:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || error.response?.data?.message || 'Failed to update students'
    );
  }
}

/*export const markSectionInactive = async (sectionId) => {
  try {
    const payload = { is_active: false };
    const response = await api.patch(`sections/${sectionId}/`, payload);

    if (response.status === 200) {
      console.log(`[markSectionInactive] Section ${sectionId} marked as inactive.`);
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('[markSectionInactive] Authentication error:', error.response.data);
      throw new Error('Unauthorized: Please log in again.');
    }

    console.error('[markSectionInactive] Error:', error.response?.data || error.message);
    throw error;
  }
};*/

const handleToggleSectionActive = async (section) => {
  if (!section?.id) return;

  try {
    setOverlayText(
      section.is_active
        ? 'Marking section inactive…'
        : 'Activating section…'
    );
    setShowOverlay(true);

    await CommonAPI.toggleSectionActive(section.id, section.is_active);

    setOverlayText(
      section.is_active
        ? 'Section marked inactive!'
        : 'Section activated!'
    );

    // Refresh only this standard’s sections
    await fetchSectionsData(selectedBranch, selectedStandard);
  } catch (err) {
    console.error('❌ Failed to toggle section:', err);
    setOverlayText('Failed to change section status.');
  } finally {
    setTimeout(() => setShowOverlay(false), 1500);
  }
};


// common.js
export const toggleSectionActive = async (sectionId, currentStatus) => {
  try {
    const payload = { is_active: !currentStatus };
    const response = await api.patch(`sections/${sectionId}/`, payload);

    if (response.status === 200) {
      console.log(
        `[toggleSectionActive] Section ${sectionId} set active=${!currentStatus}.`
      );
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('[toggleSectionActive] Authentication error:', error.response.data);
      throw new Error('Unauthorized: Please log in again.');
    }
    console.error('[toggleSectionActive] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const createStandard = async (payload) => {
  try {
    const response = await api.post('standards/', {
      ...payload,
      is_active: true, // enforce this flag from inside the function
    });

    if (response.status === 201) {
      console.log('[createStandard] Standard created:', response.data);
      return response.data;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('[createStandard] Error:', error.response?.data || error.message);
    throw error;
  }
};

const addDepartment = async (payload) => {
  try {
    const response = await api.post('departments/', payload);

    if (response.status === 201) {
      console.log('Department added successfully:', response.data);
      return { success: true, data: response.data };
    } else {
      console.log('Unexpected response status:', response.status);
      return { success: false, error: 'Unexpected status code' };
    }
  } catch (error) {
    console.error('Error adding department:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

export const fetchDepartmentDetails = async (departmentId) => {
  try {
    const endpoint = 'users/';
    const params = { department: departmentId };

    // Manually build the full URL with query params
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${api.defaults.baseURL}${endpoint}?${query}`;

    console.log('[fetchDepartmentDetails] Full URL:', fullUrl);

    const response = await api.get(endpoint, { params });

    return response.data;
  } catch (error) {
    console.error(
      '[fetchDepartmentDetails] Error fetching department users:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllNonStudentUsers = async (branchId, academicYearId) => {
  try {
    const params = {
      branch: branchId,
      academic_year: academicYearId,
      name: '',
      limit: 200,
      employee_id: '',
      is_active: false,
    };

    const endpoint = 'users/get-all-users-expect-students/';
    const fullUrl = `${api.defaults.baseURL}${endpoint}?${new URLSearchParams(params).toString()}`;
    console.log('[getAllNonStudentUsers] Full URL:', fullUrl);

    const response = await api.get(endpoint, { params });

    return response.data?.results || [];
  } catch (error) {
    console.error('[getAllNonStudentUsers] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const assignTeachersToDepartment = async (departmentId, payload) => {
  if (!payload || !Array.isArray(payload.teachers) || payload.teachers.length === 0) {
    throw new Error('Payload must include a non-empty "teachers" array');
  }

  try {
    const url = `departments/${departmentId}/add-teachers/`;
    console.log(`[assignTeachersToDepartment] POST ${url} with payload:`, payload);

    const response = await api.post(url, payload);

    if (response.status === 200 || response.status === 201) {
      console.log('[assignTeachersToDepartment] Success:', response.data);
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('[assignTeachersToDepartment] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const markDepartmentInactive = async (departmentId) => {
  try {
    const response = await api.patch(`departments/${departmentId}/`, {
      is_active: false,
    });

    if (response.status === 204 || response.status === 200) {
      console.log(`[markDepartmentInactive] Department ${departmentId} marked inactive.`);
      return true;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('[markDepartmentInactive] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchStationaryTypesAndInventory = async (branchId) => {
  console.log('[fetchStationaryTypesAndInventory] Called with branchId:', branchId);

  if (!branchId) {
    console.error('[fetchStationaryTypesAndInventory] Missing branchId');
    throw new Error('branchId is required to fetch inventory and stationery types.');
  }

  try {
    console.log('[fetchStationaryTypesAndInventory] Fetching data…');

    const [typesRes, invRes] = await Promise.all([
      api.get('stationary-types/', {
        params: { omit: 'modified_by,created_by' },
      }),
      api.get('inventory-tracking/', {
        params: {
          branch: branchId,
          inventory__is_stationary: true,
          omit: 'created_by,modified_by,branch',
        },
      }),
    ]);

    console.log('[fetchStationaryTypesAndInventory] Raw types:', typesRes.data);
    console.log('[fetchStationaryTypesAndInventory] Raw inventory:', invRes.data);

    const stationaryTypes = (typesRes.data.results || []).map(t => ({
      label: t.name,
      value: t.id,
    }));

    // Each inventory‑tracking entry has an `inventory` object describing the item
    const inventoryTracking = (invRes.data.results || []).map(entry => ({
      label: entry.inventory.name + ` (avail: ${entry.inventory.quantity})`,
      value: entry.inventory.id,
      price: entry.inventory.price,
      stock: entry.inventory.quantity,
    }));

    return { stationaryTypes, inventoryTracking };
  } catch (error) {
    console.error(
      '[fetchStationaryTypesAndInventory] Error occurred:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateStationery = async (stationeryId, data) => {
  try {
    const payload = {
      id: stationeryId,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      stationary_type_id: data.stationary_type_id,
      inventory_tracking_id: data.inventory_tracking_id,
      price: data.price,
      is_active: data.is_active,
      branch_id: data.branch_id,
    };

    console.log('[updateStationeryItem] Payload:', payload);

    const response = await api.patch(`stationary/${stationeryId}/`, payload);
    console.log(
      `[updateStationeryItem] Stationery ${stationeryId} updated successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `[updateStationeryItem] Error updating stationery ${stationeryId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const saveAcademicYear = async (year) => {
  // build the body
  const body = {
    name: year.name,
    start_date: year.start_date,
    end_date: year.end_date,
  };

  try {
    let response;
    if (year.id) {
      console.log('[saveAcademicYear] Updating Academic Year:', year.id, body);
      response = await api.patch(`academic-years/${year.id}/`, { id: year.id, ...body });
    } else {
      console.log('[saveAcademicYear] Creating Academic Year:', body);
      response = await api.post('academic-years/', body);
    }
    console.log('[saveAcademicYear] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      `[saveAcademicYear] Error ${year.id ? 'updating' : 'creating'} academic year:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const sendForgotPasswordLink = async (email) => {
  try {
    const response = await api.post('users/forgot-password/', { email });
    return response.data;
  } catch (error) {
    console.error('[sendForgotPasswordLink] Error:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong while sending the reset link.' };
  }
};

export const createStationery = async (data) => {
  try {
    const response = await api.post('stationary/', data);
    return response.data;
  } catch (error) {
    console.error('[createStationery] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchStationeryTypes = async () => {
  try {
    const response = await api.get('stationary-types/', {
      params: {
        is_active: true,
        omit: 'modified_by,created_by',
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching stationery types:', error.response?.data || error.message);
    throw error;
  }
};

export const createStationeryType = async (payload) => {
  try {
    const response = await api.post('stationary-types/', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating stationery type:', error.response?.data || error.message);
    throw error;
  }
};

export const updateStationeryType = async (id, payload) => {
  try {
    const response = await api.patch(`stationary-types/${id}/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating stationery type:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteStationeryType = async (id) => {
  try {
    // If the API is truly destructive DELETE:
    await api.delete(`stationary-types/${id}/`);
    return true;
  } catch (error) {
    console.error('Error deleting stationery type:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchInventory = async (branchId) => {
  try {
    const response = await api.get(`/inventory/?branch=${branchId}&omit=created_by,modified_by,branch`);
    console.log('Inventory Json:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchInventoryTypes = async (branchId) => {
  try {
    const response = await api.get(`/inventory-types/?is_active=true&branch=${branchId}`);
    return response;
  } catch (error) {
    console.error('Error fetching inventory types:', error.response?.data || error.message);
    throw error;
  }
};

export const updateInventory = async (inventoryId, payload) => {
  try {
    const data = {
      id: inventoryId,
      name: payload.name,
      quantity: payload.quantity,
      is_stationary: payload.is_stationary,
      inventory_type_id: payload.inventory_type || payload.inventory_type_id, // ensure fallback
      price: payload.price,
      description: payload.description,
      status: payload.status,
      remarks: payload.remarks,
      branch_id: payload.branch || payload.branch_id, // ensure fallback
      bill_image: payload.bill_image,
      product_image: payload.product_image,
    };

    const response = await api.put(`inventory/${inventoryId}/`, data);
    console.log('[updateInventory] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[updateInventory] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const createInventory = async (payload) => {
    try {
        const response = await api.post('/inventory/', payload);
        return response.data;
    } catch (error) {
        console.error('[createInventory] Error:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchRooms = async (branchId) => {
  try {
    const response = await api.get(`/rooms/?branch=${branchId}&is_active=true`);
    return response.data.results || [];
  } catch (error) {
    console.error('[fetchRooms] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const submitTrackingData = async (payload, isEditMode) => {
  try {
    const endpoint = isEditMode
      ? `inventory-tracking/${payload.id}/`
      : 'inventory-tracking/';
    const method = isEditMode ? 'patch' : 'post';

    const response = await api[method](endpoint, payload);
    return response.data;
  } catch (error) {
    console.error(
      `Error ${isEditMode ? 'updating' : 'creating'} tracking data:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createInventoryType = async (payload) => {
  try {
    const response = await api.post('inventory-types/', payload);
    return response.data;
  } catch (error) {
    console.error('[createInventoryType] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateInventoryType = async (id, payload) => {
  try {
    const response = await api.patch(`inventory-types/${id}/`, payload);
    return response.data;
  } catch (error) {
    console.error('[updateInventoryType] Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteInventoryType = async (id) => {
  try {
    const response = await api.delete(`inventory-types/${id}/`);
    if (response.status === 204 || response.status === 200) {
      console.log(`[deleteInventoryType] Deleted inventory type with id: ${id}`);
      return true;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('[deleteInventoryType] Error:', error.response?.data || error.message);
    throw error;
  }
};


export default {
  fetchActiveBranches,
  fetchAcademicYears,
  fetchCurrentUserInfo,
  fetchStandardsForYearBranch,
  fetchSectionsByBranchAndStandard,
  getDepartmentsForBranchAndYear, // included in the default export
  fetchBranchDetailsById,
  fetchStationeryForYearBranch,
  fetchAllStationery,
  updateStandard,
  markStandardInactive,
  fetchTeachingStaffByBranch,
  addSection,
  fetchClassAndSectionDetails,
  addStudentsToSection,
  submitStudentsToSection,
  fetchChangeStudentsModalData,
  changeStudentsSubmit,
  //markSectionInactive, 
  toggleSectionActive,
  createStandard,
  addDepartment,
  fetchDepartmentDetails,
  getAllNonStudentUsers,
  assignTeachersToDepartment,
  markDepartmentInactive,
  fetchStationaryTypesAndInventory,
  updateStationery,
  saveAcademicYear,
  sendForgotPasswordLink,
  createStationery,
  fetchStationeryTypes,
  createStationeryType,
  updateStationeryType,
  deleteStationeryType,
  fetchInventory,
  fetchInventoryTypes,
  updateInventory,
  createInventory,
  fetchRooms,
  submitTrackingData,
  createInventoryType,
  updateInventoryType,
  deleteInventoryType,

};
