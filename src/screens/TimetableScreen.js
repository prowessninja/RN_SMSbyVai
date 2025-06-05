// ✅ Updated TimetableScreen.js to show all 6 weekdays in section view as separate cards
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import { PageHeader } from '../api/common';
import { Dropdown } from 'react-native-element-dropdown';
import { fetchTeacherTimetable, fetchSections, fetchSectionTimetable } from '../api/timetableApi';
import { fetchTeachingStaffByBranch } from '../api/common';
import moment from 'moment';
import MarkStudentAttendanceModal from '../components/MarkStudentAttendanceModal';


const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const screenWidth = Dimensions.get('window').width;

const TimetableScreen = ({ navigation }) => {
  const { selectedBranch, user } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(true);
  const [selectedWeekday, setSelectedWeekday] = useState(weekdays[moment().day() - 1] || 'Monday');
  const [timetableData, setTimetableData] = useState({});
  const [sectionPeriods, setSectionPeriods] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewByTeacher, setViewByTeacher] = useState(true);
  const [markModalVisible, setMarkModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);


  useEffect(() => {
    if (!selectedBranch?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [sectionList, timetable] = await Promise.all([
          fetchSections(selectedBranch.id),
          fetchTeacherTimetable(selectedBranch.id),
        ]);
        setSections(sectionList);
        setTimetableData(timetable);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedBranch]);

  const getPeriodInfo = (teacherName, periodNumber) => {
    const entries = timetableData?.[teacherName]?.[selectedWeekday] || [];
    const match = entries.find(p => p.period_number === periodNumber);
    if (!match) return '-';
    const subj = match.subject?.name || match.department?.name || '';
    const std = match.section?.standard?.name || '';
    const sec = match.section?.name || '';
    return `${subj}\n[${std} - ${sec}]`;
  };

  const filteredTeachers = Object.keys(timetableData).filter(name =>
    name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSectionChange = async (sectionId) => {
    setLoading(true);
    try {
      const periods = await fetchSectionTimetable(selectedBranch.id, sectionId);
      setSectionPeriods(periods);
    } catch (err) {
      console.error('Error loading section timetable:', err);
    } finally {
      setLoading(false);
    }
  };


  const getSectionPeriod = (periodNumber, weekday) => {
  const list = sectionPeriods || [];
  return list.find(p => p.period_number === periodNumber && p.day === weekday) || null;
};






  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />

        <View style={styles.pageHeaderSection}>
          <PageHeader navigation={navigation} title="Staff Time Table" iconName="schedule" />
        </View>

        <View style={styles.controlsRow}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginRight: 10 }}>View By</Text>
          <Switch value={viewByTeacher} onValueChange={setViewByTeacher} />
          <Text style={{ fontSize: 14, marginLeft: 8 }}>{viewByTeacher ? 'Teacher' : 'Section'}</Text>
        </View>

        {viewByTeacher ? (
          <View style={styles.controlsRow}>
            <TextInput
              style={[styles.searchInput, { width: screenWidth * 0.45 }]}
              placeholder="Search Teacher"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Dropdown
              style={[styles.dropdown, { width: screenWidth * 0.45 }]}
              data={weekdays.map(d => ({ label: d, value: d }))}
              labelField="label"
              valueField="value"
              value={selectedWeekday}
              onChange={item => setSelectedWeekday(item.value)}
              placeholder="Select Day"
            />
          </View>
        ) : (
          <Dropdown
            style={[styles.dropdown, { width: screenWidth * 0.9, alignSelf: 'center', marginBottom: 10 }]}
            data={sections.map(s => ({ label: `${s.standard?.name} - ${s.name}`, value: s.id, sectionObj: s }))}
            labelField="label"
            valueField="value"
            value={selectedSection?.id}
            onChange={item => {
              const sectionObj = sections.find(s => s.id === item.value);
              setSelectedSection(sectionObj); // 👈 store full object
              handleSectionChange(item.value);
            }}

            placeholder="Select Section"
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#2d3e83" style={{ marginTop: 20 }} />
        ) : viewByTeacher ? (
          filteredTeachers.map(nameKey => {
            const displayName = nameKey.split(' - ').slice(1).join(' - ') || nameKey;
            return (
              <View key={nameKey} style={styles.card}>
                <Text style={styles.teacherName}>{displayName}</Text>
                <View style={styles.periodGrid}>
                  {[0, 2, 4, 6].map(startIdx => (
                    <View key={`row-${startIdx}`} style={styles.periodRow}>
                      {[0, 1].map(offset => {
                        const periodNumber = startIdx + offset + 1;
                        const info = getPeriodInfo(nameKey, periodNumber);
                        const isEmpty = info === '-';
                        return (
                          <View
                            key={`p-${periodNumber}`}
                            style={[styles.periodItem, isEmpty ? styles.emptyPeriod : styles.filledPeriod]}
                          >
                            <Text style={styles.periodLabel}>Period {periodNumber}</Text>
                            <Text style={styles.periodText}>{info}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        ) : (
          weekdays.map(weekday => (
            <View key={weekday} style={styles.card}>
              <Text style={styles.teacherName}>{weekday}</Text>
              <View style={styles.periodGrid}>
                {[0, 2, 4, 6].map(startIdx => (
                  <View key={`row-${weekday}-${startIdx}`} style={styles.periodRow}>
                    {[0, 1].map(offset => {
                      const periodNumber = startIdx + offset + 1;
                      const period = getSectionPeriod(periodNumber, weekday);
                      return (
                        <View
                          key={`section-${weekday}-p-${periodNumber}`}
                          style={[styles.periodItem, period ? styles.filledPeriod : styles.emptyPeriod]}
                        >
                          <Text style={styles.periodLabel}>Period {periodNumber}</Text>
                          {period ? (
                            <>
                              <TouchableOpacity onPress={() => {
                                setSelectedPeriod(period);
                                setMarkModalVisible(true);
                              }}>
                                <Text style={[styles.periodText, { color: '#2d3e83', textDecorationLine: 'underline' }]}>
                                  {`${period.subject?.name || period.department?.name || ''} [${period.teacher?.first_name || ''}]`}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity style={styles.scheduleBtn}><Text style={styles.scheduleBtnText}>+ Schedule</Text></TouchableOpacity>
                            </>
                          ) : (
                            <Text style={styles.periodText}>-</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {selectedPeriod && (
          <MarkStudentAttendanceModal
            visible={markModalVisible}
            onClose={() => setMarkModalVisible(false)}
            period={selectedPeriod}
            section={selectedSection}
            branchId={selectedBranch.id}
          />

        )}



      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 10 },
  pageHeaderSection: { marginBottom: 5 },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 40,
    backgroundColor: '#fff',
  },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3e83',
    marginBottom: 8,
  },
  periodGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  periodItem: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 16,
    textAlign: 'center',
  },
  filledPeriod: {
    backgroundColor: '#e3f2fd',
    borderColor: '#64b5f6',
  },
  emptyPeriod: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  scheduleBtn: {
    marginTop: 6,
    backgroundColor: '#2d3e83',
    borderRadius: 6,
    paddingVertical: 4,
  },
  scheduleBtnText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TimetableScreen;