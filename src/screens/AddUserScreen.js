import React, { useState, useContext,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import { createUserDetails } from '../api/userdetails';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchDropDownItems } from '../api/fetchDropDownItems';

const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const relationshipOptions = ['Mother', 'Father', 'Guardian'];
const stateOptions = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const studentStandards = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const designations = ['Junior Teacher', 'Senior Teacher', 'Head of the Department', 'Asst. HOD.', 'Worker', 'Driver', 'Account Admin', 'Accountant', 'Workshop Admin', 'Technician', 'Branch Admin', 'Lab Technician', 'Hostel Warden'];

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const AddUserScreen = ({ navigation, route }) => {
  const { token } = useContext(AuthContext);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ field: null, show: false });
  
  

  // LOG branchId passed from UsersScreen
  const branchId = route?.params?.branchId;
  const yearId = route?.params?.yearId;
  console.log('Received branchId:', branchId);
  console.log('Received yearId:', yearId);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const { departments, designations, groups, standards } = await fetchDropDownItems(
          token,
          branchId,
          yearId
        );
        
        console.log(
          '✅ Designations:',
          (designations.results || []).map(desig => ({
            id: desig.id,
            name: desig.name
          }))
        );
        
        console.log(
          '✅ Groups:',
          (groups.results || []).map(group => ({
            id: group.id,
            name: group.name
          }))
        );
        
        console.log(
          '✅ Standards:',
          (standards.results || []).map(standard => ({
            id: standard.id,
            name: standard.name
          }))
        );
        console.log(
          '✅ Departments:',
          (departments.results || []).map(dep => ({
            id: dep.id,
            name: dep.name
          }))
        );

        // You can set these in state if needed:
        // setDepartments(departments);
        // setDesignations(designations);
        // setGroups(groups);
        // setStandards(standards);
      } catch (err) {
        console.error('🔥 Error loading dropdowns in AddUserScreen:', err);
      }
    };

    loadDropdowns();
  }, [token, branchId, yearId]);

  const handleMainChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const openDatePicker = (field) => {
    setShowDatePicker({ field, show: true });
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      handleMainChange(showDatePicker.field, iso);
    }
    setShowDatePicker({ field: null, show: false });
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) Alert.alert('Error', response.errorMessage);
      else setProfileImage(response.assets[0]);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        aapar_number: "123456789012",
        address: {
          street: "Fake Street",
          city: "Sample City",
          zip_code: "123456",
          landmark: "Sample Landmark",
          state: "Telangana"
        },
        admission_number: "98765432109876541",
        alternate_phone: "+919876543210",
        blood_group: "A+",
        branch_id: 2,
        dob: "1995-01-01",
        education_details: [
          {
            institution: "ABC University",
            education_type: "Bachelors",
            city: "Sample City",
            start_date: "2020-01-01",
            end_date: "2024-01-01"
          }
        ],
        email: "iamvoleti@gmail.com",
        employee_id: "E1234567",
        first_name: "John",
        gender: "Male",
        group_id: 2,
        guardian_details: [
          {
            first_name: "Jane",
            last_name: "Doe",
            relation: "Mother",
            contact_number: "+919876543210",
            occupation: "Engineer"
          }
        ],
        last_name: "Doe",
        phone: "+919876543210",
        standard_id: 5,
        department_id: 4,
        designation_id: 4
      };

      console.log('Creating user with data:', payload);
      console.log('Payload JSON:', JSON.stringify(payload, null, 2));

      await createUserDetails(token, payload);

      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('🔥 createUserDetails error:', err);
      Alert.alert('Error', err.message || 'Failed to create user');
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

  const renderPicker = (selectedValue, onValueChange, options, placeholder) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={placeholder} value="" />
        {options.map(opt => (
          <Picker.Item key={opt} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Add User</Text>
      </View>

      {userType === '' ? (
        <View>
          <Text style={styles.label}>Select User Type</Text>
          {renderPicker(userType, setUserType, ['Student', 'Organisation Admin','Branch Admin','Driver','Teacher','Head of the Department'], 'Select Type')}
          <TouchableOpacity style={styles.button} onPress={() => userType ? null : Alert.alert('Please select a user type')}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <SectionHeader title="User Details" />
          <TextInput style={[styles.input, styles.disabled]} value={userType} editable={false} />

          <TouchableOpacity onPress={() => openDatePicker('joining_date')}>
            <TextInput style={styles.input} placeholder="Date of Joining" value={formData.joining_date} editable={false} />
          </TouchableOpacity>

          {userType === 'Student' ? (
            <>
              <TextInput style={styles.input} placeholder="PAN" onChangeText={t => handleMainChange('pan', t)} />
              <TextInput style={styles.input} placeholder="Aadhar" onChangeText={t => handleMainChange('aadhar', t)} />
              <TextInput style={styles.input} placeholder="Admission Number" onChangeText={t => handleMainChange('admission_number', t)} />
              {renderPicker(formData.standard, v => handleMainChange('standard', v), studentStandards, 'Select Standard')}
            </>
          ) : (
            <>
              {renderPicker(formData.designation, v => handleMainChange('designation', v), designations, 'Select Designation')}
              <TextInput style={styles.input} placeholder="Department" onChangeText={t => handleMainChange('department', t)} />
              <TextInput style={styles.input} placeholder="Employee ID" onChangeText={t => handleMainChange('employee_id', t)} />
            </>
          )}

          <TextInput style={styles.input} placeholder="First Name" onChangeText={t => handleMainChange('first_name', t)} />
          <TextInput style={styles.input} placeholder="Last Name" onChangeText={t => handleMainChange('last_name', t)} />
          <TextInput style={styles.input} placeholder="Email" onChangeText={t => handleMainChange('email', t)} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Phone Number" onChangeText={t => handleMainChange('phone', t)} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Alternate Phone Number" onChangeText={t => handleMainChange('alternate_phone', t)} keyboardType="phone-pad" />
          <TouchableOpacity onPress={() => openDatePicker('dob')}>
            <TextInput style={styles.input} placeholder="Date of Birth" value={formData.dob} editable={false} />
          </TouchableOpacity>
          {renderPicker(formData.gender, v => handleMainChange('gender', v), genderOptions, 'Select Gender')}
          {renderPicker(formData.blood_group, v => handleMainChange('blood_group', v), bloodGroupOptions, 'Select Blood Group')}
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {profileImage ? <Image source={{ uri: profileImage.uri }} style={styles.profileImage} /> : <Text style={styles.imagePickerText}>Select Profile Picture</Text>}
          </TouchableOpacity>

          <SectionHeader title="Address" />
          <TextInput style={styles.input} placeholder="Street" onChangeText={t => handleMainChange('street', t)} />
          <TextInput style={styles.input} placeholder="City" onChangeText={t => handleMainChange('city', t)} />
          <TextInput style={styles.input} placeholder="Zip Code" onChangeText={t => handleMainChange('zip_code', t)} />
          <TextInput style={styles.input} placeholder="Landmark" onChangeText={t => handleMainChange('landmark', t)} />
          {renderPicker(formData.state, v => handleMainChange('state', v), stateOptions, 'Select State')}

          <SectionHeader title="Education Details" />
          <TextInput style={styles.input} placeholder="Institution" onChangeText={t => handleMainChange('institution', t)} />
          <TextInput style={styles.input} placeholder="Education Type" onChangeText={t => handleMainChange('education_type', t)} />
          <TextInput style={styles.input} placeholder="Education City" onChangeText={t => handleMainChange('education_city', t)} />
          <TouchableOpacity onPress={() => openDatePicker('start_date')}>
            <TextInput style={styles.input} placeholder="Start Date" value={formData.start_date} editable={false} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDatePicker('end_date')}>
            <TextInput style={styles.input} placeholder="End Date" value={formData.end_date} editable={false} />
          </TouchableOpacity>

          <SectionHeader title="Guardian Details" />
          <TextInput style={styles.input} placeholder="Guardian First Name" onChangeText={t => handleMainChange('guardian_first_name', t)} />
          <TextInput style={styles.input} placeholder="Guardian Last Name" onChangeText={t => handleMainChange('guardian_last_name', t)} />
          <TextInput style={styles.input} placeholder="Guardian Contact Number" onChangeText={t => handleMainChange('guardian_contact_number', t)} />
          <TextInput style={styles.input} placeholder="Guardian Occupation" onChangeText={t => handleMainChange('guardian_occupation', t)} />
          <TextInput style={styles.input} placeholder="Guardian Annual Income" onChangeText={t => handleMainChange('guardian_annual_income', t)} />
          {renderPicker(formData.guardian_relation, v => handleMainChange('guardian_relation', v), relationshipOptions, 'Select Relationship')}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker.show && (
        <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  sectionHeader: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, marginVertical: 10 },
  sectionHeaderText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  disabled: { backgroundColor: '#f0f0f0' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10 },
  picker: { height: 50, width: '100%' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePicker: { backgroundColor: '#007AFF', padding: 10, alignItems: 'center', borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#005BBB' },
  imagePickerText: { color: '#fff' },
  profileImage: { width: 100, height: 100, borderRadius: 50 }
});

export default AddUserScreen;
