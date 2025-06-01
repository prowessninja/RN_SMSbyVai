import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCurrentUserInfo, fetchActiveBranches, fetchAcademicYears } from '../api/common';

// Existing AuthContext
export const AuthContext = createContext();

// ➕ New AlertsContext
export const AlertsContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);


  // ➕ Badge count state for Alerts
  const [badgeCount, setBadgeCount] = useState(0);

  const extractPermissions = (obj) => {
    let results = [];
    function search(currentObj) {
      if (!currentObj || typeof currentObj !== 'object') return;
      if (Array.isArray(currentObj.permissions)) {
        results.push(...currentObj.permissions);
      }
      for (const key in currentObj) {
        if (typeof currentObj[key] === 'object') {
          search(currentObj[key]);
        }
      }
    }
    search(obj);
    return results;
  };

  const groupPermissionsByCodename = (permissionsList) => {
    const grouped = {};
    permissionsList.forEach((perm) => {
      const { type_name, operation_name, codename } = perm;

      if (!grouped[type_name]) {
        grouped[type_name] = {
          operations: [],
          codenames: [],
        };
      }

      grouped[type_name].operations.push(operation_name);
      grouped[type_name].codenames.push(codename);
    });

    // Log the grouped permissions in the desired format
    if (__DEV__) {
      console.log('✅ Grouped Permissions by Codename:');
      Object.keys(grouped).forEach((type) => {
        console.log(` LOG    🔑 Codenames: ${grouped[type].codenames.join(', ')}`);
      });
    }

    return grouped;
  };

  const fetchAndSetUserData = async () => {
    const userRes = await fetchCurrentUserInfo();
    const userData = userRes.data;
    setUser(userData);

    const fetchedPermissions = extractPermissions(userData);
    setPermissions(fetchedPermissions);

    const groupedPermissions = groupPermissionsByCodename(fetchedPermissions);

    await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
    await AsyncStorage.setItem('userPermissions', JSON.stringify(groupedPermissions));

    if (__DEV__) {
      console.log('✅ DEV: Profile Picture URL:', userData.profile_image);
      console.log('✅ DEV: User Group Name:', userData.group?.name || 'No Group');
    }
  };

  const fetchAndSetBranchesAndYears = async () => {
  const [branchesRes, yearsRes] = await Promise.all([
    fetchActiveBranches(),
    fetchAcademicYears(),
  ]);
  const branchesData = branchesRes?.data?.results || [];
  const yearsData = yearsRes?.data?.results || [];

  setBranches(branchesData);
  setAcademicYears(yearsData);

  if (__DEV__) {
    console.log('Branch Names:', branchesData.map(b => b.name));
    console.log('Academic Year Names:', yearsData.map(y => y.name));
  }

  // Always set a default if available
  if (branchesData.length) setSelectedBranch(branchesData[0]);
  if (yearsData.length) setSelectedAcademicYear(yearsData[0]);
};


  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);

          const storedUser = await AsyncStorage.getItem('userProfile');
          const storedPerms = await AsyncStorage.getItem('userPermissions');

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          if (storedPerms) {
            setPermissions(JSON.parse(storedPerms));
          }

          await fetchAndSetUserData();
          await fetchAndSetBranchesAndYears();
        }
      } catch (err) {
        console.error('AuthContext Error:', err);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (newToken) => {
    await AsyncStorage.setItem('userToken', newToken);
    setToken(newToken);

    try {
      await fetchAndSetUserData();
      await fetchAndSetBranchesAndYears();
    } catch (err) {
      console.error('Login: Failed to fetch user/permissions:', err);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userProfile', 'userPermissions']);
    setToken(null);
    setUser(null);
    setPermissions([]);
    setBranches([]);
    setAcademicYears([]);

    if (__DEV__) {
      console.log('✅ DEV: Logged out + cleared storage.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        permissions,
        branches,
        academicYears,
        loading,
        login,
        logout,
        selectedBranch,
    setSelectedBranch,
    selectedAcademicYear,
    setSelectedAcademicYear,
      }}
    >
      <AlertsContext.Provider value={{ badgeCount, setBadgeCount }}>
        {children}
      </AlertsContext.Provider>
    </AuthContext.Provider>
  );
};
