import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { AuthContext } from '../context/AuthContext';
import { fetchUsersList } from '../api/userlist';
import UserCardList from '../components/UserCardList';
import debounce from 'lodash.debounce';
import PermissionsHOC from '../hoc/PermissionsHOC';
import Eyecon from 'react-native-vector-icons/FontAwesome5';

const UsersScreen = ({ hasPermission }) => {
  const navigation = useNavigation();
  const { token, user, academicYears, branches } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(true);

  const debounceRef = useRef();

  useEffect(() => {
    if (academicYears?.length && !selectedYear) {
      setSelectedYear(academicYears[0].id);
    }
    if (branches?.length && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [academicYears, branches]);

  const debouncedSetSearch = useCallback(
    debounce(text => {
      setDebouncedSearch(text);
      setPage(1);
    }, 400),
    []
  );

  const handleSearch = text => {
    setSearchText(text);
    debouncedSetSearch(text);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSearchText('');
      setDebouncedSearch('');
      setSelectedGroup(null);
      setPage(1);

      if (selectedYear && selectedBranch) {
        const fetchGroups = async () => {
          try {
            const filters = {
              academic_year: selectedYear,
              branch: selectedBranch,
              page_size: 10,
            };
            const { results } = await fetchUsersList(token, filters);
            const uniqueGroups = [
              ...new Map(results.map(u => [u.group?.id, u.group])).values(),
            ].filter(Boolean);
            setGroups(uniqueGroups);
          } catch (err) {
            console.error('Error fetching groups:', err);
          }
        };

        fetchGroups();
      }
    }, [selectedYear, selectedBranch])
  );

  useEffect(() => {
    if (!token || !selectedYear || !selectedBranch) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          academic_year: selectedYear,
          branch: selectedBranch,
          group: selectedGroup,
          search: debouncedSearch,
          page,
          page_size: 10,
        };
        const { results = [], next } = await fetchUsersList(token, filters);
        if (isMounted) {
          setUsers(prev => (page === 1 ? results : [...prev, ...results]));
          setHasMore(!!next);
        }
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [token, selectedYear, selectedBranch, selectedGroup, debouncedSearch, page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(p => p + 1);
  };

  const handleAddUserPress = () => {
    Alert.alert(
      'Confirm',
      `New User will be created in Branch: '${selectedBranch}'. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            navigation.navigate('AddUser', {
              branchId: selectedBranch,
              yearId: selectedYear,
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Toggle */}
      <TouchableOpacity
        onPress={() => setShowProfileCard(prev => !prev)}
        style={styles.iconToggle}
      >
        <Eyecon name={showProfileCard ? 'eye-slash' : 'eye'} size={15} color="#fff" />
      </TouchableOpacity>

      {/* Header Card */}
      <View style={{ padding: 15, marginBottom: 0.5 }}>
        {showProfileCard && (
          <View style={styles.sectionGreeting}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
            ) : (
              <LottieView
                source={require('../../assets/default.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            )}
            <Text style={styles.greeting}>{user?.first_name || 'User'}</Text>
            <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>

            <View style={styles.dropdownRow}>
              <Dropdown
                style={styles.dropdown}
                data={academicYears.map(year => ({ label: year.name, value: year.id }))}
                labelField="label"
                valueField="value"
                value={selectedYear}
                placeholder="Academic Year"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => {
                  setSelectedYear(item.value);
                  setPage(1);
                }}
              />
              <Dropdown
                style={styles.dropdown}
                data={branches.map(branch => ({ label: branch.name, value: branch.id }))}
                labelField="label"
                valueField="value"
                value={selectedBranch}
                placeholder="Branch"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => {
                  setSelectedBranch(item.value);
                  setPage(1);
                }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Page Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2d3e83" />
        </TouchableOpacity>
        <Icon name="account-group" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
        <Text style={styles.title}>Users</Text>
        {hasPermission?.('add_user') && (
          <TouchableOpacity
            style={[styles.addButton, { flexDirection: 'row', alignItems: 'center' }]}
            onPress={handleAddUserPress}
          >
            <Icon name="account-plus" size={24} color="#2d3e83" />
            <Text style={styles.addText}>User</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <Dropdown
          style={styles.dropdownHalf}
          data={groups.map(group => ({ label: group.name, value: group.id }))}
          labelField="label"
          valueField="value"
          value={selectedGroup}
          placeholder="User Group"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          onChange={item => {
            setSelectedGroup(item.value);
            setPage(1);
          }}
        />
        <TextInput
          style={styles.searchInputHalf}
          placeholder="Search by name, identifier..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* List */}
      <UserCardList users={users} loading={loading} onEndReached={handleLoadMore} />

      {/* Overlay Loader */}
      <Modal transparent visible={loading}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f4f6f9' },

  sectionGreeting: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  animation: { height: 80, width: 80, marginBottom: 10 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  role: { fontSize: 14, color: '#fff', marginBottom: 10 },
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
  dropdownText: { fontSize: 14, color: '#333' },
  dropdownPlaceholder: { color: '#999', fontSize: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: {
    fontSize: 22, fontWeight: 'bold', marginLeft: 8, color: '#2d3e83', flex: 1,
  },
  addButton: { marginLeft: 'auto' },
  addText: { marginLeft: 6, fontSize: 16, color: '#2d3e83', fontWeight: '500' },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownHalf: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInputHalf: {
    width: '48%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },

  iconToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PermissionsHOC(UsersScreen, ['view_user']);
