import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { fetchUserDetails, updateUserDetails } from '../api/userdetails';

const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const EditUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState({ field: null, show: false });

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserDetails(token, userId);
        setFormData(data);
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      handleInputChange(showDatePicker.field, isoDate);
    }
    setShowDatePicker({ field: null, show: false });
  };

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5, base64: true,
    });
    if (!result.cancelled) {
      handleInputChange('profile_image', result.uri);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUserDetails(token, userId, formData);
      Alert.alert('Success', 'User details updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit User Details</Text>

      {/* Image picker */}
      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {formData.profile_image ? (
          <Image source={{ uri: formData.profile_image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Pick Profile Image</Text>
        )}
      </TouchableOpacity>

      {/* Basic details */}
      <TextInput style={styles.input} placeholder="First Name"
        value={formData.first_name || ''}
        onChangeText={text => handleInputChange('first_name', text)} />
      <TextInput style={styles.input} placeholder="Last Name"
        value={formData.last_name || ''}
        onChangeText={text => handleInputChange('last_name', text)} />
      <TextInput style={styles.input} placeholder="Email"
        value={formData.email || ''}
        onChangeText={text => handleInputChange('email', text)} />
      <TextInput style={styles.input} placeholder="Phone"
        value={formData.phone || ''}
        onChangeText={text => handleInputChange('phone', text)} />
      <TextInput style={styles.input} placeholder="Alternate Phone"
        value={formData.alternate_phone || ''}
        onChangeText={text => handleInputChange('alternate_phone', text)} />
      <TextInput style={styles.input} placeholder="Employee ID"
        value={formData.employee_id || ''}
        onChangeText={text => handleInputChange('employee_id', text)} />

      {/* Gender dropdown */}
      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={formData.gender}
        onValueChange={value => handleInputChange('gender', value)}>
        {genderOptions.map(option => (
          <Picker.Item key={option} label={option} value={option} />
        ))}
      </Picker>

      {/* Blood group dropdown */}
      <Text style={styles.label}>Blood Group</Text>
      <Picker
        selectedValue={formData.blood_group}
        onValueChange={value => handleInputChange('blood_group', value)}>
        {bloodGroupOptions.map(option => (
          <Picker.Item key={option} label={option} value={option} />
        ))}
      </Picker>

      {/* Date of birth picker */}
      <TouchableOpacity onPress={() => setShowDatePicker({ field: 'dob', show: true })}>
        <TextInput style={styles.input} placeholder="Date of Birth"
          value={formData.dob || ''}
          editable={false} />
      </TouchableOpacity>

      {/* Address */}
      <Text style={styles.sectionTitle}>Address</Text>
      <TextInput style={styles.input} placeholder="State"
        value={formData.address?.state || ''}
        onChangeText={text => handleInputChange('address.state', text)} />
      <TextInput style={styles.input} placeholder="City"
        value={formData.address?.city || ''}
        onChangeText={text => handleInputChange('address.city', text)} />
      <TextInput style={styles.input} placeholder="Zip Code"
        value={formData.address?.zip_code || ''}
        onChangeText={text => handleInputChange('address.zip_code', text)} />
      <TextInput style={styles.input} placeholder="Landmark"
        value={formData.address?.landmark || ''}
        onChangeText={text => handleInputChange('address.landmark', text)} />
      <TextInput style={styles.input} placeholder="Street"
        value={formData.address?.street || ''}
        onChangeText={text => handleInputChange('address.street', text)} />

      {/* Guardians + Education sections can follow same pattern if needed */}

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Show date picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={formData[showDatePicker.field] ? new Date(formData[showDatePicker.field]) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, marginTop: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 6 },
  button: { backgroundColor: '#007AFF', padding: 15, alignItems: 'center', borderRadius: 6, marginVertical: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  image: { width: 100, height: 100, borderRadius: 50 },
  imagePlaceholder: { color: '#007AFF', fontSize: 16 },
});

export default EditUserScreen;
