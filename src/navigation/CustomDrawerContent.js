import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomDrawerContent = () => {
  const { user, permissions } = useContext(AuthContext);
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);

  const groupedPermissions = {};
  permissions.forEach((perm) => {
    groupedPermissions[perm.codename] = true;
  });

  const toggleExpand = (label) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const hasPermission = (requiredPermissions = []) => {
    return requiredPermissions.some((perm) => groupedPermissions[perm]);
  };

  const handleNavigate = (label, routeName = null) => {
    setSelectedRoute(label);
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  const renderMenuItem = (item) => {
    const isExpanded = expandedItems[item.label];
    const showItem = hasPermission(item.permissions);

    if (!showItem) return null;

    return (
      <View key={item.label}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            selectedRoute === item.label && styles.activeMenuItem,
          ]}
          onPress={() => {
            if (item.children) toggleExpand(item.label);
            else handleNavigate(item.label, item.route || item.label);
          }}
        >
          <Icon name={item.icon} size={20} color="#fff" style={{ width: 24 }} />
          <Text style={styles.menuText}>{item.label}</Text>
          {item.children && (
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#fff"
              style={{ marginLeft: 'auto' }}
            />
          )}
        </TouchableOpacity>

        {isExpanded &&
          item.children &&
          item.children.map((child) =>
            hasPermission(child.permissions) ? (
              <TouchableOpacity
                key={child.label}
                style={[
                  styles.subMenuItem,
                  selectedRoute === child.label && styles.activeSubMenuItem,
                ]}
                onPress={() => handleNavigate(child.label, child.route || child.label)}
              >
                <Text style={styles.subMenuText}>• {child.label}</Text>
              </TouchableOpacity>
            ) : null
          )}
      </View>
    );
  };

  const menuItems = [
    { label: 'Events', icon: 'calendar', permissions: ['view_event'] },
    { label: 'Users', icon: 'account-group', permissions: ['view_user'] },
    { label: 'Standards', icon: 'school', permissions: ['view_standard'] },
    { label: 'Departments', icon: 'domain', permissions: ['view_department'] },
    {
      label: 'Attendance',
      icon: 'clipboard-list',
      permissions: ['view_attendance'],
      children: [
        { label: 'Class Attendance', permissions: ['view_attendance'] },
        { label: 'Staff Attendance', permissions: ['view_teacherattendance'] },
      ],
    },
    { label: 'Time Table', icon: 'timetable', permissions: ['view_schedule'] },
    {
      label: 'Fee',
      icon: 'currency-inr',
      permissions: ['view_fee'],
      children: [
        { label: 'Standard Fee', permissions: ['view_fee'] },
        { label: 'Fee List', permissions: ['view_feepayment'] },
        { label: 'Payments', permissions: ['view_feepayment'] },
        {
          label: 'Fee Analytics',
          permissions: ['view_feesummary', 'view_totalfeesummary'],
        },
      ],
    },
    {
      label: 'Expenditure',
      icon: 'currency-usd-off',
      permissions: ['view_feesummary'],
      children: [
        { label: 'Expenditure List', permissions: ['view_feesummary'] },
        { label: 'Expense Analysis', permissions: ['view_feesummary'] },
      ],
    },
    {
      label: 'Income Dashboard',
      icon: 'finance',
      permissions: ['view_totalfeesummary'],
    },
    {
      label: 'Stationery',
      icon: 'notebook',
      permissions: ['view_stationary'],
      children: [
        { label: 'Stationery List', permissions: ['view_stationary'] },
        { label: 'Stationery Fee', permissions: ['view_stationarytype'] },
      ],
    },
    { label: 'Inventory', icon: 'archive', permissions: ['view_inventory'] },
    {
      label: 'Inventory Analytics',
      icon: 'chart-bar',
      permissions: ['view_inventorytracking'],
    },
    {
      label: 'File Management',
      icon: 'file-document',
      permissions: ['view_document'],
    },
    {
      label: 'Tasks',
      icon: 'check-circle',
      permissions: ['view_query', 'view_answer'],
    },
    {
      label: 'Exams',
      icon: 'file-certificate',
      permissions: ['view_exam'],
      children: [
        { label: 'Exam List', permissions: ['view_exam'] },
        { label: 'Exam Answers', permissions: ['view_examanswer'] },
        { label: 'Exam Schedule', permissions: ['view_examschedule'] },
      ],
    },
    {
      label: 'Student Marks',
      icon: 'clipboard-text',
      permissions: ['view_examanswer'],
    },
    {
      label: 'Transport',
      icon: 'bus',
      permissions: ['view_vehicle'],
      children: [
        { label: 'Vehicle List', permissions: ['view_vehicle'] },
        { label: 'Trip List', permissions: ['view_trip'] },
        { label: 'Tracking', permissions: ['view_vehicletracking'] },
      ],
    },
    {
      label: 'Hostel',
      icon: 'bed',
      permissions: ['view_hostelblock'],
      children: [
        { label: 'Hostel Rooms', permissions: ['view_hostelroom'] },
        { label: 'Hostel Students', permissions: ['view_studentdetails'] },
        { label: 'Visitors', permissions: ['view_visitor'] },
        { label: 'Hostel Food', permissions: ['view_mealplan'] },
        { label: 'Hostel Inventory', permissions: ['view_inventory'] },
        {
          label: 'Hostel Inventory Analytics',
          permissions: ['view_inventorytracking'],
        },
      ],
    },
    {
      label: 'Leave Management',
      icon: 'calendar-remove',
      permissions: ['view_leave'],
    },
    {
      label: '24/7 Support',
      icon: 'headset',
      permissions: ['view_support'],
    },
    {
      label: 'User Permissions',
      icon: 'shield-account',
      permissions: ['view_role'],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user?.profile_image || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>
            {user?.full_name || user?.username || 'Welcome'}
          </Text>
          <Text style={styles.roleText}>
            {user?.group?.name || 'No Role'}
          </Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ViewProfile')}
          >
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {menuItems.map(renderMenuItem)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.poweredBy}>
          Powered by: VisionariesAI Labs, V.2025.01.0001
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d3e83', paddingTop: 40 },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  nameText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  roleText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
  },
  profileButton: {
    backgroundColor: '#4455aa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeMenuItem: {
    backgroundColor: '#4455aa',
    borderRadius: 8,
  },
  menuText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  subMenuItem: {
    paddingLeft: 50,
    paddingVertical: 8,
  },
  activeSubMenuItem: {
    backgroundColor: '#3c4b9a',
    borderRadius: 8,
  },
  subMenuText: {
    color: '#ccc',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    padding: 16,
  },
  poweredBy: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CustomDrawerContent;
