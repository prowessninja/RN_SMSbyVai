// ClassAttendanceScreen with sticky ID/Name header and row cells
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import { PageHeader } from '../api/common';
import { Dropdown } from 'react-native-element-dropdown';
import CommonAPI from '../api/common';
import { fetchSectionAttendanceReport } from '../api/attendanceApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { fetchStudentDayAttendance } from '../api/attendanceApi';

const months = [...Array(12).keys()].map(i => ({ id: i + 1, name: moment().month(i).format('MMM') }));
const COLUMN_WIDTH = 43;

const ClassAttendanceScreen = ({ navigation }) => {
  const { user, selectedAcademicYear, selectedBranch } = useContext(AuthContext);
  const [standards, setStandards] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [academicYearDates, setAcademicYearDates] = useState({ start: null, end: null });
  const [offsetDays, setOffsetDays] = useState(0);
  const [showProfile, setShowProfile] = useState(true);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryStudent, setSummaryStudent] = useState(null);



  useEffect(() => {
    const fetchAcademicDates = async () => {
      try {
        const response = await CommonAPI.fetchAcademicYears();
        const selected = response.data?.results?.find(y => y.id === selectedAcademicYear?.id);
        if (selected) {
          setAcademicYearDates({
            start: moment(selected.start_date),
            end: moment(selected.end_date),
          });
        }
      } catch (e) {
        console.error('Failed to fetch academic years:', e);
      }
    };
    fetchAcademicDates();
  }, [selectedAcademicYear]);

  useEffect(() => {
    const loadStandards = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const data = await CommonAPI.fetchStandardsForYearBranch(
          selectedAcademicYear.id,
          selectedBranch.id,
          token
        );
        setStandards(data.results.map(std => ({ label: std.name, value: std.id })));
      } catch (e) {
        console.error('Failed to fetch standards:', e);
      }
    };
    if (selectedAcademicYear && selectedBranch) loadStandards();
  }, [selectedAcademicYear, selectedBranch]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await CommonAPI.fetchSectionsByBranchAndStandard(
          selectedBranch.id,
          selectedStandard
        );
        setSections(data.results.map(sec => ({ label: sec.name, value: sec.id })));
      } catch (e) {
        console.error('Failed to fetch sections:', e);
      }
    };
    if (selectedStandard) loadSections();
  }, [selectedStandard]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedSection || !academicYearDates.start || !academicYearDates.end) return;
      setLoading(true);
      try {
        const data = await fetchSectionAttendanceReport({
          sectionId: selectedSection,
          academicYearId: selectedAcademicYear.id,
          year: moment().year(),
          month: selectedMonth,
        });

        const map = {};
        const allDates = Object.keys(data || {});

        allDates.forEach(date => {
          const entries = Object.values(data[date])[0];
          Object.entries(entries || {}).forEach(([id, value]) => {
            const [name, status] = value.split(' - ');
            if (!map[id]) map[id] = { id, name, statusByDate: {} };
            map[id].statusByDate[date] = status;
          });
        });
        const filtered = Object.values(map).filter(
          s => s.name && /[a-zA-Z]/.test(s.name)
        );
        setAttendanceData(filtered);

      } catch (e) {
        console.error('Error fetching attendance:', e);
      }
      setLoading(false);
    };
    loadAttendance();
  }, [selectedSection, selectedMonth]);

  useEffect(() => {
    if (!academicYearDates.start || !academicYearDates.end) return;
    const ref = moment().subtract(offsetDays, 'days');
    const range = [...Array(7)].map((_, i) => ref.clone().subtract(6 - i, 'days'));
    setDates(range);
  }, [offsetDays, academicYearDates]);

  const goPrevWeek = () => {
    const first = dates[0];
    if (first && academicYearDates.start && first.isAfter(academicYearDates.start, 'day')) {
      setOffsetDays(offsetDays + 7);
    }
  };

  const goNextWeek = () => {
    const last = dates[dates.length - 1];
    if (last && last.isBefore(moment(), 'day')) {
      setOffsetDays(Math.max(offsetDays - 7, 0));
    }
  };

  const handleCellPress = async (student, date) => {
    try {
      console.log('👆 Cell pressed for student:', student);
      const result = await fetchStudentDayAttendance({
        admissionNumber: student.id, // Or student.admission_number if available
        sectionId: selectedSection,
        academicYearId: selectedAcademicYear.id,
        date: date.format('YYYY-MM-DD'),
      });
      console.log('📊 Summary:', result);
      setSummaryData(result);
      setSummaryStudent(student); // Add this line
      setSummaryModalVisible(true);

    } catch (e) {
      console.error('❌ Failed to fetch summary:', e);
    }
  };


  const isPrevDisabled = dates.length > 0 && dates[0].isSameOrBefore(academicYearDates.start, 'day');
  const isNextDisabled = dates.length > 0 && dates[dates.length - 1].isSameOrAfter(moment(), 'day');

  const exportToExcel = async () => {
    const wsData = [
      ['ID / Name', ...dates.map(date => date.format('D MMM'))],
      ...attendanceData.map(s => [
        `${s.id} - ${s.name}`,
        ...dates.map(d => s.statusByDate[d.format('YYYY-MM-DD')] || '--')
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
    const path = RNFS.DownloadDirectoryPath + `/attendance_${Date.now()}.xlsx`;
    await RNFS.writeFile(path, wbout, 'ascii');
    await Share.open({ url: `file://${path}` });
  };

  const renderHeader = () => (
    <View style={styles.stickyRow}>
      <View style={styles.stickyHeader}><Text style={styles.headerText}>ID / Name</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.flexRow}>
          {dates.map(date => (
            <View key={`header-${date.format('YYYY-MM-DD')}`} style={styles.dateHeader}>
              <Text style={styles.dateText}>{date.format('D MMM')}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderRow = (item) => (
    <View key={`row-${item.id}`} style={styles.rowWrapper}>
      <View style={styles.stickyCol}>
        <Text style={styles.idTextLight}>{item.id}</Text>
        <Text style={styles.nameTextLight}>{item.name}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.flexRow}>
          {dates.map(date => {
            const status = item.statusByDate[date.format('YYYY-MM-DD')] || '--';
            const color = status === 'P' ? '#3BB273' : status === 'A' ? '#E03C32' : '#ccc';
            return (
              <TouchableOpacity
                key={`cell-${item.id}-${date.format('YYYY-MM-DD')}`}
                onPress={() => handleCellPress(item, date)}
                style={[styles.statusCell, { backgroundColor: color }]}
              >
                <Text style={styles.statusText}>{status}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );


  return (
    <View style={styles.container}>
      <ScrollView>
        <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />

        <PageHeader navigation={navigation} title="Class Attendance" iconName="fact-check" />

        <View style={styles.dropdownRow}>
          <Dropdown style={[styles.dropdown, { width: '40%' }]} data={standards} labelField="label" valueField="value" placeholder="Standard" value={selectedStandard} onChange={item => setSelectedStandard(item.value)} />
          <Dropdown style={[styles.dropdown, { width: '40%' }]} data={sections} labelField="label" valueField="value" placeholder="Section" value={selectedSection} onChange={item => setSelectedSection(item.value)} />
          <Dropdown style={[styles.dropdown, { width: '20%' }]} data={months.map(m => ({ label: m.name, value: m.id }))} labelField="label" valueField="value" placeholder="Month" value={selectedMonth} onChange={item => setSelectedMonth(item.value)} />
        </View>

        <View style={styles.navigationRow}>
          <TouchableOpacity disabled={isPrevDisabled} onPress={goPrevWeek}><Text style={[styles.navArrow, isPrevDisabled && styles.disabledArrow]}>{'← Previous'}</Text></TouchableOpacity>
          <TouchableOpacity disabled={isNextDisabled} onPress={goNextWeek}><Text style={[styles.navArrow, isNextDisabled && styles.disabledArrow]}>{'Next →'}</Text></TouchableOpacity>
        </View>

        {renderHeader()}
        {loading ? <ActivityIndicator size="large" color="#2d3e83" /> : attendanceData.map(renderRow)}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={exportToExcel}>
        <Text style={styles.floatingText}>⬇ XLSX</Text>
      </TouchableOpacity>

      {summaryModalVisible && summaryData && (
        <View style={styles.modalOverlay}>
          <View style={styles.summaryModal}>
            <Text style={styles.modalTitle}>🧾 Attendance Summary</Text>

            <Text style={styles.modalText}>
              👤 {summaryStudent?.name} ({summaryStudent?.id})
            </Text>

            <View style={{ marginTop: 10 }}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.headerCell]}>Subject</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Status</Text>
              </View>
              {Object.entries(summaryData).map(([subject, status], idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{subject}</Text>
                  <Text style={[
                    styles.tableCell,
                    { color: status === 'P' ? '#3BB273' : status === 'A' ? '#E03C32' : '#444' }
                  ]}>
                    {status}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setSummaryModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


    </View>


  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 10 },
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dropdown: { height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 10, backgroundColor: '#fff' },
  navigationRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  navArrow: { fontSize: 14, color: '#2d3e83', fontWeight: 'bold' },
  disabledArrow: { color: '#999' },
  stickyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  flexRow: { flexDirection: 'row' },
  stickyHeader: { width: 100, backgroundColor: '#2d3e83', padding: 5, justifyContent: 'center', alignItems: 'center' },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  dateHeader: { width: COLUMN_WIDTH, backgroundColor: '#2d3e83', justifyContent: 'center', alignItems: 'center', padding: 5 },
  dateText: { color: '#fff', fontSize: 11 },
  rowWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
  stickyCol: { width: 100, backgroundColor: '#2d3e83', padding: 4, justifyContent: 'center' },
  idTextLight: { fontSize: 11, fontWeight: '600', color: '#fff' },
  nameTextLight: { fontSize: 11, color: '#cfd8e3' },
  statusCell: { width: COLUMN_WIDTH, height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  floatingButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2d3e83', borderRadius: 30, paddingVertical: 10, paddingHorizontal: 20, elevation: 4 },
  floatingText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  summaryModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d3e83',
  },
  modalText: {
    fontSize: 13,
    marginBottom: 5,
    color: '#333',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#2d3e83',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#2d3e83',
  }


});

export default ClassAttendanceScreen;
