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

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [performanceExpanded, setPerformanceExpanded] = useState(false);
  const [classesExpanded, setClassesExpanded] = useState(false);

  const attendanceStats = {
    'Class 6A': 95,
    'Class 9B': 88,
    'Class 8C': 92,
  };

  const performanceStats = {
    subjects: ['Math', 'Physics', 'Chemistry'],
    averages: [82, 76, 89],
  };

  const assignedClasses = [
    { class: 'Class 6', section: 'A', students: 30 },
    { class: 'Class 8', section: 'C', students: 28 },
    { class: 'Class 9', section: 'B', students: 32 },
  ];

  const colorPalette = ['#4d6dcf', '#f5c148', '#66bb6a', '#e57373', '#ba68c8'];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const attendanceChartOptions = {
    title: {
      text: 'Class Attendance (%)',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: Object.keys(attendanceStats),
      axisLabel: { fontWeight: '600', fontSize: 14 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [{
      data: Object.values(attendanceStats).map((value, index) => ({
        value,
        itemStyle: { color: colorPalette[index % colorPalette.length] },
      })),
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

  const performanceChartOptions = {
    title: {
      text: 'Subject Performance',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {},
    radar: {
      indicator: performanceStats.subjects.map(sub => ({ name: sub, max: 100 })),
      radius: 100,
    },
    series: [{
      type: 'radar',
      data: [{
        value: performanceStats.averages,
        name: 'Average Marks',
        areaStyle: { opacity: 0.4 },
        itemStyle: { color: '#03a9f4' },
        lineStyle: { color: '#0288d1' },
        label: { show: true }
      }],
    }],
  };

  const classesChartOptions = {
    title: {
      text: 'Assigned Classes',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} students',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: assignedClasses.map(item => `${item.class} - ${item.section}`),
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      data: assignedClasses.map((item, index) => ({
        value: item.students,
        name: `${item.class} - ${item.section}`,
        itemStyle: { color: colorPalette[index % colorPalette.length] },
      })),
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
      {/* Attendance Overview */}
      <TouchableOpacity
        onPress={() => setAttendanceExpanded(prev => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Class Attendance</Text>
        <Eyecon name={attendanceExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {attendanceExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Last Updated: {currentDate}</Text>
          <EChartsWebView option={attendanceChartOptions} />
        </View>
      )}

      {/* Subject Performance */}
      <TouchableOpacity
        onPress={() => setPerformanceExpanded(prev => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        <Eyecon name={performanceExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {performanceExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Avg. Marks by Subject</Text>
          <EChartsWebView option={performanceChartOptions} />
        </View>
      )}

      {/* Assigned Classes */}
      <TouchableOpacity
        onPress={() => setClassesExpanded(prev => !prev)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>Assigned Classes</Text>
        <Eyecon name={classesExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
      </TouchableOpacity>
      {classesExpanded && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Students per Class</Text>
          <EChartsWebView option={classesChartOptions} />
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

export default TeacherDashboard;
