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
  TextInput,
  ScrollView,
  Alert,

} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import CommonAPI from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
//import SectionedMultiSelect from 'react-native-sectioned-multi-select';
// const stationeryRes = await CommonAPI.fetchAllStationery(); // ✅ correct
import { MultiSelect } from 'react-native-element-dropdown';
import { updateStandard } from '../api/common';
import { markStandardInactive } from '../api/common';
import { Picker } from '@react-native-picker/picker';
import { addStudentsToSection } from '../api/common';
import CheckBox from '@react-native-community/checkbox';
import { submitStudentsToSection } from '../api/common';
import { changeStudentsSubmit } from '../api/common';
import { createStandard } from '../api/common';


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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [allStationery, setAllStationery] = useState([]);
  const [selectedStationery, setSelectedStationery] = useState([]);
  const [addSecModalVisible, setAddSecModalVisible] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [showAddStudentsModal, setShowAddStudentsModal] = React.useState(false);
  const [studentsList, setStudentsList] = React.useState([]);
  const [selectedClassRep, setSelectedClassRep] = React.useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = React.useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [showChangeStudentsModal, setShowChangeStudentsModal] = useState(false);
  const [changeStdList, setChangeStdList] = useState([]);
  const [changeSecList, setChangeSecList] = useState([]);
  const [changeStudentList, setChangeStudentList] = useState([]);
  const [changeSelectedStandard, setChangeSelectedStandard] = useState(null);
  const [changeSelectedSection, setChangeSelectedSection] = useState(null);
  const [changeSelectedAcademicYear, setChangeSelectedAcademicYear] = useState(null);
  const [changeSelectedStudents, setChangeSelectedStudents] = useState([]);
  const [changeStudentSearch, setChangeStudentSearch] = useState('');
  const [selectAllChangeStudents, setSelectAllChangeStudents] = useState(false);
  const [loadingChangeModal, setLoadingChangeModal] = useState(false);
  const [originalStandard, setOriginalStandard] = useState(null);
  const [originalSection, setOriginalSection] = useState(null);
  const [originalAcademicYear, setOriginalAcademicYear] = useState(null);
  const [createStandardModalVisible, setCreateStandardModalVisible] = useState(false);
  const [newStandardName, setNewStandardName] = useState('');
  const [newStandardStationery, setNewStandardStationery] = useState([]); // multiselect







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
      console.log('📦 fetchStandardsData triggered with:', { yearId, branchId });
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
    if (!selectedBranch) return;

    setShowOverlay(true);
    setOverlayText('Academic Year changed successfully');
    console.log('Academic Year changed successfully to:', yearId);
    // Call with current selectedBranch and new yearId
    fetchStandardsData(yearId, selectedBranch);

    setTimeout(() => setShowOverlay(false), 1000);
  };


  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    if (!selectedYear) return;

    setShowOverlay(true);
    setOverlayText('Branch changed successfully');
    console.log('Branch changed successfully to:', branchId);
    fetchStandardsData(selectedYear, branchId);

    setTimeout(() => setShowOverlay(false), 1000);
  };



  const handleEditStandard = async (standard) => {
    setSelectedStandard(standard);
    setEditModalVisible(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      // Safe API call
      const response = await CommonAPI.fetchAllStationery(token);
      const allItems = Array.isArray(response) ? response : [];
      console.log('✅ Stationery fetched:', allItems);
      // Optional: Filter if needed by branch/standard
      setAllStationery(allItems.map(item => ({
        id: item.id,
        name: item.name,
      })));

      // Preselect assigned stationery IDs (based on your `standard.stationary`)
      const assigned = standard.stationary?.map(item => item.id) || [];
      setSelectedStationery(assigned);
    } catch (err) {
      console.error('Error loading stationery for modal:', err);
    }
  };

  const openCreateStandardModal = async () => {
    setNewStandardName('');
    setNewStandardStationery([]);
    // Fetch all stationery if not yet loaded
    if (allStationery.length === 0) {
      try {
        const items = await CommonAPI.fetchAllStationery();
        setAllStationery(items);
      } catch (err) {
        console.error('Failed to load stationery for create:', err);
      }
    }
    setCreateStandardModalVisible(true);
  };

  const handleCreateStandard = async () => {
  if (!newStandardName.trim() || newStandardStationery.length === 0) {
    Alert.alert('Validation', 'Please enter a name and select at least one stationery item.');
    return;
  }

  try {
    setOverlayText('Creating standard…');
    setShowOverlay(true);

    await CommonAPI.createStandard({
      name: newStandardName.trim(),
      branch: selectedBranch,
      academic_year_id: selectedYear,
      stationary_ids: newStandardStationery,
    });

    setOverlayText('Standard created!');
    setCreateStandardModalVisible(false);
    setNewStandardName('');
    setNewStandardStationery([]);
    fetchStandardsData(selectedYear, selectedBranch);
  } catch (err) {
    console.error('Create standard failed:', err);
    setOverlayText('Failed to create standard.');
  } finally {
    setTimeout(() => setShowOverlay(false), 1500);
  }
};



  const handleSubmitEdit = async () => {
    if (!selectedStandard) return;

    try {
      setOverlayText('Updating standard...');
      setShowOverlay(true);

      const standardPayload = {
        id: selectedStandard.id,
        name: selectedStandard.name,
        branch: selectedBranch,
        is_active: selectedStandard.is_active,
        stationary_ids: selectedStationery,
        academic_year_id: selectedYear,
      };

      console.log('[handleSubmitEdit] Calling updateStandard with:', standardPayload);

      await updateStandard(standardPayload);

      setOverlayText('Standard updated successfully!');
      setEditModalVisible(false);

      fetchStandardsData(selectedYear, selectedBranch);

    } catch (error) {
      console.error('[handleSubmitEdit] Error:', error);
      setOverlayText('Failed to update standard.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };



  const handleMarkInactive = async (standard) => {
    if (!standard || !standard.id) return;

    try {
      setOverlayText('Marking standard inactive...');
      setShowOverlay(true);
      console.log('🔧 Marking standard inactive:', standard);

      const token = await AsyncStorage.getItem('userToken');
      await markStandardInactive(standard.id, token);

      console.log('✅ Marked inactive successfully:', standard.name);
      setOverlayText('Standard marked inactive successfully!');

      // Refresh data
      await fetchStandardsData(selectedYear, selectedBranch);
    } catch (error) {
      console.error('❌ Failed to mark standard inactive:', error);
      setOverlayText('Failed to mark standard inactive.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };

  const handleToggleSectionActive = async (section) => {
    if (!section?.id) return;

    try {
      setOverlayText(
        section.is_active
          ? 'Marking section inactive…'
          : 'Activating section…'
      );
      setShowOverlay(true);

      await CommonAPI.toggleSectionActive(section.id, section.is_active);

      setOverlayText(
        section.is_active
          ? 'Section marked inactive!'
          : 'Section activated!'
      );

      // Refresh only this standard’s sections
      await fetchStandardsData(selectedYear, selectedBranch);

    } catch (err) {
      console.error('❌ Failed to toggle section:', err);
      setOverlayText('Failed to change section status.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };




  const handleAddSection = async (standard) => {
    setSelectedStandard(standard);
    setAddSecModalVisible(true);
    setNewSectionName('');
    setSelectedTeacherId(null);

    try {
      const teachers = await CommonAPI.fetchTeachingStaffByBranch(selectedBranch);
      setAvailableTeachers(teachers);
    } catch (error) {
      console.error('Error loading teachers for section modal:', error);
    }
  };

  const handleSubmitAddSection = async () => {
    if (!newSectionName || !selectedTeacherId || !selectedStandard?.id) {
      alert('Please fill all fields');
      return;
    }

    try {
      setOverlayText('Creating new section...');
      setShowOverlay(true);

      await CommonAPI.addSection({
        name: newSectionName,
        standard_id: selectedStandard.id,
        head_teacher_id: selectedTeacherId,
      });

      setOverlayText('Section added successfully!');
      setAddSecModalVisible(false);
      fetchStandardsData(selectedYear, selectedBranch); // Refresh standards/sections
    } catch (error) {
      console.error('Error creating section:', error);
      setOverlayText('Failed to add section.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };

  const handleAddStudents = async (branchId, standardId, sectionId) => {
    try {
      const students = await addStudentsToSection(branchId, standardId);
      setStudentsList(students);
      setSelectedClassRep(null);
      setSelectedStandard({ id: standardId }); // Set full object if needed
      setSelectedSectionId(sectionId); // 🔹 store section ID
      setShowAddStudentsModal(true);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const submitAddStudents = async () => {
    try {
      if (!selectedAcademicYear || !selectedClassRep || selectedStudents.length === 0) {
        Alert.alert('Validation', 'Please fill all fields and select at least one student.');
        return;
      }

      const response = await submitStudentsToSection({
        sectionId: selectedSectionId,
        standardId: selectedStandard?.id,
        students: selectedStudents,
        academicYear: selectedAcademicYear,
        classRepresentative: selectedClassRep,
      });

      console.log('[Add Students Success]', response);

      Alert.alert('Success', 'Students added successfully.');
      setShowAddStudentsModal(false);
    } catch (error) {
      console.error('[Add Students Error]', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to add students.');
    }
  };

  const openChangeStudentsModal = async (standardId, sectionId) => {
    if (!selectedBranch || !selectedYear) {
      alert('Please select branch and academic year first.');
      return;
    }

    setLoadingChangeModal(true);
    setShowChangeStudentsModal(true);

    // Set original values for comparison or conditional use later
    setOriginalStandard(standardId);
    setOriginalSection(sectionId);
    setOriginalAcademicYear(selectedYear);

    try {
      const { standards, sections, students } = await CommonAPI.fetchChangeStudentsModalData({
        branchId: selectedBranch,
        academicYearId: selectedYear,
        standardId,
        sectionId,
        studentSearch: '',
      });

      setChangeStdList(standards.map(s => ({ label: s.name, value: s.id })));
      setChangeSelectedStandard(standardId);

      setChangeSecList(sections.map(s => ({ label: s.name, value: s.id })));
      setChangeSelectedSection(sectionId);

      setChangeSelectedAcademicYear(selectedYear);

      setChangeStudentList(students);
      setChangeSelectedStudents([]);
      setSelectAllChangeStudents(false);
      setChangeStudentSearch('');
    } catch (error) {
      console.error('Error loading Change Students modal data:', error);
    } finally {
      setLoadingChangeModal(false);
    }
  };


  const handleChangeStudents = async () => {
    if (
      !changeSelectedStandard || !changeSelectedSection || !changeSelectedAcademicYear ||
      changeSelectedStudents.length === 0
    ) {
      alert('Please select all fields and at least one student');
      return;
    }

    const payload = {
      current_standard: originalStandard,
      current_section: originalSection,
      current_academic_year: originalAcademicYear,
      new_standard: changeSelectedStandard,
      new_section: changeSelectedSection,
      new_academic_year: changeSelectedAcademicYear,
      student_ids: changeSelectedStudents,
    };

    try {
      setLoadingChangeModal(true);
      await changeStudentsSubmit(payload);
      alert('Students updated successfully!');
      setShowChangeStudentsModal(false);
      // refresh list if needed
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingChangeModal(false);
    }
  };




  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAllChangeStudents = (value) => {
    setSelectAllChangeStudents(value);
    if (value) {
      setChangeSelectedStudents(changeStudentList.map(s => s.id));
    } else {
      setChangeSelectedStudents([]);
    }
  };

  const toggleChangeStudentSelection = (studentId) => {
    setChangeSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };


  console.log('Fetching standards for:', { selectedYear, selectedBranch });


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

  const renderSectionCard = (section, standardId) => (
    <View key={section.id} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{section.name}</Text>
      <Text>Total Students: {section.student_count}</Text>
      <Text>Status: {section.is_active ? 'Active' : 'Inactive'}</Text>
      <View style={styles.sectionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('ClassAndSecDet', {
              branch_id: selectedBranch,
              section_id: section.id,
              standard_id: standardId, // 🔹 Add this
            })
          }
        >
          <Text>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAddStudents(selectedBranch, standardId, section.id)}
          style={styles.actionBtn}
        >
          <Text>Add Students</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openChangeStudentsModal(standardId, section.id)} style={styles.actionBtn}><Text>Change Students</Text></TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleToggleSectionActive(section)}
        >
          <Text>
            {section.is_active ? 'Mark Inactive' : 'Activate'}
          </Text>
        </TouchableOpacity>
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
              <TouchableOpacity style={styles.stdActionBtn} onPress={() => handleEditStandard(standard)}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stdActionBtn} onPress={() => handleAddSection(standard)}>
                <Text>Add Sec.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stdActionBtn}
                onPress={() => handleMarkInactive(standard)}
              >
                <Text>Mark Inactive</Text>
              </TouchableOpacity>

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
              sections.map(section => renderSectionCard(section, standard.id))
            )}
          </View>
        )}
      </View>

    );
  };


  return (
    <View style={{ flex: 1 }}>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#f0f0ff', padding: 20, borderRadius: 12, width: '90%' }}>

            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Branch</Text>
            <Text style={{ backgroundColor: 'white', padding: 10, borderRadius: 8 }}>{branches.find(b => b.value === selectedBranch)?.label}</Text>

            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Standard Name</Text>
            <Text style={{ backgroundColor: 'white', padding: 10, borderRadius: 8 }}>{selectedStandard?.name}</Text>

            <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Stationary</Text>
            <MultiSelect
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 12,
                marginTop: 10,
                height: 50,
              }}
              placeholderStyle={{ color: '#999' }}
              selectedTextStyle={{ color: '#2d3e83' }}
              data={allStationery.map(item => ({ label: item.name, value: item.id }))}
              labelField="label"
              valueField="value"
              placeholder="Select Stationery"
              search
              value={selectedStationery}
              onChange={item => {
                setSelectedStationery(item);
              }}
              maxSelect={10}
            />



            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ backgroundColor: '#2d3e83', padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitEdit} style={{ backgroundColor: '#2d3e83', padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Submit</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

      <Modal
        visible={createStandardModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateStandardModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Standard</Text>

            <TextInput
              placeholder="Enter standard name"
              value={newStandardName}
              onChangeText={setNewStandardName}
              style={styles.input}
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>Stationery</Text>
            <MultiSelect
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 12,
                marginTop: 8,
                height: 50,
              }}
              placeholderStyle={{ color: '#999' }}
              selectedTextStyle={{ color: '#2d3e83' }}
              data={allStationery.map(i => ({ label: i.name, value: i.id }))}
              labelField="label"
              valueField="value"
              placeholder="Select Stationery"
              search
              value={newStandardStationery}
              onChange={setNewStandardStationery}
              maxSelect={10}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setCreateStandardModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateStandard}
                style={styles.submitButton}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={addSecModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddSecModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#f0f0ff', padding: 20, borderRadius: 12, width: '90%' }}>

            <Text style={{ fontWeight: 'bold' }}>Add Section to: {selectedStandard?.name}</Text>

            <Text style={{ marginTop: 10 }}>Section Name</Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 8,
                marginTop: 4,
              }}
              placeholder="Enter Section Name"
              value={newSectionName}
              onChangeText={setNewSectionName}
            />

            <Text style={{ marginTop: 10 }}>Assign Teacher</Text>
            <Dropdown
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 50,
                marginTop: 4,
              }}
              data={availableTeachers}
              labelField="label"
              valueField="value"
              placeholder="Select Teacher"
              value={selectedTeacherId}
              onChange={item => setSelectedTeacherId(item.value)}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setAddSecModalVisible(false)} style={{ backgroundColor: '#2d3e83', padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitAddSection} style={{ backgroundColor: '#2d3e83', padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Submit</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

      <Modal visible={showAddStudentsModal} animationType="fade" transparent={true}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            width: '90%',
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            maxHeight: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <ScrollView>

              {/* Class Rep Dropdown */}
              <Text style={{ marginBottom: 6, fontWeight: '600' }}>Class Rep</Text>
              <View style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                marginBottom: 12,
                overflow: 'hidden',
              }}>
                <Picker
                  selectedValue={selectedClassRep}
                  onValueChange={value => setSelectedClassRep(value)}
                  style={{ height: 40 }}
                >
                  <Picker.Item label="Select Class Rep" value={null} />
                  {studentsList.map(student => (
                    <Picker.Item
                      key={student.id}
                      label={`${student.first_name} ${student.last_name}`}
                      value={student.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* Academic Year Dropdown */}
              <Text style={{ marginBottom: 6, fontWeight: '600' }}>Academic Year</Text>
              <View style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                marginBottom: 20,
                overflow: 'hidden',
              }}>
                <Picker
                  selectedValue={selectedAcademicYear}
                  onValueChange={value => setSelectedAcademicYear(value)}
                  style={{ height: 40 }}
                >
                  <Picker.Item label="Select Academic Year" value={null} />
                  {academicYears.map(year => (
                    <Picker.Item key={year.value} label={year.label} value={year.value} />
                  ))}
                </Picker>
              </View>

              {/* Students Card List */}
              <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 16 }}>Students</Text>
              {studentsList.length > 0 ? (
                studentsList.map(student => (
                  <View
                    key={student.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      padding: 12,
                      marginVertical: 6,
                      marginHorizontal: 4,
                      borderRadius: 8,
                      backgroundColor: '#f9f9f9',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 4,
                    }}
                  >
                    <CheckBox
                      value={selectedStudents.includes(student.id)}
                      onValueChange={() => toggleStudentSelection(student.id)}
                      style={{ marginTop: 5, marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text><Text style={{ fontWeight: 'bold' }}>Roll No:</Text> {student.roll_number || '-'}</Text>
                      <Text><Text style={{ fontWeight: 'bold' }}>Name:</Text> {student.first_name} {student.last_name}</Text>
                      <Text><Text style={{ fontWeight: 'bold' }}>Mobile:</Text> {student.mobile || '-'}</Text>
                      <Text><Text style={{ fontWeight: 'bold' }}>Email:</Text> {student.email || '-'}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ marginTop: 10, color: '#666' }}>No students available.</Text>
              )}

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}>
                <TouchableOpacity
                  onPress={() => setShowAddStudentsModal(false)}
                  style={{
                    backgroundColor: '#2d3e83',
                    padding: 12,
                    borderRadius: 8,
                    flex: 1,
                    marginRight: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitAddStudents}
                  style={{
                    backgroundColor: '#2d3e83',
                    padding: 12,
                    borderRadius: 8,
                    flex: 1,
                    marginLeft: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Submit</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showChangeStudentsModal} animationType="fade" onRequestClose={() => setShowChangeStudentsModal(false)}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            width: '90%',
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            maxHeight: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <Text style={styles.modalTitle}>Change Students</Text>

            {loadingChangeModal ? (
              <ActivityIndicator size="large" color="#2d3e83" />
            ) : (
              <>
                {/* Dropdowns */}
                <Dropdown
                  style={styles.dropdown}
                  data={changeStdList}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Standard"
                  value={changeSelectedStandard}
                  onChange={item => setChangeSelectedStandard(item.value)}
                />

                <Dropdown
                  style={styles.dropdown}
                  data={changeSecList}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Section"
                  value={changeSelectedSection}
                  onChange={item => setChangeSelectedSection(item.value)}
                />

                <Dropdown
                  style={styles.dropdown}
                  data={academicYears}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Academic Year"
                  value={changeSelectedAcademicYear}
                  onChange={item => setChangeSelectedAcademicYear(item.value)}
                />

                {/* Select All + Search */}
                <View style={styles.selectSearchRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckBox
                      value={selectAllChangeStudents}
                      onValueChange={toggleSelectAllChangeStudents}
                    />
                    <Text style={{ marginLeft: 8 }}>Select All</Text>
                  </View>

                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name"
                    value={changeStudentSearch}
                    onChangeText={setChangeStudentSearch}
                  />
                </View>

                {/* Students list */}
                <ScrollView style={{ maxHeight: 300 }}>
                  {changeStudentList.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>No students found.</Text>
                  ) : (
                    changeStudentList.map(student => {
                      const isSelected = changeSelectedStudents.includes(student.id);
                      return (
                        <TouchableOpacity
                          key={student.id}
                          style={[styles.studentCard, isSelected && styles.studentCardSelected]}
                          onPress={() => toggleChangeStudentSelection(student.id)}
                        >
                          <CheckBox
                            value={isSelected}
                            onValueChange={() => toggleChangeStudentSelection(student.id)}
                          />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>{student.admission_number}</Text>
                            <Text>{student.first_name} {student.last_name}</Text>
                            <Text>{student.phone}</Text>
                            <Text>{student.email}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {/* Action buttons */}
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                    onPress={() => setShowChangeStudentsModal(false)}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#2d3e83' }]}
                    onPress={handleChangeStudents}
                  >
                    <Text style={{ color: 'white' }}>Change Students</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>


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
              </View>)}
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#2d3e83" />
              </TouchableOpacity>
              <Icon name="school" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
              <Text style={styles.headerTitle}>Standards</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={openCreateStandardModal}>
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
  addButton: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    alignItems: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  selectSearchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 40,
    flex: 1,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  studentCardSelected: {
    backgroundColor: '#d0e7ff',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    alignSelf: 'flex-end',
    margin: 10,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },


});

export default StandardsScreen;
