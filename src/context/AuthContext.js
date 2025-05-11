import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCurrentUserInfo, fetchActiveBranches, fetchAcademicYears } from '../api/common';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

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
        //console.log(` LOG  - ${type}: ${grouped[type].operations.join(', ')}`);
        
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

    // Group permissions by codename
    const groupedPermissions = groupPermissionsByCodename(fetchedPermissions);

    await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
    await AsyncStorage.setItem('userPermissions', JSON.stringify(groupedPermissions));

    // Development-only logging
    if (__DEV__) {
      //console.log('✅ DEV: User Data:', userData);
      //console.log('✅ DEV: Grouped Permissions:', groupedPermissions);

      // Log Profile Picture URL and Group Name
      console.log('✅ DEV: Profile Picture URL:', userData.profile_image); // Assuming profile_image is in userData
      console.log('✅ DEV: User Group Name:', userData.group?.name || 'No Group'); // Extracting group name
    }
  };

  const fetchAndSetBranchesAndYears = async () => {
    const [branchesRes, yearsRes] = await Promise.all([fetchActiveBranches(), fetchAcademicYears()]);
    const branchesData = branchesRes?.data?.results || [];
    const yearsData = yearsRes?.data?.results || [];

    setBranches(branchesData);
    setAcademicYears(yearsData);

    // Development-only logging
    if (__DEV__) {
      //console.log('✅ DEV: Branches:', branchesData);
      const branchNames = branchesData.map(branch => branch.name);
      console.log('Branch Names:', branchNames);

      //console.log('✅ DEV: Academic Years:', yearsData);
      const academicYearNames = yearsData.map(year => year.name);
      console.log('Academic Year Names:', academicYearNames);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
