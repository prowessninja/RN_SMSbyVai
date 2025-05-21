import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Eyecon from 'react-native-vector-icons/FontAwesome5';
import EChartsWebView from '../components/EChartsWebView';
import { getDashboardApi } from '../api/dashboardApiRouter';

const HODDashboard = ({ branch, year }) => {
  const [loading, setLoading] = useState(true);
  const [feeExpanded, setFeeExpanded] = useState(false);
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [feeData, setFeeData] = useState({
    collected: 0,
    pending: 0,
    waived: 0,
  });

  useEffect(() => {
    const loadFeeData = async () => {
      setLoading(true);
      try {
        const apiModule = getDashboardApi('HOD');
        const { fetchFeeOverview } = apiModule;
        const data = await fetchFeeOverview(branch, year);

        // Assuming data returned has { collected, pending, waived }
        setFeeData({
          collected: data.collected || 0,
          pending: data.pending || 0,
          waived: data.waived || 0,
        });
      } catch (err) {
        console.error('HODDashboard load error:', err);
        setFeeData({ collected: 0, pending: 0, waived: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadFeeData();
  }, [branch, year]);

  const feeChartOptions = {
    title: {
      text: 'Fee Overview',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: ['Collected', 'Pending', 'Waived'],
    },
    series: [
      {
        name: 'Fee',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: feeData.collected, name: 'Collected', itemStyle: { color: '#4d6dcf' } },
          { value: feeData.pending, name: 'Pending', itemStyle: { color: '#90cf6d' } },
          { value: feeData.waived, name: 'Waived', itemStyle: { color: '#f5c148' } },
        ],
      },
    ],
  };

  // Attendance chart options: simple vertical bar chart for Present and Absent
  const attendanceChartOptions = {
    title: {
      text: 'Attendance Overview',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c}%',
    },
    xAxis: {
      type: 'category',
      data: ['Present', 'Absent'],
      axisTick: { alignWithLabel: true },
      axisLine: {
        lineStyle: { color: '#888' },
      },
      axisLabel: {
        fontWeight: '600',
        fontSize: 14,
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      min: 0,
      interval: 20,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#ddd' },
      },
      axisLabel: {
        formatter: '{value} %',
        fontWeight: '600',
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Attendance',
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: 96, itemStyle: { color: '#4d6dcf' } }, // Present - blue
          { value: 4, itemStyle: { color: '#f56342' } },  // Absent - red-ish
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontWeight: '700',
          color: '#333',
        },
      },
    ],
  };

  // Dynamic current date for last updated
  const currentDate = new Date().toLocaleDateString();

  if (loading) {
    return (
      <View style={[styles.center, styles.loaderContainer]}>
        <ActivityIndicator size="large" color="#2d3e83" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: '#4d6dcf' }]}>
          <Eyecon name="users" size={28} color="#fff" />
          <Text style={styles.cardTitle}>Total Students</Text>
          <Text style={styles.cardValue}>8,500</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#66bb6a' }]}>
          <Eyecon name="chalkboard-teacher" size={28} color="#fff" />
          <Text style={styles.cardTitle}>Teaching Staff</Text>
          <Text style={styles.cardValue}>120</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#f5c148' }]}>
          <Eyecon name="user-tie" size={28} color="#fff" />
          <Text style={styles.cardTitle}>Non-Teaching</Text>
          <Text style={styles.cardValue}>45</Text>
        </View>
      </View>

      {/* Fee Overview Section */}
      <TouchableOpacity
        onPress={() => setFeeExpanded((e) => !e)}
        style={styles.inventoryHeader}
        accessibilityLabel="Toggle fee chart"
      >
        <Text style={styles.inventoryHeaderText}>Fee Overview</Text>
        <Eyecon
          name={feeExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#2d3e83"
        />
      </TouchableOpacity>

      {feeExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>This Month’s Fee Distribution</Text>
          <EChartsWebView option={feeChartOptions} />
        </View>
      )}

      {/* Attendance Overview Section */}
      <TouchableOpacity
        onPress={() => setAttendanceExpanded((e) => !e)}
        style={styles.inventoryHeader}
        accessibilityLabel="Toggle attendance chart"
      >
        <Text style={styles.inventoryHeaderText}>Attendance Overview</Text>
        <Eyecon
          name={attendanceExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#2d3e83"
        />
      </TouchableOpacity>

      {attendanceExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Last Updated: {currentDate}
          </Text>
          <EChartsWebView option={attendanceChartOptions} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    height: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  inventoryHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3e83',
  },
  chartContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardTitle: {
    marginTop: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default HODDashboard;
