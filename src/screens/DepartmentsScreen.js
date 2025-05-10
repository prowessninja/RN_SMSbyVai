// DepartmentsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
// import { fetchDepartments } from '../api/departments'; // Uncomment when your API is ready

const DepartmentsScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const data = await fetchDepartments(token);

      // Mock data for testing:
      const data = [
        { id: 1, name: 'Human Resources' },
        { id: 2, name: 'Finance' },
        { id: 3, name: 'Engineering' },
      ];

      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('EditDepartment', { department: item })}>
        <Icon name="pencil" size={20} color="#2d3e83" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Icon name="arrow-left" size={24} color="#2d3e83" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Departments</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2d3e83" />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No departments available.</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDepartment')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3e83',
    marginLeft: 10,
  },
  listContainer: { paddingBottom: 80 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2d3e83',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default DepartmentsScreen;
