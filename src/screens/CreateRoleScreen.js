import React, { useEffect, useState } from 'react';
import { PageHeader } from '../api/common'; // ✅ import the new header
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import CheckBox from '@react-native-community/checkbox';
import PermissionsAPI from '../api/permissions';

const STAFF_TYPES = [
  { label: 'Teaching', value: 'Teaching' },
  { label: 'Non-Teaching', value: 'Non-Teaching' },
  { label: 'Both', value: 'Both' },
];

const CreateRoleScreen = ({ navigation }) => {
  const [roleName, setRoleName] = useState('');
  const [staffType, setStaffType] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const allPermissions = await PermissionsAPI.fetchAllPermissionsPaginated();
      setPermissions(allPermissions);

      const initialState = {};
      allPermissions.forEach((perm) => {
        const type = perm.type_name;
        if (!initialState[type]) {
          initialState[type] = { view: false, add: false, change: false, delete: false };
        }
      });
      setSelectedPermissions(initialState);
    } catch (err) {
      Alert.alert('Error', 'Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllByOp = (op) => {
    const updated = { ...selectedPermissions };
    const allSelected = Object.keys(updated).every((type) => updated[type][op]);
    Object.keys(updated).forEach((type) => {
      updated[type][op] = !allSelected;
    });
    setSelectedPermissions(updated);
  };

  const toggleSingle = (type, op) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [op]: !prev[type][op],
      },
    }));
  };

  const handleSubmit = async () => {
    const permissions_id = permissions
      .filter((perm) => {
        const type = perm.type_name;
        const op = perm.operation_name;
        return selectedPermissions[type]?.[op];
      })
      .map((perm) => perm.id);

    if (!roleName || !staffType || permissions_id.length === 0) {
      Alert.alert('Validation', 'Please complete all fields and select at least one permission.');
      return;
    }

    try {
      const payload = {
        name: roleName,
        staff_type: staffType,
        controlled_groups_id: [],
        permissions_id,
      };

      console.log('Payload:', JSON.stringify(payload, null, 2));
      await PermissionsAPI.createGroup(payload);

      Alert.alert('Success', 'Role created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to create role.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d3e83" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <PageHeader navigation={navigation} title="Create Role" iconName="group-add" />

        {/* Role Name & Staff Type */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Role Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter role name"
              placeholderTextColor="#999"
              value={roleName}
              onChangeText={setRoleName}
            />
          </View>
          <View style={{ width: '50%' }}>
            <Text style={styles.label}>Staff Type</Text>
            <Dropdown
              data={STAFF_TYPES}
              labelField="label"
              valueField="value"
              placeholder="Select"
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              value={staffType}
              onChange={(item) => setStaffType(item.value)}
            />
          </View>
        </View>

        {/* Permission Table */}
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { flex: 2, color: '#fff' }]}>Permission Type</Text>
          {['view', 'add', 'change', 'delete'].map((op) => (
            <TouchableOpacity key={op} onPress={() => toggleAllByOp(op)} style={styles.cell}>
              <Text style={styles.selectAll}>✓ {op.charAt(0).toUpperCase() + op.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {Object.keys(selectedPermissions).map((type, index) => (
          <View
            key={type}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' },
            ]}
          >
            <Text style={[styles.cell, { flex: 2 }]}>{type}</Text>
            {['view', 'add', 'change', 'delete'].map((op) => (
              <TouchableOpacity
                key={op}
                style={styles.cell}
                onPress={() => toggleSingle(type, op)}
              >
                <CheckBox
                  value={selectedPermissions[type][op]}
                  onValueChange={() => toggleSingle(type, op)}
                  tintColors={{ true: '#2d3e83', false: '#aaa' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2d3e83', marginLeft: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  label: { marginBottom: 4, fontWeight: '600', color: '#444' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderStyle: {
    color: '#999',
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#2d3e83',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2d3e83',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selectAll: { color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#2d3e83',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default CreateRoleScreen;
