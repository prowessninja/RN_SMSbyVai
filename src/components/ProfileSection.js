// ProfileSection.js
import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import Eyecon from 'react-native-vector-icons/FontAwesome5';
import { Dropdown } from 'react-native-element-dropdown';
import { AuthContext } from '../context/AuthContext';

const ProfileSection = ({ user, showProfile, setShowProfile }) => {
  const {
    branches,
    academicYears,
    selectedBranch,
    setSelectedBranch,
    selectedAcademicYear,
    setSelectedAcademicYear,
  } = useContext(AuthContext);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Toggle icon */}
      <TouchableOpacity
        onPress={() => setShowProfile(prev => !prev)}
        style={styles.iconToggle}
        accessibilityLabel="Toggle profile card"
      >
        <Eyecon name={showProfile ? 'eye-slash' : 'eye'} size={15} color="#fff" />
      </TouchableOpacity>

      {/* Profile card */}
      {showProfile && (
        <View style={styles.sectionGreeting}>
          {user?.profile_image ? (
            <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
          ) : (
            <LottieView
              source={require('../../assets/default.json')}
              autoPlay
              loop
              style={styles.profileImage}
            />
          )}

          <Text style={styles.greeting}>{greeting()}, {user?.first_name}</Text>
          <Text style={styles.role}>{user?.group?.name || 'User'}</Text>

          <View style={styles.dropdownRow}>
            <Dropdown
              style={styles.dropdown}
              data={academicYears.map(y => ({ ...y, label: y.name, value: y.id }))}
              labelField="label"
              valueField="value"
              value={selectedAcademicYear?.id}
              placeholder="Academic Year"
              onChange={setSelectedAcademicYear}
            />
            <Dropdown
              style={styles.dropdown}
              data={branches.map(b => ({ ...b, label: b.name, value: b.id }))}
              labelField="label"
              valueField="value"
              value={selectedBranch?.id}
              placeholder="Branch"
              onChange={setSelectedBranch}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  iconToggle: {
    alignSelf: 'flex-end',
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 10,
  },
  sectionGreeting: {
    alignItems: 'center',
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 10,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  role: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  dropdownRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dropdown: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
});

export default ProfileSection;
