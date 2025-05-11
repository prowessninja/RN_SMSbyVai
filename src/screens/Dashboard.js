import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { Dimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import InfoTile from '../components/InfoTile';
import { BarChart, PieChart, AreaChart, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SVGText } from 'react-native-svg';
import * as shape from 'd3-shape';
import { Dropdown } from 'react-native-element-dropdown'; // ✅ updated import

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const { user, branches, academicYears, permissions } = useContext(AuthContext);
  const [selectedBranch, setSelectedBranch] = useState(branches?.[0]?.id);
  const [selectedYear, setSelectedYear] = useState(academicYears?.[0]?.id);
  const [loading, setLoading] = useState(true);

  const dashboardContent = {
    "Organisation Admin": {
      tiles: [
        { title: 'Total Students', value: '480', icon: 'account-group', bg: '#6A1B9A' },
        { title: 'Teaching Staff', value: '40', icon: 'school', bg: '#0277BD' },
        { title: 'Non-Teaching', value: '25', icon: 'briefcase', bg: '#2E7D32' },
        { title: 'Total Revenue', value: '₹5,000,000', icon: 'currency-inr', bg: '#FF9800' },
      ],
      charts: ['attendance', 'fee', 'expenditure', 'revenue'],
    },
    Teacher: {
      tiles: [
        { title: 'My Classes', value: '5', icon: 'chalkboard-teacher', bg: '#6A1B9A' },
        { title: 'Upcoming Exams', value: '3', icon: 'file-certificate', bg: '#0277BD' },
        { title: 'My Students', value: '120', icon: 'user-graduate', bg: '#8BC34A' },
      ],
      charts: ['attendance', 'fee'],
    },
    Student: {
      tiles: [
        { title: 'My Attendance', value: '92%', icon: 'calendar-check', bg: '#6A1B9A' },
        { title: 'Pending Fees', value: '₹5,000', icon: 'wallet', bg: '#0277BD' },
        { title: 'Upcoming Exams', value: '2', icon: 'file-certificate', bg: '#FF5722' },
      ],
      charts: ['attendance'],
    },
    Drivers: {
      tiles: [
        { title: 'Active Rides', value: '15', icon: 'car', bg: '#673AB7' },
        { title: 'Pending Rides', value: '3', icon: 'car-side', bg: '#FFC107' },
      ],
      charts: ['attendance'],
    },
    'Head of Department': {
      tiles: [
        { title: 'Total Staff', value: '20', icon: 'users', bg: '#3F51B5' },
        { title: 'Total Students', value: '300', icon: 'user-graduate', bg: '#009688' },
        { title: 'Pending Requests', value: '8', icon: 'clipboard-list', bg: '#FF5722' },
      ],
      charts: ['expenditure', 'revenue'],
    },
    'Branch Admin': {
      tiles: [
        { title: 'Branch Performance', value: '80%', icon: 'store', bg: '#9C27B0' },
        { title: 'Branch Staff', value: '30', icon: 'users', bg: '#607D8B' },
      ],
      charts: ['attendance', 'expenditure'],
    },
  };

  const role = user?.group?.name || 'Default';
  const content = dashboardContent[role] || { tiles: [], charts: [] };

  useEffect(() => {
    setLoading(false);
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAnimation = () => {
    return require('../../assets/default.json');
  };

  const handleAcademicYearChange = (value) => {
    setSelectedYear(value);
  };

  const attendanceData = [80, 75, 90, 70, 85, 95, 60];
  const feeData = [
    { key: 1, value: 500000, svg: { fill: '#4CAF50' }, label: '80% Collected' },
    { key: 2, value: 200000, svg: { fill: '#FFC107' }, label: '15% Pending' },
    { key: 3, value: 100000, svg: { fill: '#F44336' }, label: '5% Waived' },
  ];
  const expenditureData = [15020, 31000, 12321, 8875, 10645];
  const revenueData = [200000, 250000, 180000, 350000, 222000, 450000, 50000, 550000, 260000, 65000, 370000, 75000];

  const Labels = ({ x, y, bandwidth, data }) =>
    data.map((value, index) => (
      <SVGText key={index} x={x(index) + bandwidth / 2} y={y(value) - 10} fontSize={12} fill="black" textAnchor="middle">
        {value}
      </SVGText>
    ));

  const PieLabels = ({ slices }) =>
    slices.map((slice, index) => {
      const { pieCentroid, data } = slice;
      return (
        <SVGText
          key={index}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill="blue"
          fontSize={16}
          stroke="white"
          strokeWidth={0.2}
          textAnchor="middle"
        >
          {data.label}
        </SVGText>
      );
    });

  const AreaLabels = ({ x, y, data }) =>
    data.map((value, index) => (
      <G key={index}>
        <Circle cx={x(index)} cy={y(value)} r={4} stroke={'#2196F3'} fill={'white'} />
        <SVGText x={x(index)} y={y(value) - 10} fontSize={10} fill={'black'} textAnchor={'middle'}>
          {Math.round(value / 1000)}k
        </SVGText>
      </G>
    ));

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2d3e83" />
      </View>
    );
  }

  return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionGreeting}>
        {user?.profile_image ? (
          <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
        ) : (
          <LottieView source={getAnimation()} autoPlay loop style={styles.animation} />
        )}
        <Text style={styles.greeting}>{getTimeGreeting()}, {user?.first_name || 'User'}</Text>
        <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>

        <View style={styles.dropdownRow}>
          <Dropdown
            style={styles.dropdown}
            data={academicYears.map(year => ({ label: year.name, value: year.id }))}
            labelField="label"
            valueField="value"
            value={selectedYear}
            placeholder="Academic Year"
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            onChange={(item) => handleAcademicYearChange(item.value)}
          />
          <Dropdown
            style={styles.dropdown}
            data={branches.map(branch => ({ label: branch.name, value: branch.id }))}
            labelField="label"
            valueField="value"
            value={selectedBranch}
            placeholder="Branch"
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            onChange={(item) => setSelectedBranch(item.value)}
          />
        </View>
      </View>

      {content.tiles.length > 0 && (
        <View style={styles.sectionTiles}>
          {content.tiles.map((tile, idx) => (
            <InfoTile key={idx} title={tile.title} value={tile.value} icon={tile.icon} backgroundColor={tile.bg} />
          ))}
        </View>
      )}

      {content.charts.includes('attendance') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Attendance %</Text>
          <BarChart style={{ height: 200 }} data={attendanceData} svg={{ fill: '#43A047' }} contentInset={{ top: 20, bottom: 20 }}>
            <Grid />
            <Labels />
          </BarChart>
        </View>
      )}

      {content.charts.includes('fee') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Fee Status</Text>
          <PieChart style={{ height: 200 }} data={feeData} innerRadius={40} outerRadius={80} labelRadius={110}>
            <PieLabels />
          </PieChart>
        </View>
      )}

      {content.charts.includes('expenditure') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Expenditures</Text>
          <BarChart style={{ height: 200 }} data={expenditureData} svg={{ fill: '#2196F3' }} contentInset={{ top: 20, bottom: 20 }}>
            <Grid />
            <Labels />
          </BarChart>
        </View>
      )}

      {content.charts.includes('revenue') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Monthly Revenue</Text>
          <AreaChart
            style={{ height: 200 }}
            data={revenueData}
            svg={{ fill: 'rgba(8, 135, 76, 0.93)', stroke: '#2196F3' }}
            contentInset={{ top: 20, bottom: 20 }}
            curve={shape.curveNatural}
          >
            <Grid />
            <AreaLabels />
          </AreaChart>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#FAFAFA' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionGreeting: {
    alignItems: 'center',
    marginBottom: 15,
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
  animation: { height: 80, width: 80, marginBottom: 10 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  role: { fontSize: 14, color: '#fff', marginBottom: 10 },
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
  sectionTiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartBox: { marginBottom: 20 },
  chartLabel: { fontSize: 16, marginBottom: 10, fontWeight: '600', color: '#333' },
});

export default Dashboard;
