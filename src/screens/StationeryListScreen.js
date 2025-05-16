// Keep all the same imports
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

const RANDOM_BG_COLORS = ['#ffe0b2', '#dcedc8', '#b3e5fc', '#f8bbd0'];

const StationeryListScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [stationeryData, setStationeryData] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [showProfileCard, setShowProfileCard] = useState(true);

  const navigation = useNavigation();

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
      setCurrentUserName(userData.first_name || 'User');
      setCurrentUserRole(userData.group?.name || 'Role');
      setProfileImage(userData.profile_image);

      if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
      if (academicYearsData.length > 0) setSelectedYear(academicYearsData[0].id);

      fetchStationeryData(academicYearsData[0].id, branchesData[0].id);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationeryData = async (yearId, branchId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await CommonAPI.fetchStandardsForYearBranch(yearId, branchId, token);
const parsedData = response.results.map(standard => ({
  id: standard.id,
  name: standard.name,
  items: standard.stationary.map((s, index) => ({
    id: `${standard.id}-${index}`,
    name: s.name,
    quantity: s.quantity,
    price: s.price,
    type: s.stationary_type?.name || '—',
  })),
}));
setStationeryData(parsedData);
    setExpandedItems({});
  } catch (error) {
    console.error('Error fetching stationery data:', error);
  }
};

  const handleAcademicYearChange = (yearId) => {
  setSelectedYear(yearId);
  if (!selectedBranch) return;

  setShowOverlay(true);
  setOverlayText('Academic Year changed successfully');
  fetchStationeryData(yearId, selectedBranch);
  setTimeout(() => setShowOverlay(false), 1000);
};

  const handleBranchChange = (branchId) => {
  setSelectedBranch(branchId);
  if (!selectedYear) return;

  setShowOverlay(true);
  setOverlayText('Branch changed successfully');
  fetchStationeryData(selectedYear, branchId);
  setTimeout(() => setShowOverlay(false), 1000);
};

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStationeryData(selectedYear, selectedBranch).finally(() => setRefreshing(false));
  }, [selectedYear, selectedBranch]);

  const handleItemPress = (itemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const renderItemGroup = ({ item }) => {
  const backgroundColor = RANDOM_BG_COLORS[item.id % RANDOM_BG_COLORS.length];
  const isExpanded = expandedItems[item.id];

  return (
    <View style={[styles.cardContainer, { backgroundColor }]}>
      <TouchableOpacity onPress={() => handleItemPress(item.id)} style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.stationery_type.name}</Text>
        <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#2d3e83" />
      </TouchableOpacity>

      {isExpanded && item.items?.map(subItem => (
        <View key={subItem.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{subItem.name}</Text>
          <Text style={styles.tableCell}>{subItem.quantity}</Text>
          <Text style={styles.tableCell}>{subItem.price || '—'}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={18} color="#2d3e83" />
          </TouchableOpacity>
        </View>
      ))}
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
          <TouchableOpacity onPress={() => setShowProfileCard(prev => !prev)} style={styles.iconToggle}>
            <Eyecon name={showProfileCard ? 'eye-slash' : 'eye'} size={15} color="#fff" />
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
              </View>
            )}
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#2d3e83" />
              </TouchableOpacity>
              <Icon name="inventory" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
              <Text style={styles.headerTitle}>Stationery</Text>
            </View>
            <TouchableOpacity style={styles.createButton}>
              <Icon name="add-circle-outline" size={20} color="#2d3e83" />
              <Text style={styles.createText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        
          <FlatList
                data={stationeryData}
                keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2d3e83']} />
  }
  contentContainerStyle={{ padding: 20 }}
  renderItem={({ item }) => (
    <View style={styles.classCard}>
  <TouchableOpacity
    style={styles.classHeader}
    onPress={() => handleItemPress(item.id)}
  >
    <Text style={styles.classTitle}> <Text style={styles.className}>{item.name}</Text></Text>
    <Icon
      name={expandedItems[item.id] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
      size={24}
      color="#2d3e83"
    />
  </TouchableOpacity>

  {expandedItems[item.id] && (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell]}>Title</Text>
        <Text style={[styles.cell, styles.headerCell]}>Quantity</Text>
        <Text style={[styles.cell, styles.headerCell]}>Amount</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add item</Text>
        </TouchableOpacity>
      </View>

      {item.items?.map((row, index) => (
        <View key={row.id} style={styles.tableRow}>
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{row.name} ({row.type})</Text>
            <Text style={styles.cell}>{row.quantity}</Text>
            <Text style={styles.cell}>{row.price}</Text>
          <TouchableOpacity style={styles.editIconWrapper}>
            <Icon name="edit" size={18} color="#2d3e83" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )}
</View>
  )}
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
tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#2d3e83',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
},
tableRow: {
  flexDirection: 'row',
  backgroundColor: '#f0f0f0',
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
tableCell: {
  flex: 1,
  fontSize: 14,
  color: '#333',
},
headerText: {
  color: 'white',
  fontWeight: 'bold',
},
editButton: {
  flex: 1,
  alignItems: 'center',
},
classCard: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  elevation: 2,
},

classHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderColor: '#ccc',
  paddingBottom: 8,
},

classTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2d3e83',
},

className: {
  fontWeight: '600',
  color: '#2d3e83',
},

tableContainer: {
  marginTop: 12,
},

tableHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f4ff',
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 6,
},

tableRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  marginTop: 4,
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 6,
},

cell: {
  flex: 1,
  textAlign: 'center',
  color: '#333',
  fontSize: 14,
},

headerCell: {
  fontWeight: 'bold',
  color: '#2d3e83',
},

addButton: {
  backgroundColor: '#2d3e83',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},

addButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 12,
},

editIconWrapper: {
  flex: 1,
  alignItems: 'center',
},


});

export default StationeryListScreen;
