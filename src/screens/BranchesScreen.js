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
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANDOM_BG_COLORS = ['#f9c2ff', '#d0f0c0', '#cce5ff', '#ffecb3'];

// ...all your imports remain the same

const BranchesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchesData, setBranchesData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [expandedBranches, setExpandedBranches] = useState({});
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

      const branchesList = branchRes.data?.results || [];
      const academicYearsList = yearRes.data?.results || [];

      setBranches(branchesList.map(branch => ({ label: branch.name, value: branch.id })));
      setAcademicYears(academicYearsList.map(year => ({ label: year.name, value: year.id })));

      const userData = userRes.data;
      setCurrentUserName(userData.first_name || 'User');
      setCurrentUserRole(userData.group?.name || 'Role');
      setProfileImage(userData.profile_image);

      if (branchesList.length > 0) {
        const defaultBranchId = branchesList[0].id;
        setSelectedBranch(defaultBranchId);
        fetchBranchesData(defaultBranchId);
      }

    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchesData = async (branchId) => {
    try {
      const response = await CommonAPI.fetchBranchDetailsById(branchId);
      console.log('From BS.js:', response); // keep for debug
      const singleBranchData = response;
      setBranchesData(singleBranchData ? [singleBranchData] : []);
    } catch (error) {
      console.error('Error fetching branches data:', error);
      setBranchesData([]);
    }
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setShowOverlay(true);
    setOverlayText('Branch changed successfully');
    fetchBranchesData(branchId);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedBranch) {
      fetchBranchesData(selectedBranch).finally(() => setRefreshing(false));
    }
  }, [selectedBranch]);

  const handleCardPress = (branch) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const isExpanded = expandedBranches[branch.id];
    setExpandedBranches(prev => ({ ...prev, [branch.id]: !isExpanded }));
  };

  const renderBranchCard = (branch) => {
  const isExpanded = expandedBranches[branch.id];
  const cardColor = RANDOM_BG_COLORS[branch.id % RANDOM_BG_COLORS.length];
  const address = branch.address || {};

  return (
    <View key={branch.id} style={[styles.cardContainer, { backgroundColor: cardColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{branch.name}</Text>
        <TouchableOpacity onPress={() => handleCardPress(branch)}>
          <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardMetaRow}>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>State:</Text> {address.state || 'N/A'}</Text>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>City:</Text> {address.city || 'N/A'}</Text>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>Zip Code:</Text> {address.zip_code || 'N/A'}</Text>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>Landmark:</Text> {address.landmark || 'N/A'}</Text>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>Street:</Text> {address.street || 'N/A'}</Text>
        <Text style={styles.cardMetaText}><Text style={styles.boldLabel}>Status:</Text> {branch.is_active ? 'Active' : 'Inactive'}</Text>
      </View>

      {isExpanded && (
        <View style={styles.expandedActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Eyecon name="eye" size={16} color="#fff" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="block" size={16} color="#fff" />
            <Text style={styles.actionText}>Mark Inactive</Text>
          </TouchableOpacity>
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2d3e83" />
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowProfileCard(prev => !prev)} style={styles.iconToggle}>
            <Eyecon name={showProfileCard ? 'eye-slash' : 'eye'} size={15} color="#fff" />
          </TouchableOpacity>

          <View style={{ padding: 15 }}>
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
                    onChange={item => setSelectedYear(item.value)}
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
              <Icon name="apartment" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
              <Text style={styles.headerTitle}>Branches</Text>
            </View>
            <TouchableOpacity style={styles.createButton}>
              <Icon name="add-circle-outline" size={20} color="#2d3e83" />
              <Text style={styles.createText}>Create Branch</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={branchesData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => renderBranchCard(item)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2d3e83"]} />
            }
            contentContainerStyle={{ padding: 20 }}
          />
        </>
      )}
    </View>
  );
};

// your styles (same as before)...


const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: { marginTop: 10, fontSize: 16, color: '#fff' },
  cardContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    elevation: 3,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 10,
},
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  animation: { width: 80, height: 80, marginBottom: 12 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  roleText: { color: '#fff', marginTop: 3, fontSize: 13 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3e83' },
  cardMetaRow: {
marginTop: 10,
paddingTop: 8,
borderTopWidth: 1,
borderTopColor: '#2d3e83',
},
  expandedActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  actionButton: {
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: { color: '#fff', marginLeft: 5 },
  iconToggle: {
    backgroundColor: '#2d3e83',
    padding: 5,
    borderRadius: 20,
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 5,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3e83', marginLeft: 10 },
  createButton: { flexDirection: 'row', alignItems: 'center' },
  createText: { marginLeft: 5, fontWeight: '600', color: '#2d3e83' },
  cardDetails: {
  marginTop: 10,
  paddingHorizontal: 10,
},

detailText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
},

metaText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
cardMetaText: {
  fontSize: 13,
  marginVertical: 2,
  color: '#333',
},
boldLabel: {
  fontWeight: 'bold',
},

});

export default BranchesScreen;
