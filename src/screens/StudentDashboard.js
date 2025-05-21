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

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [marksExpanded, setMarksExpanded] = useState(false);
  const [feeExpanded, setFeeExpanded] = useState(false);

  // Simulated/fetched data
  const attendanceData = {
    present: 91,
    absent: 9,
  };

  const marksData = {
    subjects: ['Math', 'Physics', 'Chemistry', 'English', 'Computer'],
    scores: [88, 75, 92, 85, 80],
  };

  const feeData = {
    paid: 40000,
    pending: 10000,
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate loading
  }, []);

  const attendanceChartOptions = {
    title: {
      text: 'Attendance Overview',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: ['Present', 'Absent'],
      axisLabel: { fontWeight: '600', fontSize: 14 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [{
      data: [
        { value: attendanceData.present, itemStyle: { color: '#4d6dcf' } },
        { value: attendanceData.absent, itemStyle: { color: '#f56342' } },
      ],
      type: 'bar',
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontWeight: 'bold',
      },
    }],
  };

  const marksChartOptions = {
    title: {
      text: 'Marks Overview',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {},
    radar: {
      indicator: marksData.subjects.map((sub) => ({ name: sub, max: 100 })),
      radius: 100,
    },
    series: [{
      name: 'Marks',
      type: 'radar',
      data: [{
        value: marksData.scores,
        name: 'Scores',
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#4d6dcf' },
      }],
    }],
  };

  const feeChartOptions = {
    title: {
      text: 'Fee Overview',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: ['Paid', 'Pending'],
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      data: [
        { value: feeData.paid, name: 'Paid', itemStyle: { color: '#66bb6a' } },
        { value: feeData.pending, name: 'Pending', itemStyle: { color: '#f5c148' } },
      ],
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold',
        },
      },
    }],
  };

  const currentDate = new Date().toLocaleDateString();

  if (loading) {
    return (
      <View style={[styles.center, styles.loaderContainer]}>
        <ActivityIndicator size="large" color="#2d3e83" />
      </View>
    );
  }

  return (
    <View style={{ padding: 10 }}>
      {/* Attendance */}
      <TouchableOpacity
        onPress={() => setAttendanceExpanded((prev) => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Attendance Overview</Text>
        <Eyecon name={attendanceExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {attendanceExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Last Updated: {currentDate}</Text>
          <EChartsWebView option={attendanceChartOptions} />
        </View>
      )}

      {/* Marks */}
      <TouchableOpacity
        onPress={() => setMarksExpanded((prev) => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Marks Overview</Text>
        <Eyecon name={marksExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {marksExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Subject-wise Performance</Text>
          <EChartsWebView option={marksChartOptions} />
        </View>
      )}

      {/* Fee */}
      <TouchableOpacity
        onPress={() => setFeeExpanded((prev) => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Fee Overview</Text>
        <Eyecon name={feeExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {feeExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Your Fee Distribution</Text>
          <EChartsWebView option={feeChartOptions} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    height: 150,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  sectionTitle: {
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
});

export default StudentDashboard;
