import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';
import { Dropdown } from 'react-native-element-dropdown';
import Eyecon from 'react-native-vector-icons/FontAwesome5';

import OrganisationAdminDashboard from './OrganisationAdminDashboard';
import HODDashboard from './HODDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

// Map roles to their dashboard components
const DASHBOARD_MAP = {
  'Organisation Admin': OrganisationAdminDashboard,
  'Head of Department': HODDashboard,
  'Student': StudentDashboard,
  'Teacher': TeacherDashboard,
};

const Dashboard = () => {
  // Hooks must be called unconditionally at top
  const { user, branches, academicYears } = useContext(AuthContext);
  //const [branch, setBranch] = useState(branches?.[0]?.id);
  //const [year, setYear] = useState(academicYears?.[0]?.id);
  const [showProfile, setShowProfile] = useState(true);

  if (!user) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  const role = user?.group?.name || 'Organisation Admin';
  const DashboardComponent = DASHBOARD_MAP[role];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const animationSource = require('../../assets/default.json');

  const {
    selectedBranch,
    setSelectedBranch,
    selectedAcademicYear,
    setSelectedAcademicYear,
  } = useContext(AuthContext);

  // Use these in your dropdowns


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Toggle */}
      <TouchableOpacity
        onPress={() => setShowProfile(p => !p)}
        style={styles.iconToggle}
        accessibilityLabel="Toggle profile card"
      >
        <Eyecon
          name={showProfile ? 'eye-slash' : 'eye'}
          size={15}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Spacer */}
      <View style={{ padding: 15, marginBottom: 0.5 }} />

      {/* Profile Card */}
      {showProfile && (
        <View style={styles.sectionGreeting}>
          {user.profile_image ? (
            <Image
              source={{ uri: user.profile_image }}
              style={styles.profileImage}
            />
          ) : (
            <LottieView
              source={animationSource}
              autoPlay
              loop
              style={styles.animation}
            />
          )}
          <Text style={styles.greeting}>
            {greeting()}, {user.first_name || 'User'}
          </Text>
          <Text style={styles.role}>{role}</Text>

          {/* Branch / Year Filters */}
          <View style={styles.dropdownRow}>
            <Dropdown
              style={styles.dropdown}
              data={(academicYears || []).map(y => ({ ...y, label: y.name, value: y.id }))}
              labelField="label"
              valueField="value"
              value={selectedAcademicYear?.id}
              placeholder="Academic Year"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              onChange={item => setSelectedAcademicYear(item)} // ✅ full object
            />

            <Dropdown
              style={styles.dropdown}
              data={(branches || []).map(b => ({ ...b, label: b.name, value: b.id }))}
              labelField="label"
              valueField="value"
              value={selectedBranch?.id}
              placeholder="Branch"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              onChange={item => setSelectedBranch(item)} // ✅ full object
            />

          </View>
        </View>
      )}

      {/* Role‑based Dashboard */}
      {DashboardComponent ? (
        <DashboardComponent
          branch={selectedBranch?.id}
          year={selectedAcademicYear?.id}
          user={user}
        />
      ) : (
        <View style={styles.noDashboard}>
          <Text style={styles.noDashboardText}>
            No dashboard available for your role: {role}
          </Text>
        </View>
      )}

      {/* Bottom Spacer */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#FAFAFA',
  },
  sectionGreeting: {
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#2d3e83',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  animation: {
    height: 80,
    width: 80,
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
  iconToggle: {
    alignSelf: 'flex-end',
    backgroundColor: '#2d3e83',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 1,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  dropdown: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  noDashboard: {
    padding: 20,
    alignItems: 'center',
  },
  noDashboardText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Dashboard;
