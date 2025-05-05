// src/screens/AddUserScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { createUser } from '../api/userdetails';  // ← You must export this

const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const AddUserScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);

  // blank template for a new user
  const blankUser = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    department: '',
    gender: '',
    blood_group: '',
    dob: '',
    group: '',
    employee_id: '',
    address: { state: '', city: '', zip_code: '', landmark: '', street: '' },
    guardians: [{ first_name: '', last_name: '', contact_number: '', relation: '', occupation: '', company_name: '', annual_income: '' }],
    education_details: [{ institution: '', education_type: '', city: '', start_date: '', end_date: '' }]
  };

  const [formData, setFormData] = useState(blankUser);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ section: null, index: null, field: null, show: false });

  const handleMainChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleAddressChange = (field, value) =>
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));

  const handleGuardianChange = (idx, field, value) => {
    const guardians = [...formData.guardians];
    guardians[idx] = { ...guardians[idx], [field]: value };
    setFormData(prev => ({ ...prev, guardians }));
  };

  const handleEducationChange = (idx, field, value) => {
    const ed = [...formData.education_details];
    ed[idx] = { ...ed[idx], [field]: value };
    setFormData(prev => ({ ...prev, education_details: ed }));
  };

  const openDatePicker = (section, index, field) => {
    setShowDatePicker({ section, index, field, show: true });
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      const { section, index, field } = showDatePicker;
      if (section === 'main') handleMainChange(field, iso);
      else if (section === 'education') handleEducationChange(index, field, iso);
    }
    setShowDatePicker({ section: null, index: null, field: null, show: false });
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createUser(token, formData);
      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="User Details" />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.first_name}
        onChangeText={t => handleMainChange('first_name', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.last_name}
        onChangeText={t => handleMainChange('last_name', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={t => handleMainChange('email', t)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={t => handleMainChange('phone', t)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Alternate Phone"
        value={formData.alternate_phone}
        onChangeText={t => handleMainChange('alternate_phone', t)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Department"
        value={formData.department}
        onChangeText={t => handleMainChange('department', t)}
      />

      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={formData.gender}
        onValueChange={v => handleMainChange('gender', v)}
      >
        <Picker.Item label="Select Gender" value="" />
        {genderOptions.map(o => <Picker.Item key={o} label={o} value={o} />)}
      </Picker>

      <Text style={styles.label}>Blood Group</Text>
      <Picker
        selectedValue={formData.blood_group}
        onValueChange={v => handleMainChange('blood_group', v)}
      >
        <Picker.Item label="Select Blood Group" value="" />
        {bloodGroupOptions.map(o => <Picker.Item key={o} label={o} value={o} />)}
      </Picker>

      <TouchableOpacity onPress={() => openDatePicker('main', null, 'dob')}>
        <TextInput
          style={styles.input}
          placeholder="Date of Birth"
          value={formData.dob}
          editable={false}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Group"
        value={formData.group}
        onChangeText={t => handleMainChange('group', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Employee ID"
        value={formData.employee_id}
        onChangeText={t => handleMainChange('employee_id', t)}
      />

      <SectionHeader title="Address" />
      {['state','city','zip_code','landmark','street'].map(field => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace('_',' ')}
          value={formData.address[field] || ''}
          onChangeText={t => handleAddressChange(field, t)}
        />
      ))}

      <SectionHeader title="Guardian Details" />
      {formData.guardians.map((g, i) => (
        <View key={i}>
          {['first_name','last_name','contact_number','relation','occupation','company_name','annual_income'].map(f => (
            <TextInput
              key={f}
              style={styles.input}
              placeholder={f.replace('_',' ').replace(/^\w/, c => c.toUpperCase())}
              value={String(g[f] || '')}
              onChangeText={t => handleGuardianChange(i, f, t)}
            />
          ))}
        </View>
      ))}

      <SectionHeader title="Education Details" />
      {formData.education_details.map((ed, i) => (
        <View key={i}>
          {['institution','education_type','city'].map(f => (
            <TextInput
              key={f}
              style={styles.input}
              placeholder={f.replace('_',' ').replace(/^\w/, c => c.toUpperCase())}
              value={ed[f] || ''}
              onChangeText={t => handleEducationChange(i, f, t)}
            />
          ))}
          {['start_date','end_date'].map((f) => (
            <TouchableOpacity key={f} onPress={() => openDatePicker('education', i, f)}>
              <TextInput
                style={styles.input}
                placeholder={f.replace('_',' ').replace(/^\w/, c => c.toUpperCase())}
                value={ed[f] || ''}
                editable={false}
              />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {showDatePicker.show && (
        <DateTimePicker
          value={
            showDatePicker.section === 'main'
              ? new Date(formData[showDatePicker.field] || Date.now())
              : new Date(formData.education_details[showDatePicker.index][showDatePicker.field] || Date.now())
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleCreate}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  sectionHeader: {
    marginVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20
  },
  button: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5
  },
  cancelButton: { backgroundColor: '#ccc' },
  saveButton: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default AddUserScreen;
