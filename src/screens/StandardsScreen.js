import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommonAPI from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RANDOM_BG_COLORS = ['#f9c2ff', '#d0f0c0', '#cce5ff', '#ffecb3'];

const StandardsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Pull to refresh
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [standardsData, setStandardsData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');

  useEffect(() => {
    fetchMetaData();
  }, []);

  const fetchMetaData = async () => {
    try {
      const [branchRes, yearRes, userRes] = await Promise.all([
        CommonAPI.fetchActiveBranches(),
        CommonAPI.fetchAcademicYears(),
        CommonAPI.fetchCurrentUserInfo(),
      ]);

      const branchesData = branchRes.data?.results || [];
      const academicYearsData = yearRes.data?.results || [];

      setBranches(branchesData.map(branch => ({ label: branch.name, value: branch.id })));
      setAcademicYears(academicYearsData.map(year => ({ label: year.name, value: year.id })));

      const userData = userRes.data;
      setCurrentUserRole(userData.group?.name || 'Role');
      setProfileImage(userData.profile_image);

      if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
      if (academicYearsData.length > 0) setSelectedYear(academicYearsData[0].id);

      fetchStandardsData(academicYearsData[0].id, branchesData[0].id); // Fetch initial standards data
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStandardsData = async (yearId, branchId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const standardsRes = await CommonAPI.fetchStandardsForYearBranch(yearId, branchId, token);

      console.log('Standards API Response:', standardsRes);
      setStandardsData(standardsRes.results);
    } catch (error) {
      console.error('Error fetching standards data:', error);
    }
  };

  const handleAcademicYearChange = (yearId) => {
    setSelectedYear(yearId);
    setShowOverlay(true);
    setOverlayText('Academic Year changed successfully');
    fetchStandardsData(yearId, selectedBranch);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setShowOverlay(true);
    setOverlayText('Branch changed successfully');
    fetchStandardsData(selectedYear, branchId);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStandardsData(selectedYear, selectedBranch).finally(() => setRefreshing(false));
  }, [selectedYear, selectedBranch]);

  const handleCardPress = (standard) => {
    console.log('Card clicked:', standard);
    // Navigate or perform action here
  };

  const handleEditPress = (standard) => {
    console.log('Edit pressed for:', standard);
    // Handle edit logic here
  };

  const handleInactivePress = (standard) => {
    console.log('Inactive pressed for:', standard);
    // Handle inactive logic here
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2d3e83']} />
      }
    >
      <View style={{ flex: 1, padding: 20 }}>
        <Modal visible={showOverlay} transparent animationType="fade">
          <View style={styles.overlayContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>{overlayText}</Text>
          </View>
        </Modal>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2d3e83" />
          </View>
        ) : (
          <>
            <View style={[styles.cardContainer, { backgroundColor: RANDOM_BG_COLORS[2] }]}>
              <View style={styles.profileContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  <Icon name="account-circle" size={60} color="#2d3e83" />
                )}
                <Text style={styles.roleText}>{currentUserRole}</Text>
              </View>

              <View style={styles.dropdownRow}>
                <Dropdown
                  style={styles.dropdown}
                  data={academicYears}
                  labelField="label"
                  valueField="value"
                  value={selectedYear}
                  placeholder="Select Academic Year"
                  onChange={item => handleAcademicYearChange(item.value)}
                />
                <Dropdown
                  style={styles.dropdown}
                  data={branches}
                  labelField="label"
                  valueField="value"
                  value={selectedBranch}
                  placeholder="Select Branch"
                  onChange={item => handleBranchChange(item.value)}
                />
              </View>
            </View>

            {/* Display standards data in cards */}
            <View style={{ flex: 1 }}>
              {standardsData.map((standard) => (
                <TouchableOpacity
                  key={standard.id}
                  onPress={() => handleCardPress(standard)}
                  activeOpacity={0.7}
                  style={[
                    styles.cardContainer,
                    { backgroundColor: RANDOM_BG_COLORS[standard.id % 4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                  ]}
                >
                  <View>
                    <Text style={styles.cardTitle}>{standard.name}</Text>
                    <Text>Sections: {standard.section_count}</Text>
                    <Text>Assigned Students: {standard.student_assigned_count}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => handleEditPress(standard)} style={styles.iconButton}>
                      <Icon name="edit" size={24} color="#2d3e83" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleInactivePress(standard)} style={styles.iconButton}>
                      <Icon name="remove-circle-outline" size={24} color="#d9534f" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3e83',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    width: '48%',
    height: 40,
    borderColor: '#2d3e83',
    borderWidth: 1,
    borderRadius: 6,
    paddingLeft: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3e83',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default StandardsScreen;
