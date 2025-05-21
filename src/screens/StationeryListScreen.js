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
  TextInput,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import CommonAPI from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import MultiSelect from 'react-native-multiple-select';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import UnifiedStationeryModal from '../components/UnifiedStationeryModal';


if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANDOM_BG_COLORS = ['#ffe0b2', '#dcedc8', '#b3e5fc', '#f8bbd0'];

const StationeryListScreen = () => {
  // Core state
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

  const [modalVisible, setModalVisible] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [formData, setFormData] = useState({
  id: null,
  name: '',
  selectedType: null,
  selectedInventory: null,
  price: '',
  quantity: '',
  description: '',
  isActive: true,
});


  // Add‑item modal
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [allStationery, setAllStationery] = useState([]);
  const [selectedStationery, setSelectedStationery] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit‑item modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stationaryTypes, setStationaryTypes] = useState([]);
  const [inventoryTracking, setInventoryTracking] = useState([]);
  const [editItemData, setEditItemData] = useState({
    id: null,
    name: '',
    selectedType: null,
    selectedInventory: null,
    price: '',
    quantity: '',
    description: '',
    isActive: false,
  });

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

      setBranches(branchesData.map(b => ({ label: b.name, value: b.id })));
      setAcademicYears(academicYearsData.map(y => ({ label: y.name, value: y.id })));

      const u = userRes.data;
      setCurrentUserName(u.first_name || 'User');
      setCurrentUserRole(u.group?.name || 'Role');
      setProfileImage(u.profile_image);

      if (branchesData.length) setSelectedBranch(branchesData[0].id);
      if (academicYearsData.length) setSelectedYear(academicYearsData[0].id);

      await fetchStationeryData(academicYearsData[0].id, branchesData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationeryData = async (yearId, branchId) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const resp = await CommonAPI.fetchStandardsForYearBranch(yearId, branchId, token);
    const parsed = resp.results.map(std => ({
      id: std.id,
      name: std.name,
      stationary: std.stationary,
      items: std.stationary.map((s, i) => ({
        id: `${std.id}-${i}`,
        name: s.name,
        quantity: s.quantity,
        price: s.price,
        type: s.stationary_type?.name || '—',
        original: s,
      })),
    }));
    setStationeryData(parsed);
    setExpandedItems({});
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleAcademicYearChange = y => {
    setSelectedYear(y);
    if (!selectedBranch) return;
    setShowOverlay(true);
    setOverlayText('Academic Year changed successfully');
    fetchStationeryData(y, selectedBranch);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const handleBranchChange = b => {
    setSelectedBranch(b);
    if (!selectedYear) return;
    setShowOverlay(true);
    setOverlayText('Branch changed successfully');
    fetchStationeryData(selectedYear, b);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const handleAddItem = async standard => {
    setSelectedStandard(standard);
    setAddItemModalVisible(true);
    try {
      const all = await CommonAPI.fetchAllStationery();
      setAllStationery(all);
      setSelectedStationery(standard.stationary.map(s => s.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStationery = async () => {
    if (!selectedStandard) return;
    const payload = {
      id: selectedStandard.id,
      name: selectedStandard.name,
      is_active: selectedStandard.is_active,
      stationary_ids: selectedStationery,
      academic_year_id: selectedYear,
      branch: selectedBranch,
    };
    try {
      await CommonAPI.updateStandard(payload);
      setAddItemModalVisible(false);
      setOverlayText('Item updated successfully');
      setShowOverlay(true);
      fetchStationeryData(selectedYear, selectedBranch);
      setTimeout(() => setShowOverlay(false), 1000);
    } catch (err) {
      console.error(err);
    }
  };

  // 1️⃣ When opening the Edit modal, seed your form with the real inventory_tracking id:
// ✅ FIXED handleEditStationery with correct modal + formData usage
const handleEditStationery = async (row) => {
  const s = row.original; // this is your stationery item object

  try {
    const { stationaryTypes, inventoryTracking } =
      await CommonAPI.fetchStationaryTypesAndInventory(selectedBranch);
    setStationaryTypes(stationaryTypes);
    setInventoryTracking(inventoryTracking);

    setFormData({
      id: s.id,
      name: s.name,
      selectedType: s.stationary_type?.id || null,
      selectedInventory: s.inventory_tracking?.id || null,
      price: String(s.price),
      quantity: String(s.quantity),
      description: s.description || '',
      isActive: s.is_active,
    });

    setIsEditMode(true);
    setModalVisible(true);
  } catch (err) {
    console.error(err);
    setOverlayText('Could not load edit form');
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 1000);
  }
};

const handleSubmitStationery = async () => {
  const isEditing = isEditMode && formData.id;
  const payload = {
    name: formData.name,
    description: formData.description,
    quantity: Number(formData.quantity),
    stationary_type_id: formData.selectedType,
    inventory_tracking_id: formData.selectedInventory,
    price: Number(formData.price),
    is_active: formData.isActive,
    branch_id: selectedBranch,
  };

  try {
    setModalLoading(true);
    setModalLoading(true);
    if (isEditing) {
      await CommonAPI.updateStationery(formData.id, payload);
    } else {
      await CommonAPI.createStationery(payload);
    }
    setModalLoading(false);
    setModalVisible(false);
    await fetchStationeryData(selectedYear, selectedBranch);
  } catch (err) {
    console.error(err);
    setOverlayText('Something went wrong');
    setShowOverlay(true);
  } finally {
    setModalLoading(false);
    setTimeout(() => setShowOverlay(false), 1200);
  }
};
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStationeryData(selectedYear, selectedBranch).finally(() => setRefreshing(false));
  }, [selectedYear, selectedBranch]);

  const handleItemPress = id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2d3e83" />
      <Text style={{ marginTop: 12, fontSize: 16, color: '#2d3e83' }}>
        Loading stationery... Please hold tight!
      </Text>
    </View>
  );
}

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Modal visible={showOverlay} transparent animationType="fade">
        <View style={styles.overlayContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>{overlayText}</Text>
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={addItemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>

            <Text style={styles.label}>Branch</Text>
            <Text style={styles.readOnly}>
              {branches.find(b => b.value === selectedBranch)?.label}
            </Text>

            <Text style={styles.label}>Standard Name</Text>
            <Text style={styles.readOnly}>{selectedStandard?.name}</Text>

            <Text style={styles.label}>Stationery</Text>
            <MultiSelect
              items={allStationery}
              uniqueKey="id"
              onSelectedItemsChange={setSelectedStationery}
              selectedItems={selectedStationery}
              selectText="Select Stationery"
              searchInputPlaceholderText="Search..."
              displayKey="name"
              submitButtonColor="#2d3e83"
              submitButtonText="Done"
              styleMainWrapper={styles.multiSelect}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddItemModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUpdateStationery}
              >
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Stationery</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={editItemData.name}
              onChangeText={name => setEditItemData(d => ({ ...d, name }))}
            />

            <Text style={styles.label}>Stationery Type</Text>
            <Dropdown
              style={styles.dropdown}
              data={stationaryTypes}
              labelField="label"
              valueField="value"
              placeholder="Select Type"
              value={editItemData.selectedType}
              onChange={item => setEditItemData(d => ({ ...d, selectedType: item.value }))}
            />

            <Text style={styles.label}>Inventory</Text>
            <Dropdown
              style={styles.dropdown}
              data={inventoryTracking}
              labelField="label"
              valueField="value"
              placeholder="Select Inventory"
              value={editItemData.selectedInventory}
              onChange={item => setEditItemData(d => ({ ...d, selectedInventory: item.value }))}
            />

            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              keyboardType="numeric"
              value={editItemData.price}
              onChangeText={price => setEditItemData(d => ({ ...d, price }))}
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={editItemData.quantity}
              onChangeText={quantity => setEditItemData(d => ({ ...d, quantity }))}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              value={editItemData.description}
              onChangeText={description => setEditItemData(d => ({ ...d, description }))}
            />

            <View style={styles.checkboxRow}>
              <CheckBox
                value={editItemData.isActive}
                onValueChange={val => setEditItemData(d => ({ ...d, isActive: val }))}
              />
              <Text style={styles.label}>Active</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitStationery}
                
              >
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <UnifiedStationeryModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onSubmit={handleSubmitStationery}
  isEdit={isEditMode}
  formData={formData}
  setFormData={setFormData}
  stationaryTypes={stationaryTypes}
  inventoryTracking={inventoryTracking}
  loading={modalLoading} // 🆕 pass loader to modal
/>


      {/* Profile & Filters */}
      <TouchableOpacity
        onPress={() => setShowProfileCard(v => !v)}
        style={styles.iconToggle}
      >
        <Eyecon
          name={showProfileCard ? 'eye-slash' : 'eye'}
          size={15}
          color="#fff"
        />
      </TouchableOpacity>
      <View style={{ padding: 8, marginBottom: 1 }}></View>
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
      

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#2d3e83" />
          </TouchableOpacity>
          <Icon name="inventory" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
          <Text style={styles.headerTitle}>Stationery</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={async () => {
  const { stationaryTypes, inventoryTracking } = await CommonAPI.fetchStationaryTypesAndInventory(selectedBranch);
  setStationaryTypes(stationaryTypes);
  setInventoryTracking(inventoryTracking);
  setFormData({
    id: null,
    name: '',
    selectedType: null,
    selectedInventory: null,
    price: '',
    quantity: '',
    description: '',
    isActive: true,
  });
  setIsEditMode(false);
  setModalVisible(true);
}}
>
                      <Icon name="add-circle-outline" size={20} color="#2d3e83" />
                      <Text style={styles.createText}>Stationery</Text>
                    </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={stationeryData}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2d3e83']} />}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const expanded = expandedItems[item.id];
          return (
            <View style={[styles.classCard, { backgroundColor: RANDOM_BG_COLORS[item.id % RANDOM_BG_COLORS.length] }]}>
              <TouchableOpacity style={styles.classHeader} onPress={() => handleItemPress(item.id)}>
                <Text style={styles.classTitle}>{item.name}</Text>
                <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#2d3e83" />
              </TouchableOpacity>
              {expanded && (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.cell, styles.headerCell]}>Title</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Quantity</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Amount</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => handleAddItem(item)}>
                      <Text style={styles.addButtonText}>Add item</Text>
                    </TouchableOpacity>
                  </View>
                  {item.items.map(row => (
                    <View key={row.id} style={styles.tableRow}>
                      <Text style={styles.cell}>{row.name} ({row.type})</Text>
                      <Text style={styles.cell}>{row.quantity}</Text>
                      <Text style={styles.cell}>{row.price}</Text>
                      <TouchableOpacity style={styles.editIconWrapper} onPress={() => handleEditStationery(row)}>
                        <Icon name="edit" size={18} color="#2d3e83" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />
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
  // ---- newly added styles for the modal:
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f0f0ff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  readOnly: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  multiSelect: {
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  submitBtn: {
    backgroundColor: '#2d3e83',
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default StationeryListScreen;
