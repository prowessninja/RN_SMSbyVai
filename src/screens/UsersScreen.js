import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import HorizontalSelector from '../components/HorizontalSelector';
import { fetchUsersList } from '../api/userlist';
import { fetchBranches, fetchAcademicYears } from '../api/dashboard';
import UserCardList from '../components/UserCardList';

const UsersScreen = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [years, setYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [yearData, branchData] = await Promise.all([
          fetchAcademicYears(token),
          fetchBranches(token),
        ]);
        setYears(yearData.results || []);
        setBranches(branchData.results || []);
        if (yearData.results?.length) setSelectedYear(yearData.results[0].id);
        if (branchData.results?.length) setSelectedBranch(branchData.results[0].id);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    loadFilters();
  }, [token]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const filters = {
          academic_year: selectedYear,
          branch: selectedBranch,
          group: selectedGroup,
          search: searchText,
          page,
          page_size: 10,
        };
        const data = await fetchUsersList(token, filters);
        const newUsers = data.results || [];
        setUsers(prev => page === 1 ? newUsers : [...prev, ...newUsers]);
        setHasMore(!!data.next);
        setGroups(
          [...new Map(newUsers.map(u => [u.group?.id, u.group])).values()].filter(Boolean)
        );
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [token, selectedYear, selectedBranch, selectedGroup, searchText, page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage(p => p + 1);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Icon name="account-group" size={22} color="#007AFF" style={{ marginLeft: 10 }} />
        <Text style={styles.title}>Users</Text>
      </View>

      <Text style={styles.filterLabel}>Academic Year</Text>
      <HorizontalSelector
        items={years}
        selectedId={selectedYear}
        onSelect={item => { setSelectedYear(item.id); setPage(1); }}
      />

      <Text style={styles.filterLabel}>Branch</Text>
      <HorizontalSelector
        items={branches}
        selectedId={selectedBranch}
        onSelect={item => { setSelectedBranch(item.id); setPage(1); }}
      />

      <Text style={styles.filterLabel}>User Group</Text>
      <HorizontalSelector
        items={groups}
        selectedId={selectedGroup}
        onSelect={item => { setSelectedGroup(item.id); setPage(1); }}
      />

      {/* Separator line */}
      <View style={styles.divider} />

      {/* Search box below filters */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, identifier, contact..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Display User Cards in Two Columns with Lazy Load */}
      <UserCardList
        users={users}
        loading={loading}
        onEndReached={handleLoadMore}
      />

      {loading && (
        <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f4f6f9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2d3e83',
  },
  filterLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default UsersScreen;
