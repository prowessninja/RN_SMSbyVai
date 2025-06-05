import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { updateEvent } from '../api/eventsApi';
import { createEvent } from '../api/eventsApi';
import {
  fetchStandardsForYearBranch,
  getDepartmentsForBranchAndYear,
  fetchSectionsByBranchAndStandard,
} from '../api/common';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';

const EditEventScreen = ({ route }) => {
  const navigation = useNavigation();
  const { event } = route.params;
  const {
    user,
    branches,
    selectedAcademicYear,
    selectedBranch,
  } = useContext(AuthContext);

  const defaultBranchId = selectedBranch?.id || branches?.[0]?.id || null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [appliesToType, setAppliesToType] = useState('Branches');
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [selectedSecondary, setSelectedSecondary] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name || '');
      setDescription(event.description || '');
      setStartDate(new Date(event.start_date));
      setEndDate(new Date(event.end_date));
      setImagePreview(event.image || '');
      setImage(null);
      setAppliesToType(event.applies_to || 'Branches');

      let selectedIds = [];

      if (event.applies_to === 'Branches') {
        selectedIds = event.branches?.map(b => b.id) || [];
      } else if (event.applies_to === 'Departments') {
        selectedIds = event.departments?.map(d => d.id) || [];
      } else if (event.applies_to === 'Standards') {
        selectedIds = event.standards?.map(s => s.id) || [];
      } else if (event.applies_to === 'Sections') {
        selectedIds = event.sections?.map(s => s.id) || [];
      }

      setSelectedSecondary(selectedIds);
    } else {
      setName('');
      setDescription('');
      setStartDate(new Date());
      setEndDate(new Date());
      setImage(null);
      setImagePreview(null);
      setAppliesToType('Branches');
      setSelectedSecondary([]);
    }
  }, [event]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!defaultBranchId) return;

        if (appliesToType === 'Branches') {
          setSecondaryOptions(branches || []);
        } else if (appliesToType === 'Departments') {
          const res = await getDepartmentsForBranchAndYear(defaultBranchId, selectedAcademicYear?.id);
          setSecondaryOptions(res.results || []);
        } else if (appliesToType === 'Standards') {
          const token = await AsyncStorage.getItem('userToken');
          const res = await fetchStandardsForYearBranch(selectedAcademicYear?.id, defaultBranchId, token);
          setSecondaryOptions(res.results || []);
        } else if (appliesToType === 'Sections') {
          const token = await AsyncStorage.getItem('userToken');
          const res = await fetchSectionsByBranchAndStandard(defaultBranchId, null, token);
          const formatted = (res.results || []).map(section => ({
            id: section.id,
            label: `${section.standard?.name || 'Unknown'} - ${section.name}`,
          }));
          setSecondaryOptions(formatted);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${appliesToType}:`, err);
        setSecondaryOptions([]);
      }
    };

    fetchData();
  }, [appliesToType, selectedAcademicYear, defaultBranchId]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      includeBase64: true, // ✅ Required to get base64 string
    });

    if (!result.didCancel && result.assets?.length) {
      setImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Title cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      const formattedStart = dayjs(startDate).format('YYYY-MM-DD HH:mm');
      const formattedEnd = dayjs(endDate).format('YYYY-MM-DD HH:mm');

      let branches_id = [], departments_id = [], standards_id = [], sections_id = [];
      const ids = selectedSecondary;
      if (appliesToType === 'Branches') branches_id = ids;
      if (appliesToType === 'Departments') departments_id = ids;
      if (appliesToType === 'Standards') standards_id = ids;
      if (appliesToType === 'Sections') sections_id = ids;

      let imageData = null;
      if (image?.base64) {
        imageData = `data:${image.type};base64,${image.base64}`;
      }

      const payload = {
        id: event?.id,
        name: name.trim(),
        description: description.trim(),
        start_date: formattedStart,
        end_date: formattedEnd,
        applies_to: appliesToType,
        branch_id: defaultBranchId,
        ...(event ? {} : { academic_year_id: selectedAcademicYear?.id }), // ✅ Only in add mode
        branches_id,
        departments_id,
        standards_id,
        sections_id,
        ...(imageData && { image: imageData }),
      };


      if (event?.id) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }

      Alert.alert('Success', 'Event saved successfully.');
      navigation.navigate('EventsScreen', { refresh: true });

    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Could not save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMultiSelect = (label, data, selected, setSelected, labelField = 'name') => (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <MultiSelect
        style={styles.dropdown}
        placeholder={`Select ${label}`}
        selectedTextStyle={{ color: '#000' }}
        data={data}
        labelField={labelField}
        valueField="id"
        keyField="id"
        value={selected}
        onChange={setSelected}
        selectedStyle={styles.selectedStyle}
        maxSelect={100}
      />

    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ProfileSection
          user={user}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
        />

        <Text style={styles.title}>{event?.id ? 'Edit Event' : 'Add Event'}</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Start Date & Time</Text>
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateInput}>{dayjs(startDate).format('YYYY-MM-DD HH:mm')}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="datetime"
          date={startDate}
          onConfirm={(date) => {
            setStartDate(date);
            setShowStartPicker(false);
          }}
          onCancel={() => setShowStartPicker(false)}
        />

        <Text style={styles.label}>End Date & Time</Text>
        <TouchableOpacity onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateInput}>{dayjs(endDate).format('YYYY-MM-DD HH:mm')}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="datetime"
          date={endDate}
          onConfirm={(date) => {
            setEndDate(date);
            setShowEndPicker(false);
          }}
          onCancel={() => setShowEndPicker(false)}
        />

        <Text style={styles.label}>Event Image</Text>
        {!!imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}
        <TouchableOpacity onPress={pickImage} style={styles.chooseImage}>
          <Text style={styles.chooseText}>Choose Image</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Applies To</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={appliesToType}
            onValueChange={(val) => {
              if (val === appliesToType) return;
              setAppliesToType(val);
              setSelectedSecondary([]); // reset selection to avoid carryover
            }}
            style={{ color: '#000' }}
          >
            <Picker.Item label="Branches" value="Branches" />
            <Picker.Item label="Departments" value="Departments" />
            <Picker.Item label="Standards" value="Standards" />
            <Picker.Item label="Sections" value="Sections" />
          </Picker>
        </View>

        {renderMultiSelect(
          appliesToType === 'Sections' ? 'Section' : appliesToType.slice(0, -1),
          secondaryOptions,
          selectedSecondary,
          setSelectedSecondary,
          appliesToType === 'Sections' ? 'label' : 'name'
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            {event?.id ? 'Updating event...' : 'Creating event...'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#2d3e83', marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 16, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 4,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateInput: {
    padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 4,
  },
  imagePreview: { height: 180, marginTop: 10, borderRadius: 10 },
  chooseImage: {
    backgroundColor: '#e0e0e0', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8,
  },
  chooseText: { color: '#333' },
  saveButton: {
    backgroundColor: '#2d3e83', padding: 12, borderRadius: 8, marginTop: 24, alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelButton: {
    backgroundColor: '#ccc', padding: 12, borderRadius: 8, marginTop: 12, alignItems: 'center',
  },
  cancelText: { color: '#000', fontWeight: '600' },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  selectedStyle: {
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },

});

export default EditEventScreen;
