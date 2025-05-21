import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Axios instance
const orgAdminApi = axios.create({
  baseURL: 'https://vai.dev.sms.visionariesai.com/',
  timeout: 10000,
});

// Attach Authorization token automatically & log full URL
orgAdminApi.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Log the full request URL
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[orgAdminApi] Request URL: ${fullUrl}`);

    return config;
  },
  (error) => Promise.reject(error)
);

// Global error logger
orgAdminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[orgAdminApi] API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Fetches all dashboard data for Org Admin.
 *
 * @param {number|string} branchId        The branch ID to fetch data for.
 * @param {number|string} academicYearId  The academic year ID to fetch data for.
 */
export const fetchDashboardData = async (branchId, academicYearId) => {
  const branchParam = encodeURIComponent(branchId);
  const yearParam   = encodeURIComponent(academicYearId);

  try {
    const [
      schoolRes,
      feeTypeRes,
      feeCollectionRes,
      inventoryRes,
    ] = await Promise.all([
      orgAdminApi.get(`api/fee-dashboard/school-analytics/?branch=${branchParam}&academic_year=${yearParam}`),
      orgAdminApi.get(`api/fee-dashboard/fee-type-distribution/?branch=${branchParam}&academic_year=${yearParam}`),
      orgAdminApi.get(`api/fee-dashboard/fee-collection-stats/?branch=${branchParam}&academic_year=${yearParam}`),
      orgAdminApi.get(`api/inventory/dashboard/?branch=${branchParam}`),
    ]);

    console.log('[School Analytics]', JSON.stringify(schoolRes.data, null, 2));
    console.log('[Fee Type Distribution]', JSON.stringify(feeTypeRes.data, null, 2));
    console.log('[Fee Collection Stats]', JSON.stringify(feeCollectionRes.data, null, 2));
    console.log('[Inventory Dashboard]', JSON.stringify(inventoryRes.data, null, 2));

    return {
      schoolAnalytics:       schoolRes.data,
      feeTypeDistribution:   feeTypeRes.data,
      feeCollectionStats:    feeCollectionRes.data,
      inventoryDashboard:    inventoryRes.data,
    };
  } catch (error) {
    console.error(
      `[fetchDashboardData] Error fetching dashboard data for branch=${branchParam}&academic_year=${yearParam}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
