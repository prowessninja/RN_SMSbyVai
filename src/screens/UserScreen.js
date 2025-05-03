// src/screens/EditUserScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { updateUserDetails } from '../api/userdetails';

const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const UserScreen = ({ route, navigation }) => {
  const { userId, userData } = route.params;
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState({ section: null, index: null, field: null, show: false });

  // initialize from passed-in data
  useEffect(() => {
    setFormData({
      ...userData,
      address: userData.address || {},
      guardians: Array.isArray(userData.guardians) ? userData.guardians : [],
      education_details: Array.isArray(userData.education_details) ? userData.education_details : []
    });
    setLoading(false);
  }, []);

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

  const handleUpdate = async () => {
    try {
      await updateUserDetails(token, userId, formData);
      Alert.alert('Success', 'User details updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading || !formData) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
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
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={t => handleMainChange('phone', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Alternate Phone"
        value={formData.alternate_phone}
        onChangeText={t => handleMainChange('alternate_phone', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Department"
        value={formData.department || ''}
        onChangeText={t => handleMainChange('department', t)}
      />

      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={formData.gender}
        onValueChange={v => handleMainChange('gender', v)}
      >
        {genderOptions.map(o => <Picker.Item key={o} label={o} value={o} />)}
      </Picker>

      <Text style={styles.label}>Blood Group</Text>
      <Picker
        selectedValue={formData.blood_group}
        onValueChange={v => handleMainChange('blood_group', v)}
      >
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
        value={formData.group?.name || formData.group || ''}
        onChangeText={t => handleMainChange('group', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Employee ID"
        value={formData.employee_id}
        onChangeText={t => handleMainChange('employee_id', t)}
      />

      <SectionHeader title="Address" />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={formData.address.state || ''}
        onChangeText={t => handleAddressChange('state', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.address.city || ''}
        onChangeText={t => handleAddressChange('city', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        value={formData.address.zip_code || ''}
        onChangeText={t => handleAddressChange('zip_code', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Landmark"
        value={formData.address.landmark || ''}
        onChangeText={t => handleAddressChange('landmark', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={formData.address.street || ''}
        onChangeText={t => handleAddressChange('street', t)}
      />

      <SectionHeader title="Guardian Details" />
      {formData.guardians.map((g, i) => (
        <View key={i}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={g.first_name}
            onChangeText={t => handleGuardianChange(i, 'first_name', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={g.last_name}
            onChangeText={t => handleGuardianChange(i, 'last_name', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={g.contact_number}
            onChangeText={t => handleGuardianChange(i, 'contact_number', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Relationship"
            value={g.relation || g.relationship}
            onChangeText={t => handleGuardianChange(i, 'relation', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Occupation"
            value={g.occupation}
            onChangeText={t => handleGuardianChange(i, 'occupation', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={g.company_name}
            onChangeText={t => handleGuardianChange(i, 'company_name', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Annual Income"
            value={String(g.annual_income)}
            onChangeText={t => handleGuardianChange(i, 'annual_income', t)}
          />
        </View>
      ))}

      <SectionHeader title="Education Details" />
      {formData.education_details.map((ed, i) => (
        <View key={i}>
          <TextInput
            style={styles.input}
            placeholder="Institution"
            value={ed.institution}
            onChangeText={t => handleEducationChange(i, 'institution', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Education Type"
            value={ed.education_type}
            onChangeText={t => handleEducationChange(i, 'education_type', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={ed.city}
            onChangeText={t => handleEducationChange(i, 'city', t)}
          />
          <TouchableOpacity onPress={() => openDatePicker('education', i, 'start_date')}>
            <TextInput
              style={styles.input}
              placeholder="Start Date"
              value={ed.start_date}
              editable={false}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDatePicker('education', i, 'end_date')}>
            <TextInput
              style={styles.input}
              placeholder="End Date"
              value={ed.end_date}
              editable={false}
            />
          </TouchableOpacity>
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
          onPress={handleUpdate}
        >
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  sectionHeader: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  sectionHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginVertical: 5,
  },
  label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  buttonContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20,
  },
  button: {
    flex: 1, padding: 15, alignItems: 'center', borderRadius: 5, marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#ccc' },
  saveButton: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default UserScreen;
