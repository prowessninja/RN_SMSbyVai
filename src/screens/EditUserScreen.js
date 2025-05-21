import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Eyecon from 'react-native-vector-icons/FontAwesome5';
import { fetchUserDetails, updateUserDetails } from '../api/userdetails';
import { launchImageLibrary } from 'react-native-image-picker';

export default function EditUserScreen({ route, navigation }) {
  const { userId, userData } = route.params || {};
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let data = userData;
      if (!data) data = await fetchUserDetails(token, userId);
      {
        console.log('📦 user data in EditUserScreen:', data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          alternate_phone: data.alternate_phone || '',
          standard: data.standard || '',
          department: data.department?.name || '',
          gender: data.gender || '',
          blood_group: data.blood_group || '',
          dob: data.dob || '',
          group: data.group?.name || '',
          admission_number: data.admission_number || '',
          employee_id: data.employee_id || '',
          profile_image: data.profile_image || '',
          aadhar_number: data.aapar_number || '',
          pan_number: data.pen_number || '',
          address: data.address || { state: '', city: '', zip_code: '', landmark: '', street: '' },
          guardians: data.guardians || [{ first_name: '', last_name: '', contact_number: '', relation: '', occupation: '', company_name: '', annual_income: '' }],
          education_details: data.education_details || [{ institution: '', education_type: '', city: '', start_date: '', end_date: '' }]
        });
      }
      setLoading(false);
    }
    load();
  }, [token, userId, userData]);

  const handleChange = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const handleAddressChange = (field, value) => setFormData(f => ({ ...f, address: { ...f.address, [field]: value } }));
  const handleGuardianChange = (idx, field, value) => {
    const updated = [...formData.guardians];
    updated[idx][field] = value;
    setFormData(f => ({ ...f, guardians: updated }));
  };
  const handleEducationChange = (idx, field, value) => {
    const updated = [...formData.education_details];
    updated[idx][field] = value;
    setFormData(f => ({ ...f, education_details: updated }));
  };

  const handleUpdate = async () => {
    try {
      await updateUserDetails(token, userId, formData);
      Alert.alert('Success', 'User details updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, maxWidth: 500, maxHeight: 500 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        const asset = response.assets[0];
        setFormData(f => ({
          ...f,
          profile_image: asset.base64 ? `data:${asset.type};base64,${asset.base64}` : asset.uri
        }));
      }
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;

  const isStudent = formData.group.toLowerCase() === 'student';
  const renderInput = (label, value, onChange) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Eyecon name="user-edit" size={20} color="#007AFF" style={{ marginLeft: 10 }} />
        <Text style={styles.headerTitle}>{isStudent ? 'Edit Student Details' : 'Edit Employee Details'}</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={formData.profile_image ? { uri: formData.profile_image } : require('../../assets/default_profile.jpg')
        }
          style={styles.profileImage}
        />
        <TouchableOpacity onPress={handlePickImage}>
          <Text style={styles.changePicText}>Edit Picture</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>User Details</Text>
      {renderInput('First Name', formData.first_name, t => handleChange('first_name', t))}
      {renderInput('Last Name', formData.last_name, t => handleChange('last_name', t))}
      {renderInput('Email', formData.email, t => handleChange('email', t))}
      {renderInput('Phone', formData.phone, t => handleChange('phone', t))}
      {renderInput('Alternate Phone', formData.alternate_phone, t => handleChange('alternate_phone', t))}
      {isStudent
        ? renderInput('Standard', formData.standard?.name || '', t => handleChange('standard', t))
        : renderInput('Department', formData.department || '', t => handleChange('department', t))}
      {renderInput('Gender', formData.gender, t => handleChange('gender', t))}
      {renderInput('Blood Group', formData.blood_group, t => handleChange('blood_group', t))}
      {renderInput('Date of Birth', formData.dob, t => handleChange('dob', t))}
      {renderInput('Group', formData.group, t => handleChange('group', t))}
      {isStudent
        ? renderInput('Admission Number', String(formData.admission_number || ''), t => handleChange('admission_number', t))
        : renderInput('Employee ID', formData.employee_id, t => handleChange('employee_id', t))}
      {isStudent && renderInput('Aadhar Number', formData.aadhar_number, t => handleChange('aadhar_number', t))}
      {isStudent && renderInput('PAN Number', formData.pan_number, t => handleChange('pan_number', t))}

      <Text style={styles.sectionTitle}>Address</Text>
      {renderInput('State', formData.address.state, t => handleAddressChange('state', t))}
      {renderInput('City', formData.address.city, t => handleAddressChange('city', t))}
      {renderInput('Zip Code', formData.address.zip_code, t => handleAddressChange('zip_code', t))}
      {renderInput('Landmark', formData.address.landmark, t => handleAddressChange('landmark', t))}
      {renderInput('Street', formData.address.street, t => handleAddressChange('street', t))}

      <Text style={styles.sectionTitle}>Guardian Details</Text>
      {formData.guardians.map((g, idx) => (
        <View key={idx}>
          {renderInput('First Name', g.first_name, t => handleGuardianChange(idx, 'first_name', t))}
          {renderInput('Last Name', g.last_name, t => handleGuardianChange(idx, 'last_name', t))}
          {renderInput('Contact Number', g.contact_number, t => handleGuardianChange(idx, 'contact_number', t))}
          {renderInput('Relation', g.relation, t => handleGuardianChange(idx, 'relation', t))}
          {renderInput('Occupation', g.occupation, t => handleGuardianChange(idx, 'occupation', t))}
          {renderInput('Company Name', g.company_name, t => handleGuardianChange(idx, 'company_name', t))}
          {renderInput('Annual Income', String(g.annual_income), t => handleGuardianChange(idx, 'annual_income', t))}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Education Details</Text>
      {formData.education_details.map((e, idx) => (
        <View key={idx}>
          {renderInput('Institution', e.institution, t => handleEducationChange(idx, 'institution', t))}
          {renderInput('Education Type', e.education_type, t => handleEducationChange(idx, 'education_type', t))}
          {renderInput('City', e.city, t => handleEducationChange(idx, 'city', t))}
          {renderInput('Start Date', e.start_date, t => handleEducationChange(idx, 'start_date', t))}
          {renderInput('End Date', e.end_date, t => handleEducationChange(idx, 'end_date', t))}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  profileContainer: { alignItems: 'center', marginBottom: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' },
  changePicText: { color: '#007AFF', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#007AFF' },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});
