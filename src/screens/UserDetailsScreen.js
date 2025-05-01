import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { fetchUserDetails, updateUserDetails } from '../api/userdetails';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow = ({ label }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoText}>{label}</Text>
  </View>
);

const UserDetailsScreen = () => {
  const { token } = useContext(AuthContext);
  const navigation = useNavigation();
  const { userId } = useRoute().params;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserDetails(token, userId);
        setUser(data);
        setFormData(data);
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, userId]);

  const handleInputChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleUpdate = async () => {
    try {
      const updated = await updateUserDetails(token, userId, formData);
      setUser(updated);
      setEditModalVisible(false);
      Alert.alert('Success', 'User details updated!');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const isStudent = user?.group?.name?.toLowerCase() === 'student';

  const sectionConfig = isStudent
    ? [
        { key: 'dob', label: 'Date of Birth' },
        { key: 'blood_group', label: 'Blood Group' },
        { key: 'phone', label: 'Phone' },
        { key: 'aadhar_number', label: 'Aadhar Number' },
        { key: 'pan_number', label: 'PAN Number' }
      ]
    : [
        { key: 'dob', label: 'Date of Birth' },
        { key: 'blood_group', label: 'Blood Group' },
        { key: 'phone', label: 'Phone' }
      ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wall} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        {user.profile_image ? (
          <Image source={{ uri: user.profile_image }} style={styles.avatar} />
        ) : (
          <Icon name="account-circle" size={100} color="#ccc" />
        )}
      </View>

      <View style={styles.basicInfo}>
        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.role}>{user.group?.name || 'No Role'}</Text>
        <Text style={styles.infoText}>{user.email}</Text>
        <Text style={styles.infoText}>{user.phone}</Text>
      </View>

      <Section title={isStudent ? 'Student Details' : 'Employee Details'}>
        {sectionConfig.map((field, i) => (
          <InfoRow key={i} label={`${field.label}: ${user[field.key] || '-'}`} />
        ))}
      </Section>

      {Array.isArray(user.guardians) && user.guardians.length > 0 && (
        <Section title="Guardian Details">
          {user.guardians.map((g, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <InfoRow label={`Name: ${g.first_name} ${g.last_name}`} />
              <InfoRow label={`Phone: ${g.contact_number || '-'}`} />
              <InfoRow label={`Occupation: ${g.occupation || '-'}`} />
            </View>
          ))}
        </Section>
      )}

      {Array.isArray(user.education_details) && user.education_details.length > 0 && (
        <Section title="Education">
          {user.education_details.map((edu, idx) => (
            <View key={idx} style={styles.educationBlock}>
              <Text style={styles.eduDegree}>
                {edu.education_type} : {edu.institution}
              </Text>
              <Text style={styles.eduYear}>
                {edu.start_date} to {edu.end_date}
              </Text>
            </View>
          ))}
        </Section>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setEditModalVisible(true)}>
          <Icon name="pencil" size={20} color="#fff" />
          <Text style={styles.actionText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="file-upload" size={20} color="#fff" />
          <Text style={styles.actionText}>Upload Document</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Details</Text>

            {sectionConfig.map((field, i) => (
              <TextInput
                key={i}
                style={styles.input}
                placeholder={field.label}
                value={formData[field.key] || ''}
                onChangeText={(text) => handleInputChange(field.key, text)}
              />
            ))}

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: '#f44336' }]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.updateButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // existing styles as in your current code
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  wall: { height: 150, backgroundColor: '#2d3e83' },
  backButton: { position: 'absolute', top: 40, left: 20 },
  profileContainer: { alignItems: 'center', marginTop: -50 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff' },
  basicInfo: { alignItems: 'center', marginTop: 10 },
  name: { fontSize: 20, fontWeight: 'bold' },
  role: { fontSize: 16, color: '#555', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#555' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2d3e83', padding: 10, borderRadius: 6 },
  actionText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  section: { backgroundColor: '#fff', padding: 15, margin: 6, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3e83', marginBottom: 6 },
  infoRow: { marginVertical: 2 },
  input: { backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 6, padding: 8, marginVertical: 4 },
  educationBlock: { marginBottom: 6 },
  eduDegree: { fontSize: 14, fontWeight: '600', color: '#333' },
  eduYear: { fontSize: 13, color: '#555' },
  updateButton: { backgroundColor: '#007AFF', margin: 20, padding: 12, borderRadius: 8, alignItems: 'center' },
  updateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#f44336' },
});

export default UserDetailsScreen;
