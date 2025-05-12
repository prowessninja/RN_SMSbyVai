// (Keep all the same imports at the top)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  FlatList,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import CommonAPI from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';


if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANDOM_BG_COLORS = ['#f9c2ff', '#d0f0c0', '#cce5ff', '#ffecb3'];


const StandardsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [standardsData, setStandardsData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [sectionsByStandard, setSectionsByStandard] = useState({});
  const [expandedStandards, setExpandedStandards] = useState({});

  const [showProfileCard, setShowProfileCard] = useState(true);

  useEffect(() => {
    fetchMetaData();
  }, []);
  const navigation = useNavigation();

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
      setCurrentUserName(userData.first_name || 'User');
      setCurrentUserRole(userData.group?.name || 'Role');
      setProfileImage(userData.profile_image);

      if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
      if (academicYearsData.length > 0) setSelectedYear(academicYearsData[0].id);

      fetchStandardsData(academicYearsData[0].id, branchesData[0].id);
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
      setStandardsData(standardsRes.results);
      setSectionsByStandard({});
      setExpandedStandards({});
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

  const handleCardPress = async (standard) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const isExpanded = expandedStandards[standard.id];
    if (isExpanded) {
      setExpandedStandards(prev => ({ ...prev, [standard.id]: false }));
      return;
    }

    setExpandedStandards(prev => ({ ...prev, [standard.id]: true }));

    if (!sectionsByStandard[standard.id]) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await CommonAPI.fetchSectionsByBranchAndStandard(
          selectedBranch,
          standard.id,
          token
        );
        setSectionsByStandard(prev => ({
          ...prev,
          [standard.id]: response.results,
        }));
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSectionsByStandard(prev => ({
          ...prev,
          [standard.id]: [],
        }));
      }
    }
  };

  const renderSectionCard = (section) => (
    <View key={section.id} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{section.name}</Text>
      <Text>Total Students: {section.student_count}</Text>
      <Text>Status: {section.is_active ? 'Active' : 'Inactive'}</Text>
      <View style={styles.sectionButtons}>
        <TouchableOpacity style={styles.actionBtn}><Text>View</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Text>Add Students</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Text>Change Students</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Text>Mark Inactive</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderStandardItem = ({ item: standard }) => {
  const isExpanded = expandedStandards[standard.id];
  const sections = sectionsByStandard[standard.id];

  return (
    <View key={standard.id} style={{ marginBottom: 12 }}>
      <View style={[styles.cardContainer, { backgroundColor: RANDOM_BG_COLORS[standard.id % 4] }]}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{standard.name}</Text>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.stdActionBtn}><Text>View</Text></TouchableOpacity>
            <TouchableOpacity style={styles.stdActionBtn}><Text>Edit</Text></TouchableOpacity>
            <TouchableOpacity style={styles.stdActionBtn}><Text>Mark Inactive</Text></TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => handleCardPress(standard)} style={styles.expandIcon}>
            <Icon
              name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#2d3e83"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardMetaRow}>
          <Text>Total Students: {standard.student_assigned_count}</Text>
          <Text>Sections: {standard.section_count}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Icon
              name={standard.is_active ? 'check-circle' : 'close'}
              size={16}
              color={standard.is_active ? '#4CAF50' : '#f44336'}
            />
            <Text style={{ marginLeft: 6, color: '#555' }}>
              {standard.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      {isExpanded && (
        <View style={{ paddingLeft: 10 }}>
          {sections === undefined ? (
            <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#2d3e83" />
          ) : sections.length === 0 ? (
            <Text style={{ marginTop: 10, color: '#888', marginLeft: 10 }}>
              No sections available.
            </Text>
          ) : (
            sections.map(renderSectionCard)
          )}
        </View>
      )}
    </View>
  );
};


  return (
    <View style={{ flex: 1 }}>
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
          <TouchableOpacity
  onPress={() => setShowProfileCard(prev => !prev)}
  style={styles.iconToggle}
>
  <Eyecon
    name={showProfileCard ? 'eye-slash' : 'eye'}
    size={15}
    color="#fff"
  />
</TouchableOpacity>

          <View style={{ padding: 15, marginBottom: 1 }}>
            {showProfileCard && (
            <View style={styles.profileContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <LottieView
              source={require('../../assets/default.json')}
              autoPlay
              loop
              style={styles.animation}
              />
              )}
              <Text style={styles.greeting}>{currentUserName}</Text>
              <Text style={styles.roleText}>{currentUserRole}</Text>
            

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
            </View> )}
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#2d3e83" />
                </TouchableOpacity>
                <Icon name="school" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
                <Text style={styles.headerTitle}>Standards</Text>
            </View>
              <TouchableOpacity style={styles.createButton} onPress={() => {/* Add create standard logic */}}>
                <Icon name="add-circle-outline" size={20} color="#2d3e83" />
                <Text style={styles.createText}>Create Standard</Text>
                </TouchableOpacity>
            </View>


          <FlatList
            data={standardsData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderStandardItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2d3e83']} />
            }
            contentContainerStyle={{ padding: 20 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f4f6f9' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
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
    marginBottom: 15,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 14, color: '#fff', marginBottom: 10
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  dropdown: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
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
  sectionCard: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3e83',
  },
  sectionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: '#e6e6e6',
    padding: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  animation: { height: 80, width: 80, marginBottom: 10 },
  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 10,
},

headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},

headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginLeft: 10,
  color: '#2d3e83',
},

createButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#e6ecf7',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
},

createText: {
  marginLeft: 6,
  fontSize: 14,
  color: '#2d3e83',
  fontWeight: '500',
},
cardTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

cardMetaRow: {
marginTop: 10,
paddingTop: 8,
borderTopWidth: 1,
borderTopColor: '#2d3e83',
},

actionButtonsRow: {
  flexDirection: 'row',
  flexShrink: 1,
  gap: 8,
},

stdActionBtn: {
  backgroundColor: '#fff',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#ccc',
},

expandIcon: {
  padding: 4,
  marginLeft: 6,
},
iconToggle: {
  alignSelf: 'flex-end',
  backgroundColor: '#2d3e83',
  padding: 8,
  borderRadius: 20,
  marginRight: 10,
  marginTop: 10,
},


});

export default StandardsScreen;
