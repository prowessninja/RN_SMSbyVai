import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable'; // better touchable
import Animated, { Layout, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useTheme } from '@react-navigation/native';

const AnimatedView = Animated.createAnimatedComponent(View);

const CustomDrawerContent = () => {
  const { user, permissions } = useContext(AuthContext);
  const navigation = useNavigation();
  const { colors } = useTheme(); // theme colors (for dark mode)
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);

  const groupedPermissions = useMemo(() => {
    const perms = {};
    permissions.forEach((perm) => {
      perms[perm.codename] = true;
    });
    return perms;
  }, [permissions]);

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const hasPermission = (requiredPermissions = []) =>
    requiredPermissions.some((perm) => groupedPermissions[perm]);

  const handleNavigate = (label, routeName = null) => {
    setSelectedRoute(label);
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  const renderMenuItem = (item) => {
    const isExpanded = expandedItems[item.label];
    const showItem = item.alwaysShow || hasPermission(item.permissions || []);
    if (!showItem) return null;

    return (
      <AnimatedView
        key={item.label}
        layout={Layout.springify()}
        entering={FadeInDown.delay(50)}
        exiting={FadeOutUp}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedRoute === item.label }}
          onPress={() => {
            if (item.children) toggleExpand(item.label);
            else handleNavigate(item.label, item.route || item.label);
          }}
          style={[
            styles.menuItem,
            selectedRoute === item.label && { backgroundColor: colors.primary + '33' },
          ]}
          android_ripple={{ color: colors.primary + '44' }}
        >
          <Icon name={item.icon} size={22} color={colors.text} style={{ width: 26 }} />
          <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
          {item.children && (
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text}
              style={{ marginLeft: 'auto' }}
            />
          )}
        </Pressable>

        {isExpanded &&
          item.children &&
          item.children.map((child) =>
            child.alwaysShow || hasPermission(child.permissions || []) ? (
              <Pressable
                key={child.label}
                accessibilityRole="button"
                onPress={() => handleNavigate(child.label, child.route || child.label)}
                style={[
                  styles.subMenuItem,
                  selectedRoute === child.label && { backgroundColor: colors.primary + '22' },
                ]}
                android_ripple={{ color: colors.primary + '22' }}
              >
                <Text style={[styles.subMenuText, { color: colors.text }]}>
                  {`\u2022 ${child.label}`}
                </Text>
              </Pressable>
            ) : null
          )}
      </AnimatedView>
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
        { label: 'Stationery Types', permissions: ['view_stationary'] },
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
      alwaysShow: true,
    },
    {
      label: 'User Permissions',
      icon: 'shield-account',
      permissions: ['view_role'],
    },
    {
      label: 'Locations',
      icon: 'currency-usd-off',
      alwaysShow: true,
      children: [
        {
          label: 'Branches',
          alwaysShow: true,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user?.profile_image || undefined }}
            defaultSource={require('../../assets/avatar.png')}
            style={styles.avatar}
          />
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user?.full_name || user?.username || 'Welcome'}
          </Text>
          <Text style={[styles.roleText, { color: colors.text + 'aa' }]}>
            {user?.group?.name || 'No Role'}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('ViewProfile')}
            style={({ pressed }) => [
              styles.profileButton,
              { backgroundColor: pressed ? colors.primary + 'cc' : colors.primary },
            ]}
          >
            <Text style={[styles.profileButtonText, { color: '#fff' }]}>View Profile</Text>
          </Pressable>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {menuItems.map(renderMenuItem)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.poweredBy, { color: colors.text + '88' }]}>
          Powered by: VisionariesAI Labs, V.2025.01.0001
        </Text>
      </View>
    </View>
  );
};

const styles =
StyleSheet.create({
container: { flex: 1, paddingTop: 40 },
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
fontWeight: '700',
marginTop: 10,
},
roleText: {
fontSize: 14,
marginBottom: 6,
},
profileButton: {
paddingHorizontal: 16,
paddingVertical: 6,
borderRadius: 8,
},
profileButtonText: {
fontSize: 14,
fontWeight: '600',
},
separator: {
height: 1,
marginVertical: 10,
marginHorizontal: 16,
},
menuItem: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 16,
paddingVertical: 14,
borderRadius: 8,
marginHorizontal: 10,
marginVertical: 4,
},
menuText: {
fontSize: 16,
marginLeft: 10,
},
subMenuItem: {
paddingLeft: 50,
paddingVertical: 10,
marginHorizontal: 10,
borderRadius: 6,
},
subMenuText: {
fontSize: 14,
},
footer: {
borderTopWidth: 1,
padding: 16,
alignItems: 'center',
},
poweredBy: {
fontSize: 12,
textAlign: 'center',
},
});

export default CustomDrawerContent;