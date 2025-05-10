import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchBranches, fetchAcademicYears, fetchCurrentUser } from '../api/dashboard';
import HorizontalSelector from '../components/HorizontalSelector';
import InfoTile from '../components/InfoTile';
import { BarChart, PieChart, AreaChart, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SVGText } from 'react-native-svg';
import * as shape from 'd3-shape';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
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
    const loadInitialData = async () => {
      try {
        const [userData, branchData, yearData] = await Promise.all([
          fetchCurrentUser(token),
          fetchBranches(token),
          fetchAcademicYears(token),
        ]);
        setUser(userData);
        setBranches(branchData.results);
        setYears(yearData.results);
        setSelectedBranch(branchData.results[0]?.id);
        setSelectedYear(yearData.results[0]?.id);
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [token]);

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
      <SVGText
        key={index}
        x={x(index) + bandwidth / 2}
        y={y(value) - 10}
        fontSize={12}
        fill="black"
        alignmentBaseline="middle"
        textAnchor="middle"
      >
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
          textAnchor={'middle'}
          alignmentBaseline={'middle'}
          fontSize={16}
          stroke="white"
          strokeWidth={0.2}
        >
          {data.label}
        </SVGText>
      );
    });

  const AreaLabels = ({ x, y, data }) =>
    data.map((value, index) => (
      <G key={index}>
        <Circle cx={x(index)} cy={y(value)} r={4} stroke={'#2196F3'} fill={'white'} />
        <SVGText
          x={x(index)}
          y={y(value) - 10}
          fontSize={10}
          fill={'black'}
          alignmentBaseline={'middle'}
          textAnchor={'middle'}
        >
          {Math.round(value / 1000)}k
        </SVGText>
      </G>
    ));

  // ✅ Time-based greeting and Lottie selection
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAnimation = () => {
    const hour = new Date().getHours();
    if (hour < 12) return require('../../assets/lottie/morning.json');
    if (hour < 17) return require('../../assets/lottie/afternoon.json');
    return require('../../assets/lottie/evening.json');
  };

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
        <Text style={styles.greeting}>{getTimeGreeting()}, {user?.first_name || 'User'}</Text>
        <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>
        <LottieView source={getAnimation()} autoPlay loop style={styles.animation} />
      </View>

      <View style={styles.sectionSelector}>
        <Text style={styles.label}>Select Branch</Text>
        <HorizontalSelector items={branches} selectedId={selectedBranch} onSelect={(b) => setSelectedBranch(b.id)} />
        <Text style={styles.label}>Select Academic Year</Text>
        <HorizontalSelector items={years} selectedId={selectedYear} onSelect={(y) => setSelectedYear(y.id)} />
      </View>

      {content.tiles.length > 0 && (
        <View style={styles.sectionTiles}>
          {content.tiles.map((tile, idx) => (
            <InfoTile
              key={idx}
              title={tile.title}
              value={tile.value}
              icon={tile.icon}
              backgroundColor={tile.bg}
            />
          ))}
        </View>
      )}

      {content.charts.includes('attendance') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Attendance %</Text>
          <BarChart
            style={{ height: 200 }}
            data={attendanceData}
            svg={{ fill: '#43A047' }}
            contentInset={{ top: 20, bottom: 20 }}
          >
            <Grid />
            <Labels />
          </BarChart>
        </View>
      )}

      {content.charts.includes('fee') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Fee Status</Text>
          <PieChart
            style={{ height: 200 }}
            data={feeData}
            innerRadius={40}
            outerRadius={80}
            labelRadius={110}
          >
            <PieLabels />
          </PieChart>
        </View>
      )}

      {content.charts.includes('expenditure') && (
        <View style={styles.chartBox}>
          <Text style={styles.chartLabel}>Expenditures</Text>
          <BarChart
            style={{ height: 200 }}
            data={expenditureData}
            svg={{ fill: '#2196F3' }}
            contentInset={{ top: 20, bottom: 20 }}
          >
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
    backgroundColor: '#E1F5FE',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#333' },
  role: { fontSize: 14, color: '#555', marginBottom: 10 },
  animation: { height: 80, width: 80 },
  sectionSelector: {
    marginBottom: 15,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 16, marginBottom: 8, color: '#555' },
  sectionTiles: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  chartBox: { marginBottom: 20 },
  chartLabel: { fontSize: 16, marginBottom: 10, fontWeight: '600', color: '#333' },
});

export default Dashboard;
