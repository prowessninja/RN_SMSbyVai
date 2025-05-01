import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { fetchCurrentUser } from '../api/dashboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ArrowIcon from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const menuItems = [
  { label: 'Events', icon: 'calendar' },
  { label: 'Users', icon: 'account-group' },
  { label: 'Standards', icon: 'school' },
  { label: 'Departments', icon: 'domain' },
  {
    label: 'Attendance',
    icon: 'clipboard-list',
    children: ['Class Attendance', 'Staff Attendance'],
  },
  { label: 'Time Table', icon: 'timetable' },
  {
    label: 'Fee',
    icon: 'currency-inr',
    children: ['Standard Fee', 'Fee List', 'Payments', 'Fee Analytics'],
  },
  {
    label: 'Expenditure',
    icon: 'currency-usd-off',
    children: ['Expenditure List', 'Expense Analysis'],
  },
  { label: 'Income Dashboard', icon: 'finance' },
  {
    label: 'Stationery',
    icon: 'notebook',
    children: ['Stationery List', 'Stationery Fee'],
  },
  { label: 'Inventory', icon: 'archive' },
  { label: 'Inventory Analytics', icon: 'chart-bar' },
  { label: 'File Management', icon: 'file-document' },
  { label: 'Tasks', icon: 'check-circle' },
  { label: 'Exams', icon: 'file-certificate' },
  { label: 'Student Marks', icon: 'clipboard-text' },
  {
    label: 'Transport',
    icon: 'bus',
    children: ['Vehicle List', 'Trip List', 'Tracking'],
  },
  {
    label: 'Hostel',
    icon: 'bed',
    children: ['Hostel Rooms', 'Hostel Students', 'Visitors', 'Hostel Food', 'Hostel Inventory', 'Hostel Inventory Analytics'],
  },
  { label: 'Leave Management', icon: 'calendar-remove' },
  { label: '24/7 Support', icon: 'headset' },
];

const CustomDrawerContent = (props) => {
  const { token, logout } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const userData = await fetchCurrentUser(token);
        setProfileImage(userData.profile_image);
        const name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        setFullName(name || userData.email || 'User');
        setRoleName(userData.group?.name || 'Role');
      } catch (e) {
        console.error('Error fetching user for drawer:', e);
      }
    })();
  }, [token]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    logout();
    props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const toggleExpand = (label) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenu = () =>
    menuItems.map((item) => {
      const isExpanded = !!expandedMenus[item.label];
      return (
        <View key={item.label}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              item.children?.length
                ? toggleExpand(item.label)
                : props.navigation.navigate(item.label)
            }
          >
            <Icon name={item.icon} size={20} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>{item.label}</Text>
            {item.children?.length > 0 && (
              <ArrowIcon
                name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                size={20}
                color="#fff"
                style={styles.arrowIcon}
              />
            )}
          </TouchableOpacity>
          {item.children?.length > 0 && isExpanded && (
            <View style={styles.subMenuContainer}>
              {item.children.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={styles.subMenuItem}
                  onPress={() => props.navigation.navigate(sub)}
                >
                  <Text style={styles.subMenuItemText}>• {sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    });

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContainer}>
      <View style={styles.headerContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../../assets/avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.greeting}>Hello</Text>
        <Text style={styles.username}>{fullName}</Text>
        <Text style={styles.role}>{roleName}</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => props.navigation.navigate('ViewProfile')}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.menuContainer}>{renderMenu()}</ScrollView>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Powered by: VisionariesAI Labs, V.2025.01.0001
      </Text>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: '#2d3e83' },
  headerContainer: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: '#fff' },
  greeting: { fontSize: 16, color: '#fff' },
  username: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 14, color: '#ffca28', marginBottom: 5 },
  profileButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#ffca28', borderRadius: 20 },
  profileButtonText: { color: '#2d3e83', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#fff', marginVertical: 10 },
  menuContainer: { paddingHorizontal: 10, flexGrow: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  menuIcon: { marginRight: 10 },
  menuItemText: { fontSize: 16, color: '#fff', flex: 1 },
  arrowIcon: { marginLeft: 'auto' },
  subMenuContainer: { paddingLeft: 30 },
  subMenuItem: { paddingVertical: 6 },
  subMenuItemText: { fontSize: 14, color: '#e0e0e0' },
  logoutButton: { padding: 15, backgroundColor: '#f44336', marginHorizontal: 10, borderRadius: 8, marginBottom: 20 },
  logoutText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  footerText: { color: '#fff', textAlign: 'center', marginVertical: 10, fontSize: 12 },
});

export default CustomDrawerContent;
