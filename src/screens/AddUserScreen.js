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
  import { sendPasswordResetEmail } from '../api/userdetails';


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
    
    const [dropdowns, setDropdowns] = useState({
      standards: [],
      designations: [],
      departments: [],
      groups: []
    });
    
    

    // LOG branchId passed from UsersScreen
    const branchId = route?.params?.branchId;
    const yearId = route?.params?.yearId;
    console.log('Received branchId:', branchId);
    console.log('Received yearId:', yearId);

    useEffect(() => {
      const loadDropdowns = async () => {
        console.log('🚀 Loading dropdowns with:', { token, branchId, yearId });
        try {
          const { departments, designations, groups, standards } = await fetchDropDownItems(
            token,
            branchId,
            yearId
          );
    
          //console.log('✅ Raw Departments:', departments);
          //console.log('✅ Raw Designations:', designations);
          //console.log('✅ Raw Groups:', groups);
          //console.log('✅ Raw Standards:', standards);
    
          //console.log(
          //  '✅ Mapped Designations:',
          //  (designations?.results || []).map(desig => ({ id: desig.id, name: desig.name }))
          //);
          //console.log(
          //  '✅ Mapped Groups:',
          //  (groups?.results || []).map(group => ({ id: group.id, name: group.name }))
          //);
          //console.log(
          //  '✅ Mapped Standards:',
          //  (standards?.results || []).map(standard => ({ id: standard.id, name: standard.name }))
          //);
          //console.log(
          //  '✅ Mapped Departments:',
          //  (departments?.results || []).map(dep => ({ id: dep.id, name: dep.name }))
          //);
    
          const newDropdowns = {
            standards: standards || [],
            designations: designations || [],
            departments: departments || [],
            groups: groups || []
          };
    
          setDropdowns(newDropdowns);
    
          // Log after setting
          //console.log('🎯 Updated dropdowns state:', {
          //  departments: (departments?.results || []).map(dep => ({ id: dep.id, name: dep.name })),
          //  designations: (designations?.results || []).map(desig => ({ id: desig.id, name: desig.name })),
          //  groups: (groups?.results || []).map(group => ({ id: group.id, name: group.name })),
          //  standards: (standards?.results || []).map(std => ({ id: std.id, name: std.name }))
          //});
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
        console.log('🚀 Submitting formData:', formData);
    
        const payload = {
          // ✅ Common fields for both:
          address: {
            street: formData.street || '',
            city: formData.city || '',
            zip_code: formData.zip_code || '',
            landmark: formData.landmark || '',
            state: formData.state || ''
          },
          alternate_phone: formData.alternate_phone || '',
          blood_group: formData.blood_group || '',
          branch_id: branchId,  // from route param
          dob: formData.dob || '',
          education_details: [
            {
              institution: formData.institution || '',
              education_type: formData.education_type || '',
              city: formData.education_city || '',
              start_date: formData.start_date || '',
              end_date: formData.end_date || ''
            }
          ],
          email: formData.email || '',
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
          gender: formData.gender || '',
          phone: formData.phone || '',
          group_id: (() => {
            const selectedGroup = (dropdowns.groups?.results || []).find(
              (g) => g.name === formData.group
            );
            return selectedGroup ? selectedGroup.id : null;
          })(),
          // ✅ Guardian details ALWAYS included:
          guardian_details: [
            {
              first_name: formData.guardian_first_name || '',
              last_name: formData.guardian_last_name || '',
              relation: formData.guardian_relation || '',
              contact_number: formData.guardian_contact_number || '',
              occupation: formData.guardian_occupation || '',
              annual_income: formData.guardian_annual_income || ''
            }
          ]
        };
        
        //if (profileImage) {
        //  payload.append('profile_image', {
        //    uri: profileImage.uri,
        //    type: profileImage.type || 'image/jpeg',
        //    name: profileImage.fileName || 'profile.jpg'
        //  });
       // }

        if (userType === 'Student') {
          // ✅ Student-only fields
          payload.pan = formData.pan || '';
          payload.aapar_number = formData.aapar_number || '';
          payload.admission_number = formData.admission_number || '';
          payload.standard_id = (() => {
            const selectedStandard = (dropdowns.standards?.results || []).find(
              (s) => s.id === formData.standard || s.name === formData.standard
            );
            return selectedStandard ? selectedStandard.id : null;
          })();
        } else {
          // ✅ Staff-only fields
          payload.employee_id = formData.employee_id || '';
          payload.designation_id = (() => {
            const selectedDesignation = (dropdowns.designations?.results || []).find(
              (d) => d.id === formData.designation || d.name === formData.designation
            );
            return selectedDesignation ? selectedDesignation.id : null;
          })();
          payload.department_id = (() => {
            const selectedDepartment = (dropdowns.departments?.results || []).find(
              (d) => d.id === formData.department || d.name === formData.department
            );
            return selectedDepartment ? selectedDepartment.id : null;
          })();
        }
    
        console.log('✅ Final Payload:', JSON.stringify(payload, null, 2));

        const createdUser = await createUserDetails(token, payload);

    // 🚀 Trigger password reset email
    if (createdUser?.id) {
      await sendPasswordResetEmail(token, createdUser.id);
      console.log(`✅ Password reset email sent to user ID: ${createdUser.id}`);
    } else {
      console.warn('⚠️ No user ID returned from createUserDetails');
    }
    
        await createUserDetails(token, payload);
    
        Alert.alert('Success', 'User created successfully!', [
  {
    text: 'OK',
    onPress: () => navigation.navigate('UsersScreen', { refreshed: true })
  }
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
            
            {renderPicker(formData.group,v => {handleMainChange('group', v);setUserType(v);},dropdowns.groups?.results?.map(s => s.name) || [],'Select User Type')}
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
                <TextInput style={styles.input} placeholder="Aadhar" onChangeText={t => handleMainChange('aapar_number', t)} />
                <TextInput style={styles.input} placeholder="Admission Number" onChangeText={t => handleMainChange('admission_number', t)} />
                <Picker 
                  selectedValue={formData.standard || ''}
                  onValueChange={(itemValue) => {
                  handleMainChange('standard', itemValue);
                  console.log('Selected Standard ID (from formData):', itemValue);
                  }}
>
                <Picker.Item label="Select Standard" value="" />
                {(dropdowns.standards?.results || []).map((standard) => (
                <Picker.Item key={standard.id} label={standard.name} value={standard.id} />
                ))}
                </Picker>


              </>
            ) : (
              <>
                <Picker 
                  selectedValue={formData.designation || ''}
                  onValueChange={(itemValue) => {
                  handleMainChange('designation', itemValue);
                  console.log('Selected Designation ID (from formData):', itemValue);
                  }}
>
                <Picker.Item label="Select Designation" value="" />
                {(dropdowns.designations?.results || []).map((designation) => (
                <Picker.Item key={designation.id} label={designation.name} value={designation.id} />
                ))}
                </Picker>
                <Picker 
                  selectedValue={formData.department || ''}
                  onValueChange={(itemValue) => {
                  handleMainChange('department', itemValue);
                  console.log('Selected Department ID (from formData):', itemValue);
                  }}
>
                <Picker.Item label="Select Department" value="" />
                {(dropdowns.departments?.results || []).map((department) => (
                <Picker.Item key={department.id} label={department.name} value={department.id} />
                ))}
                </Picker>
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
