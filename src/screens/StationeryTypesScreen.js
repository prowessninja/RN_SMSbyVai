import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import * as CommonAPI from '../api/common';
import StationeryTypeModal from '../components/StationeryTypeModal';

const StationeryTypesScreen = () => {
  const nav = useNavigation();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    is_active: true,
  });

  const [showProfileCard, setShowProfileCard] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await CommonAPI.fetchStationeryTypes();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch stationery types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAndMeta = async () => {
    try {
      const [branchRes, yearRes, userRes] = await Promise.all([
        CommonAPI.fetchActiveBranches(),
        CommonAPI.fetchAcademicYears(),
        CommonAPI.fetchCurrentUserInfo(),
      ]);
      const branchesData = branchRes.data?.results || [];
      const academicYearsData = yearRes.data?.results || [];
      const user = userRes.data;

      setBranches(branchesData.map(b => ({ label: b.name, value: b.id })));
      setAcademicYears(academicYearsData.map(y => ({ label: y.name, value: y.id })));
      setSelectedBranch(branchesData[0]?.id || null);
      setSelectedYear(academicYearsData[0]?.id || null);
      setCurrentUserName(user.first_name || 'User');
      setCurrentUserRole(user.group?.name || 'Role');
      setProfileImage(user.profile_image);
    } catch (err) {
      console.error('Failed to load profile or dropdowns', err);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchUserAndMeta();
  }, []);

  const openCreate = () => {
    setFormData({ id: null, name: '', description: '', is_active: true });
    setIsEditMode(false);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      is_active: item.is_active,
    });
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    setModalLoading(true);
    try {
      if (isEditMode) {
        await CommonAPI.updateStationeryType(formData.id, formData);
      } else {
        await CommonAPI.createStationeryType(formData);
      }
      setModalVisible(false);
      fetchTypes();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await CommonAPI.deleteStationeryType(id);
            await fetchTypes();
          } catch (err) {
            Alert.alert('Error', 'Could not delete.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleAcademicYearChange = (value) => setSelectedYear(value);
  const handleBranchChange = (value) => setSelectedBranch(value);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {item.name} <Text style={styles.desc}>({item.description})</Text>
        </Text>
        <Text style={styles.status}>
          Status:{' '}
          <Text style={{ color: item.is_active ? 'green' : 'red' }}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Icon name="edit" size={22} color="#2d3e83" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 12 }}>
          <Icon name="delete" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Toggle and Profile Card */}
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

      {showProfileCard && (
        <View style={styles.profileCard}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileAvatar} />
          ) : (
            <LottieView
              source={require('../../assets/default.json')}
              autoPlay
              loop
              style={styles.profileAnimation}
            />
          )}
          <Text style={styles.profileName}>{currentUserName}</Text>
          <Text style={styles.profileRole}>{currentUserRole}</Text>
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => nav.navigate('Dashboard')}>
            <Icon name="arrow-back" size={24} color="#2d3e83" />
          </TouchableOpacity>
          <Icon name="inventory" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
          <Text style={styles.title}>Stationery Type</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Icon name="add-circle-outline" size={24} color="#2d3e83" />
          <Text style={styles.addText}>Type</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2d3e83" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#2d3e83' }}>
            Loading Stationery Types... Please hold tight!
          </Text>
        </View>
      ) : (
        <FlatList
          data={types}
          keyExtractor={i => i.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal */}
      <StationeryTypeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        loading={modalLoading}
        formData={formData}
        setFormData={setFormData}
        isEditMode={isEditMode}
      />

      {actionLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f4f6f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3e83',
    marginLeft: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2d3e83',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  desc: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    marginTop: 4,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconToggle: {
    alignSelf: 'flex-end',
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 10,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  profileAvatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileAnimation: {
    height: 80,
    width: 80,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  profileRole: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
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
});

export default StationeryTypesScreen;
