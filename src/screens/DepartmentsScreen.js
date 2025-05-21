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
  ScrollView,
  TextInput,
  Alert,
  Vibration,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Eyecon from 'react-native-vector-icons/FontAwesome';
import CommonAPI from '../api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { addDepartment } from '../api/common';
import { assignTeachersToDepartment } from '../api/common';
import { markDepartmentInactive } from '../api/common';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const RANDOM_BG_COLORS = ['#f9c2ff', '#d0f0c0', '#cce5ff', '#ffecb3'];

const DepartmentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [showProfileCard, setShowProfileCard] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

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

      await fetchDepartmentsData(academicYearsData[0].id, branchesData[0].id);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsData = async (yearId, branchId) => {
  try {
    setLoading(true);
    const departmentsRes = await CommonAPI.getDepartmentsForBranchAndYear(branchId, yearId);
    setDepartmentsData(departmentsRes.results || []);
  } catch (error) {
    console.error('Error fetching departments data:', error);
  } finally {
    setLoading(false);
  }
};


  const handleAcademicYearChange = (yearId) => {
    setSelectedYear(yearId);
    setShowOverlay(true);
    setOverlayText('Academic Year changed successfully');
    fetchDepartmentsData(yearId, selectedBranch);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setShowOverlay(true);
    setOverlayText('Branch changed successfully');
    fetchDepartmentsData(selectedYear, branchId);
    setTimeout(() => setShowOverlay(false), 1000);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDepartmentsData(selectedYear, selectedBranch).finally(() => setRefreshing(false));
  }, [selectedYear, selectedBranch]);

  const handleCardPress = (department) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const isExpanded = expandedDepartments[department.id];
    if (isExpanded) {
      setExpandedDepartments(prev => ({ ...prev, [department.id]: false }));
      return;
    }

    setExpandedDepartments(prev => ({ ...prev, [department.id]: true }));
  };

  const submitCreateDepartment = async () => {
    if (!newDeptName.trim() || !newDeptDesc.trim()) {
      setOverlayText('Please fill in all required fields.');
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 2000);
      return;
    }
    const payload = {
      name: newDeptName.trim(),
      branch_id: selectedBranch,
      description: newDeptDesc.trim(),
    };

    try {
      setSubmitting(true);
      setOverlayText('Creating department...');
      setShowOverlay(true);

      await CommonAPI.addDepartment(payload);

      setOverlayText('Department created successfully!');
      fetchDepartmentsData(selectedYear, selectedBranch);
      setShowCreateModal(false);
      setNewDeptName('');
      setNewDeptDesc('');

      // Hide overlay after success message shown for 1.5 seconds
      setTimeout(() => setShowOverlay(false), 1500);
    } catch (error) {
      console.error('Error creating department:', error);
      setOverlayText('Failed to create department. Please try again.');
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDepartment = async (departmentId) => {
    try {
      console.log('>>>>Department ID:', departmentId);
      const data = await CommonAPI.fetchDepartmentDetails(departmentId);
      //console.log('Department Details Response:', data);
      navigation.navigate('DepartmentDet', { department_id: departmentId });
    } catch (error) {
      setOverlayText('Failed to fetch department details.');
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 2000);
    }
  };

  const handleAssignTeacher = async (department) => {
    try {
      setOverlayText('Loading teachers...');
      setShowOverlay(true);

      setSelectedDepartment(department);

      const teachers = await CommonAPI.getAllNonStudentUsers(selectedBranch, selectedYear);

      console.log('📋 Full Teachers JSON:', JSON.stringify(teachers, null, 2));
      console.log('✅ Total Teachers Fetched:', teachers?.length || 0);

      setAvailableTeachers(teachers || []);
      setAssignModalVisible(true);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      setOverlayText('Failed to load teachers');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };

  const handleAssignTeachersSubmit = async () => {
    if (!selectedDepartment || selectedTeachers.length === 0) {
      setOverlayText('Please select at least one teacher');
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 1500);
      return;
    }

    try {
      setOverlayText('Assigning teachers...');
      setShowOverlay(true);

      const payload = {
        teachers: selectedTeachers,
      };

      const response = await assignTeachersToDepartment(selectedDepartment.id, payload);

      console.log('✅ Teachers assigned successfully:', response);

      setOverlayText('Teachers assigned successfully!');
      setAssignModalVisible(false);
      setSelectedTeachers([]);
      // Optionally refresh departments if needed:
      fetchDepartmentsData(selectedYear, selectedBranch);
    } catch (error) {
      setOverlayText('Failed to assign teachers');
      console.error('❌ Error assigning teachers:', error);
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };

  const handleMarkInactive = async (departmentId) => {
    try {
      setOverlayText('Marking department inactive...');
      setShowOverlay(true);

      await markDepartmentInactive(departmentId);

      setOverlayText('Department marked as inactive.');
      fetchDepartmentsData(selectedYear, selectedBranch);
    } catch (error) {
      console.error('❌ Failed to mark department inactive:', error);
      setOverlayText('Failed to mark as inactive.');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };



  const renderDepartmentCard = (department) => {
    const isExpanded = expandedDepartments[department.id];
    const cardColor = RANDOM_BG_COLORS[department.id % RANDOM_BG_COLORS.length];
    const hodName = department.head_of_the_department
      ? `${department.head_of_the_department.first_name} ${department.head_of_the_department.last_name}`.trim()
      : 'N/A';

    return (
      <View key={department.id} style={[styles.cardContainer, { backgroundColor: cardColor }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{department.name}</Text>
          <TouchableOpacity onPress={() => handleCardPress(department)}>
            <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardMetaRow}>
          <Text>HOD: {hodName}</Text>
          <Text>Total Members: {department.staff_count}</Text>
          <Text>Status: {department.is_active ? 'Active' : 'Inactive'}</Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDepartment(department.id)}>
              <Eyecon name="eye" size={16} color="#fff" />

            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleAssignTeacher(department)}>
              <Icon name="person-add" size={16} color="#fff" />

            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Vibration.vibrate([0, 200, 100, 200, 100, 300]);// Vibrate before showing the alert
                Alert.alert(
                  'Confirm',
                  'Are you sure you want to mark this department as inactive?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                      onPress: () => {
                        handleMarkInactive(department.id);
                      },
                    },
                  ]
                );
              }}
            >
              <Icon name="block" size={16} color="#fff" />
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

      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Department</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Name of the Department <Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter department name"
                value={newDeptName}
                onChangeText={setNewDeptName}
              />

              <Text style={styles.inputLabel}>Description <Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                style={[styles.textInput, { height: 100 }]}
                placeholder="Enter description"
                value={newDeptDesc}
                onChangeText={setNewDeptDesc}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitCreateDepartment}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Teacher(s) to Assign</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {availableTeachers.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#666' }}>No teachers available</Text>
              ) : (
                availableTeachers.map((teacher) => {
                  const isSelected = selectedTeachers.includes(teacher.id);
                  return (
                    <TouchableOpacity
                      key={teacher.id}
                      onPress={() => {
                        setSelectedTeachers(prev =>
                          isSelected ? prev.filter(id => id !== teacher.id) : [...prev, teacher.id]
                        );
                      }}
                      style={[
                        styles.teacherCard,
                        { backgroundColor: isSelected ? '#d0e8ff' : '#f4f4f4' },
                      ]}
                    >
                      <Text style={styles.memberText}>
                        Name: {teacher.first_name || ''} {teacher.last_name || ''}
                      </Text>
                      <Text style={styles.memberText}>Employee ID: {teacher.employee_id || 'N/A'}</Text>
                      <Text style={styles.memberText}>City: {teacher.address?.city || 'N/A'}</Text>
                      <Text style={styles.memberText}>Phone: {teacher.phone || 'N/A'}</Text>
                      <Text style={styles.memberText}>Email: {teacher.email || 'N/A'}</Text>
                      <Text style={styles.memberText}>Department: {teacher.department?.name || 'N/A'}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setAssignModalVisible(false);
                  setSelectedTeachers([]);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleAssignTeachersSubmit()}
              >
                <Text style={styles.buttonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2d3e83" />
          <Text style={{ marginTop: 12, fontSize: 16, color: '#2d3e83' }}>Loading departments... hang tight!</Text>
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
              <Icon name="domain" size={24} color="#2d3e83" style={{ marginLeft: 10 }} />
              <Text style={styles.headerTitle}>Departments</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <Icon name="add-circle-outline" size={20} color="#2d3e83" />
              <Text style={styles.createText}>Department</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={departmentsData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => renderDepartmentCard(item)}
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
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: RANDOM_BG_COLORS[Math.floor(Math.random() * RANDOM_BG_COLORS.length)],
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  animation: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  roleText: {
    color: '#fff',
    marginTop: 3,
    fontSize: 13,
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3e83',
    marginBottom: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: { backgroundColor: '#2d3e83', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  actionText: { color: '#fff', marginLeft: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  expandIcon: {
    padding: 4,
  },
  cardMetaRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2d3e83',
  },
  iconToggle: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 999,
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 20,
  },
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
  expandRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  expandedActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2d3e83',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2d3e83',
  },
  inputLabel: {
    marginBottom: 6,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ccc',
    alignItems: 'center',
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2d3e83',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  teacherCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default DepartmentsScreen;