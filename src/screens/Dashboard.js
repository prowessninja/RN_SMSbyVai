import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';
import { fetchBranches, fetchAcademicYears, fetchCurrentUser } from '../api/dashboard';
import HorizontalSelector from '../components/HorizontalSelector';
import InfoTile from '../components/InfoTile';
import { BarChart, PieChart } from 'react-native-chart-kit';

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
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting Section */}
      <View style={styles.sectionGreeting}>
        <Text style={styles.greeting}>{getTimeGreeting()}, {user?.first_name || 'User'}!</Text>
        <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>
        <LottieView source={getAnimation()} autoPlay loop style={styles.animation} />
      </View>

      {/* Branch & Year Selection */}
      <View style={styles.sectionSelector}>
        <Text style={styles.label}>Select Branch</Text>
        <HorizontalSelector
          items={branches}
          selectedId={selectedBranch}
          onSelect={(b) => setSelectedBranch(b.id)}
        />
        <Text style={styles.label}>Select Academic Year</Text>
        <HorizontalSelector
          items={years}
          selectedId={selectedYear}
          onSelect={(y) => setSelectedYear(y.id)}
        />
      </View>

      {/* Info Tiles */}
      <View style={styles.sectionTiles}>
        <InfoTile title="Total Students" value="480" />
        <InfoTile title="Teaching Staff" value="40" />
        <InfoTile title="Non-Teaching" value="25" />
      </View>

      {/* Attendance Bar Graph */}
      <View style={styles.sectionChart}>
        <Text style={styles.chartLabel}>Attendance (This Week)</Text>
        <BarChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ data: [80, 75, 90, 70, 85, 95, 60] }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfigBlue}
          verticalLabelRotation={0}
          style={styles.chartStyle}
        />
      </View>

      {/* Fee Pie Chart */}
      <View style={styles.sectionChartAlt}>
        <Text style={styles.chartLabel}>Fee Status</Text>
        <PieChart
          data={[
            { name: 'Collected', population: 500000, color: '#4CAF50', legendFontColor: '#000', legendFontSize: 14 },
            { name: 'Pending', population: 200000, color: '#FFC107', legendFontColor: '#000', legendFontSize: 14 },
            { name: 'Waived', population: 100000, color: '#F44336', legendFontColor: '#000', legendFontSize: 14 },
          ]}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfigGray}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Expenditures Bar Chart */}
      <View style={styles.sectionChart}>
        <Text style={styles.chartLabel}>School Expenditures</Text>
        <BarChart
          data={{
            labels: ['Infra', 'Salaries', 'Transport', 'Events', 'Others'],
            datasets: [{ data: [150, 300, 120, 80, 100] }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfigOrange}
          verticalLabelRotation={15}
          style={styles.chartStyle}
        />
      </View>
    </ScrollView>
  );
};

const chartConfigBlue = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#AAeafe',
  backgroundGradientTo: '#bfdbfe',
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  strokeWidth: 2,
};

const chartConfigOrange = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#ffe0b2',
  backgroundGradientTo: '#ffcc80',
  color: (opacity = 1) => `rgba(5, 87, 34, ${opacity})`,
  strokeWidth: 2,
};

const chartConfigGray = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#f0f0f0',
  backgroundGradientTo: '#f0f0f0',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FB',
  },
  sectionGreeting: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#E0F7FA',
    padding: 15,
    borderRadius: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  animation: {
    height: 120,
    width: 120,
  },
  sectionSelector: {
    marginBottom: 20,
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionTiles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
  },
  sectionChart: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionChartAlt: {
    backgroundColor: '#CCFDE7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  chartStyle: {
    borderRadius: 12,
  },
});

export default Dashboard;
