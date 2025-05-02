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

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.greeting}>Hi, {user?.first_name || 'User'}</Text>
        <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>
        <LottieView source={require('../../assets/lottie/morning.json')} autoPlay loop style={styles.animation} />
      </View>

      <View style={styles.sectionSelector}>
        <Text style={styles.label}>Select Branch</Text>
        <HorizontalSelector items={branches} selectedId={selectedBranch} onSelect={(b) => setSelectedBranch(b.id)} />
        <Text style={styles.label}>Select Academic Year</Text>
        <HorizontalSelector items={years} selectedId={selectedYear} onSelect={(y) => setSelectedYear(y.id)} />
      </View>

      <View style={styles.sectionTiles}>
        <InfoTile title="Total Students" value="480" icon="account-group" backgroundColor="#6A1B9A" />
        <InfoTile title="Teaching Staff" value="40" icon="school" backgroundColor="#0277BD" />
        <InfoTile title="Non-Teaching" value="25" icon="briefcase" backgroundColor="#2E7D32" />
      </View>

      {/* Attendance Bar Chart */}
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

      {/* Fee Status Pie Chart with Labels */}
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

      {/* Expenditures Bar Chart */}
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

      {/* Monthly Revenue Area Chart with Labels */}
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
    borderRadius: 16,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  sectionTiles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  chartBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 15,
  },
  chartLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333', textAlign: 'center' },
});

export default Dashboard;
