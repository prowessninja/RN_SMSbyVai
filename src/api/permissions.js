import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base Axios instance
const api = axios.create({
    baseURL: 'https://vai.dev.sms.visionariesai.com/api/',
    timeout: 10000
});

// Interceptor to attach token automatically
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
            console.log("🔐 Using token:", token);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ================= Permission API Methods ==================

// 1️⃣ Fetch current user with permissions
export const fetchCurrentUserWithPermissions = async () => {
    return await api.get('users/current-user/');
};

// 2️⃣ Fetch groups by branch ID
export const fetchGroupsByBranch = async (branchId) => {
    return await api.get(`groups/?branch=${branchId}`);
};

// 3️⃣ Fetch a group by ID (to get its permissions)
export const fetchGroupById = async (groupId) => {
    return await api.get(`groups/${groupId}`);
};

// 4️⃣ Update a group by ID (PUT request)
export const updateGroup = async (groupId, payload) => {
    return await api.put(`groups/${groupId}/`, payload);
};

// 5️⃣ Fetch a single page of permissions (for internal use)
export const fetchAllPermissionsPage = async (params = { limit: 100, offset: 0 }) => {
    return await api.get('permissions/', { params });
};

// 6️⃣ 🚀 Fetch ALL permissions (looping through all pages)
export const fetchAllPermissionsPaginated = async () => {
    let allPermissions = [];
    let nextUrl = 'permissions/?limit=100';  // start with first page

    try {
        while (nextUrl) {
            console.log(`🔄 Fetching: ${nextUrl}`);
            const response = await api.get(nextUrl);
            const { results, meta } = response.data;
            allPermissions = allPermissions.concat(results);

            console.log(`✅ Fetched ${results.length} permissions (Total: ${allPermissions.length})`);

            // Prepare next URL (convert full URL to relative if needed)
            nextUrl = meta.next ? meta.next.replace('http://vai.dev.sms.visionariesai.com/api/', '') : null;
        }

        console.log(`🎉 Completed fetching all permissions. Total: ${allPermissions.length}`);
        return allPermissions;
    } catch (error) {
        const errMsg = error?.response?.data || error?.message || error.toString();
        console.error('❌ Fetch All Permissions (Paginated) Error:', errMsg);
        throw error;
    }
};

// 7️⃣ Create a new group (POST)
export const createGroup = async (payload) => {
    return await api.post('groups/', payload);
};

export const deleteGroup = async (groupId) =>   {
    console.log(' Group ID',groupId);
    try {
        const response = await api.delete(`groups/${groupId}/`);
        
            if (response.status === 204) {
            console.log(` Group with ID ${groupId} deleted successfully.`);
            return true; // Return true if deletion was successful
        }
        return false; // In case of any unexpected status
    } catch (error) {
        console.error(`❌ Error deleting group with ID ${groupId}:`, error.response?.data || error.message);
        return false; // Return false if error occurs
    }
};

export default {
    fetchCurrentUserWithPermissions,
    fetchGroupsByBranch,
    fetchGroupById,
    updateGroup,
    fetchAllPermissionsPage,         // ✅ single page fetch (still available)
    fetchAllPermissionsPaginated,     // 🚀 full fetch (for your use case)
    createGroup,
    deleteGroup                      
};
