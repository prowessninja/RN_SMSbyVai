import React, { useState, useEffect, useContext } from 'react';  // Correct import for hooks
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import CommonAPI from '../api/common';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import LottieView from 'lottie-react-native';


const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');

  // academic years list
  const [academicYears, setAcademicYears] = useState([]);
  const [loadingYears, setLoadingYears] = useState(true);

  // edit-modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // overlay message
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('');

  // dummy user info
  const email = user?.email || 'user@example.com';  // fallback if user not loaded yet
  const maskedPassword = '********';

  useEffect(() => {
    (async () => {
      try {
        const res = await CommonAPI.fetchAcademicYears();
        setAcademicYears(res.data.results || []);
      } catch (err) {
        console.error('Failed to load academic years', err);
      } finally {
        setLoadingYears(false);
      }
    })();
  }, []);

  const handleBack = () => {
    navigation.navigate('Dashboard');
  };

  const handleChangeEmail = () => {
    console.log('Change Email pressed');
  };

  const handleResetPassword = () => setResetModalVisible(true);

  const submitReset = async () => {
    setShowOverlay(true);
    setOverlayText('Sending reset link…');
    try {
      await CommonAPI.sendForgotPasswordLink(resetEmail);
      setOverlayText('Link sent successfully!');
      setResetModalVisible(false);
    } catch (err) {
      console.error(err);
      setOverlayText(err.message || 'Failed to send link');
    } finally {
      setTimeout(() => setShowOverlay(false), 1500);
    }
  };

  const handleCreateYear = () => {
    setSelectedYear(null);
    setName('');
    setStartDate(new Date());
    setEndDate(new Date());
    setModalMode('create');
    setEditModalVisible(true);
  };

  const handleEditYear = (year) => {
    setSelectedYear(year);
    setName(year.name);
    setStartDate(new Date(year.start_date));
    setEndDate(new Date(year.end_date));
    setModalMode('edit');
    setEditModalVisible(true);
  };

  const handleSubmitEdit = () => {
    handleSubmitYear();
  };

  const handleSubmitYear = async () => {
    const payload = {
      id: selectedYear?.id, // undefined for create
      name,
      start_date: dayjs(startDate).format('YYYY-MM-DD'),
      end_date: dayjs(endDate).format('YYYY-MM-DD'),
    };

    try {
      // Show overlay with loading message
      setShowOverlay(true);
      setOverlayText(
        modalMode === 'create'
          ? 'Creating academic year…'
          : 'Updating academic year…'
      );

      await CommonAPI.saveAcademicYear(payload);

      const res = await CommonAPI.fetchAcademicYears();
      setAcademicYears(res.data.results || []);

      setEditModalVisible(false);
      // Update overlay text with success message
      setOverlayText(
        modalMode === 'create'
          ? 'Created successfully'
          : 'Updated successfully'
      );
    } catch (err) {
      setOverlayText('Failed to save academic year');
      console.error(err);
    } finally {
      setTimeout(() => setShowOverlay(false), 1000);
    }
  };

  const renderYearCard = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => handleEditYear(item)}
      >
        <Ionicons name="pencil" size={18} color="#2d3e83" />
      </TouchableOpacity>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardItem}>
        <Text style={styles.label}>Start Date: </Text>
        {item.start_date}
      </Text>
      <Text style={styles.cardItem}>
        <Text style={styles.label}>End Date: </Text>
        {item.end_date}
      </Text>

      <Text style={styles.cardItem}>
        <Text style={styles.label}>Email: </Text>
        {item.created_by?.email || '—'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.heading}>Settings</Text>
        </View>



        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Email Address:</Text>
              <Text style={styles.value}>{email}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleChangeEmail}
            >
              <Icon
                name="pencil-alt"
                size={16}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Password:</Text>
              <Text style={styles.value}>{maskedPassword}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={resetModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.resetModalContainer}>
              <Text style={styles.resetModalTitle}>Reset Password</Text>
              <LottieView
                source={require('../../assets/password-lock.json')}
                autoPlay
                loop={false}
                style={styles.resetGraphic}
              />
              <Text style={styles.inputLabel}>Enter your email</Text>
              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setResetModalVisible(false)}
                  style={[styles.cancelButton, { backgroundColor: '#bbb' }]}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitReset} style={styles.submitButton}>
                  <Text style={styles.buttonText}>Send Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Academic Year Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {modalMode === 'create' ? 'Create Academic Year' : 'Edit Academic Year'}
              </Text>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Academic Year Name"
              />

              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.dateInput}
              >
                <Text>{dayjs(startDate).format('YYYY-MM-DD')}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, selected) => {
                    setShowStartPicker(false);
                    if (selected) setStartDate(selected);
                  }}
                />
              )}

              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.dateInput}
              >
                <Text>{dayjs(endDate).format('YYYY-MM-DD')}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, selected) => {
                    setShowEndPicker(false);
                    if (selected) setEndDate(selected);
                  }}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitEdit}
                  style={styles.submitButton}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Academic Years Cards */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.academicYearsHeader}>
            <Text style={styles.sectionTitle}>Academic Years</Text>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateYear}>
              <Ionicons name="add-circle-outline" size={20} color="#2d3e83" />
              <Text style={styles.createText}>Academic Year</Text>
            </TouchableOpacity>
          </View>
          {loadingYears ? (
            <ActivityIndicator
              size="small"
              color="#2d3e83"
              style={{ marginTop: 16 }}
            />
          ) : (
            <FlatList
              data={academicYears}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderYearCard}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Overlay Message */}
      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="small" color="#fff" animating={overlayText.includes('…')} />
            <Text style={styles.overlayText}>{overlayText}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff'
  },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#2d3e83' },

  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#2d3e83' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  label: { fontSize: 14, fontWeight: '600', color: '#555' },
  value: { fontSize: 14, color: '#222', marginTop: 2 },

  button: {
    backgroundColor: '#2d3e83',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    position: 'relative',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#2d3e83' },
  cardItem: { fontSize: 14, marginBottom: 4, color: '#333' },
  editIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },

  academicYearsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3e83',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2d3e83',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#888',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2d3e83',
  },

  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#2d3e83',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  resetModalContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', alignItems: 'center' },
  resetModalTitle: { fontSize: 20, fontWeight: '700', color: '#2d3e83', marginBottom: 10 },
  resetGraphic: { height: 100, width: 100, marginBottom: 15 },
  inputLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 12 },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  submitButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, backgroundColor: '#2d3e83' },
});

export default SettingsScreen;