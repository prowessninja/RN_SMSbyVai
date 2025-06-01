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
  TextInput,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import CommonAPI from '../api/common';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
//import MapboxGL from '@rnmapbox/maps';
//import { fetchMapboxToken } from '../api/mapHelper';
import MapView, { Marker } from 'react-native-maps';


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
  const [branchFormVisible, setBranchFormVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchFormData, setBranchFormData] = useState({
    name: '', city: '', state: '', zip_code: '',
    landmark: '', street: '', latitude: '', longitude: '',
    is_main_branch: 'false',
  });

  const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

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
          <>
            <View style={styles.expandedActions}>

              <TouchableOpacity style={styles.actionButton} onPress={() => openBranchModal(branch)}>
                <Icon name="edit" size={16} color="#fff" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

            </View>

            {branch.center_point?.coordinates && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: branch.center_point.coordinates[1],
                  longitude: branch.center_point.coordinates[0],
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={true}       // allow dragging
                zoomEnabled={true}         // allow pinch zoom
                pitchEnabled={true}        // allow tilt gestures
                rotateEnabled={true}       // allow rotation
              >
                <Marker
                  coordinate={{
                    latitude: branch.center_point.coordinates[1],
                    longitude: branch.center_point.coordinates[0],
                  }}
                  title={branch.name}
                />
              </MapView>
            )}
          </>
        )}

      </View>
    );
  };

  const openBranchModal = (branch = null) => {
    if (branch) {
      const address = branch.address || {};
      setEditingBranch(branch);
      setBranchFormData({
        id: branch.id,
        name: branch.name || '',
        city: address.city || '',
        state: address.state || '',
        zip_code: address.zip_code || '',
        landmark: address.landmark || '',
        street: address.street || '',
        latitude: branch.center_point?.coordinates?.[1]?.toString() || '',
        longitude: branch.center_point?.coordinates?.[0]?.toString() || '',
        is_main_branch: branch.is_main_branch ? 'true' : 'false',
      });
    } else {
      setEditingBranch(null);
      setBranchFormData({
        name: '', city: '', state: '', zip_code: '',
        landmark: '', street: '', latitude: '', longitude: '',
        is_main_branch: 'false',
      });
    }
    setBranchFormVisible(true);
  };

  const handleSaveBranch = async () => {
    try {
      setShowOverlay(true);
      setOverlayText(editingBranch ? 'Updating branch...' : 'Creating branch...');

      await CommonAPI.saveBranch(branchFormData);

      setOverlayText('Success!');
      setBranchFormVisible(false);

      // 🔁 Refetch all metadata (including updated branch list)
      await fetchMetaData();

      // ✅ Optionally set the newly created branch as selected
      if (!editingBranch) {
        const branchList = await CommonAPI.fetchActiveBranches();
        const allBranches = branchList.data?.results || [];
        const newlyAdded = allBranches.find(b => b.name === branchFormData.name);
        if (newlyAdded) {
          setSelectedBranch(newlyAdded.id);
          fetchBranchesData(newlyAdded.id);
        }
      } else {
        fetchBranchesData(selectedBranch);
      }

    } catch (error) {
      console.error('Branch save failed:', error);
      setOverlayText('Failed to save branch.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };





  return (
    <View style={{ flex: 1 }}>
      <Modal visible={showOverlay} transparent animationType="fade">
        <View style={styles.overlayContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>{overlayText}</Text>
        </View>
      </Modal>

      <Modal visible={branchFormVisible} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: '90%',
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
              {editingBranch ? 'Edit Branch Details' : 'Add Branch'}
            </Text>

            {[
              { key: 'name', label: 'Name of the Branch' },
              { key: 'city', label: 'City' },
              { key: 'zip_code', label: 'Zip Code' },
              { key: 'landmark', label: 'Landmark' },
              { key: 'street', label: 'Street' },
              { key: 'latitude', label: 'Latitude' },
              { key: 'longitude', label: 'Longitude' },
            ].map(({ key, label }) => (
              <View key={key} style={{ marginBottom: 15 }}>
                <Text style={{ marginBottom: 5, fontWeight: '600', color: '#2d3e83' }}>{label}</Text>
                <TextInput
                  placeholder={label}
                  value={branchFormData[key]}
                  onChangeText={text => setBranchFormData(prev => ({ ...prev, [key]: text }))}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    height: 40,
                  }}
                />
              </View>
            ))}

            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5, fontWeight: '600', color: '#2d3e83' }}>State</Text>
              <Dropdown
                data={INDIAN_STATES.map(state => ({ label: state, value: state }))}
                labelField="label"
                valueField="value"
                value={branchFormData.state}
                placeholder="Select State"
                onChange={item => setBranchFormData(prev => ({ ...prev, state: item.value }))}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  height: 40,
                }}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ marginBottom: 5, fontWeight: '600', color: '#2d3e83' }}>Is Main Branch</Text>
              <Dropdown
                data={[{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }]}
                labelField="label"
                valueField="value"
                value={branchFormData.is_main_branch}
                placeholder="Is Main Branch"
                onChange={item => setBranchFormData(prev => ({ ...prev, is_main_branch: item.value }))}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  height: 40,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setBranchFormVisible(false)}
                style={{
                  backgroundColor: '#2d3e83',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveBranch}
                style={{
                  backgroundColor: '#2d3e83',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {editingBranch ? 'Update' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
            <TouchableOpacity style={styles.createButton} onPress={() => openBranchModal()}>
              <Icon name="add-circle-outline" size={20} color="#2d3e83" />
              <Text style={styles.createText} >Branch</Text>
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

  map: {
    height: 350,
    marginTop: 10,
    borderRadius: 10,
  },


});

export default BranchesScreen;
