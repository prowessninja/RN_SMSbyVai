import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { fetchCurrentUser } from '../api/dashboard';
import LottieView from 'lottie-react-native';

const ViewProfile = () => {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const userData = await fetchCurrentUser(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    })();
  }, [token]);

  const InfoRow = ({ icon, label, value }) =>
    typeof value === 'string' || typeof value === 'number' ? (
      <View style={styles.infoRow}>
        <Icon name={icon} size={20} color="#007AFF" style={styles.icon} />
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    ) : null;

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Loading profile...</Text>
      </View>
    );
  }

  const hasProfileImage = !!user.profile_image;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      {/* Profile Image or Animation */}
      <View style={styles.avatarContainer}>
        {hasProfileImage ? (
          <Image
            source={{ uri: user.profile_image }}
            style={styles.avatar}
          />
        ) : (
          <LottieView
            source={require('../../assets/default.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        )}
      </View>

      {/* Section 1: Personal Info */}
      <InfoRow
        icon="account"
        label="Name"
        value={`${user.first_name || ''} ${user.last_name || ''}`.trim()}
      />
      <InfoRow icon="email" label="Email" value={user.email} />
      <InfoRow icon="phone" label="Phone" value={user.phone} />
      <InfoRow icon="gender-male-female" label="Gender" value={user.gender} />
      <InfoRow icon="calendar" label="Date of Birth" value={user.dob} />

      <View style={styles.separator} />

      {/* Section 2: Academic/Employment */}
      <InfoRow icon="shield-account" label="Role" value={user.group?.name} />
      {user.group?.name === 'Student' && (
        <InfoRow icon="school" label="Student Type" value={user.student_type} />
      )}
      <InfoRow icon="card-account-details" label="Employee ID" value={user.employee_id} />
      <InfoRow icon="numeric" label="Admission No." value={user.admission_number} />

      <View style={styles.separator} />

      {/* Section 3: Department */}
      <InfoRow icon="domain" label="Department" value={user.department?.name} />
      <InfoRow icon="account-tie" label="Designation" value={user.designation} />

      <View style={styles.separator} />

      {/* Section 4: About, Education, Expertise */}
      {user.about ? (
        <View style={styles.textBlock}>
          <Text style={styles.blockTitle}>About</Text>
          <Text style={styles.blockText}>{user.about}</Text>
        </View>
      ) : null}

      {user.education ? (
        <View style={styles.textBlock}>
          <Text style={styles.blockTitle}>Education</Text>
          <Text style={styles.blockText}>{user.education}</Text>
        </View>
      ) : null}

      {user.expertise ? (
        <View style={styles.textBlock}>
          <Text style={styles.blockTitle}>Expertise</Text>
          <Text style={styles.blockText}>{user.expertise}</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  animation: {
    width: 110,
    height: 110,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  textBlock: {
    marginBottom: 15,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2d3e83',
  },
  blockText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ViewProfile;
