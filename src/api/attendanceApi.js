// attendanceApi.js
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

export const fetchSectionAttendanceReport = async ({
  sectionId,
  academicYearId,
  year,
  month,
}) => {
  try {
    const response = await api.get('attendance/attendance-report-section/', {
      params: {
        section: sectionId,
        academic_year: academicYearId,
        year: year,
        month: month,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching attendance report:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchTeacherAttendanceReport = async (branchId) => {
  try {
    const response = await api.get('teacher-attendance/teacher-attendance-report-branch/', {
      params: { branch: branchId },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching teacher attendance:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Extend attendanceApi.js
export const fetchAllStaffUsers = async (branchId, academicYearId) => {
  try {
    const response = await api.get('users/get-all-users-expect-students/', {
      params: {
        branch: branchId,
        academic_year: academicYearId,
        limit: 200,
        is_active: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching staff users:', error.response?.data || error.message);
    throw error;
  }
};

export const markStaffAttendance = async ({ status, user_id, attendance_date }) => {
  try {
    const response = await api.post('teacher-attendance/', {
      status,
      user_id,
      attendance_date,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error marking attendance:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchStudentDayAttendance = async ({ admissionNumber, sectionId, academicYearId, date }) => {
  try {
    const response = await api.get('attendance/attendance-report-student/', {
      params: {
        admission_number: admissionNumber,
        section: sectionId,
        academic_year: academicYearId,
        date,
      },
    });
    console.log('📥 Student day attendance:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching student attendance summary:', error.response?.data || error.message);
    throw error;
  }
};