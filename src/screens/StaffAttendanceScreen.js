import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import { PageHeader } from '../api/common';
import CommonAPI from '../api/common';
import { Dropdown } from 'react-native-element-dropdown';
import moment from 'moment';
import { fetchTeacherAttendanceReport as fetchStaffAttendanceReport } from '../api/attendanceApi';
import Icon from 'react-native-vector-icons/Ionicons';
import { Modal, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchAllStaffUsers, markStaffAttendance } from '../api/attendanceApi';


const months = [...Array(12).keys()].map(i => ({
    id: i + 1,
    name: moment().month(i).format('MMM'),
}));
const COLUMN_WIDTH = 38;

const StaffAttendanceScreen = ({ navigation }) => {
    const { user, selectedBranch, selectedAcademicYear } = useContext(AuthContext);

    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
    const [attendanceData, setAttendanceData] = useState({});
    const [staffList, setStaffList] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [academicYearDates, setAcademicYearDates] = useState({ start: null, end: null });
    const [offsetDays, setOffsetDays] = useState(0);
    const [showProfile, setShowProfile] = useState(true);
    const [markModalVisible, setMarkModalVisible] = useState(false);
    const [markingStatus, setMarkingStatus] = useState('Present');
    const [selectedUser, setSelectedUser] = useState(null);
    const [staffOptions, setStaffOptions] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);




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

    // Define the loadAttendance function outside the useEffect so it can be reused
    const loadAttendance = async () => {
        if (!selectedBranch?.id) return;
        setLoading(true);
        try {
            const raw = await fetchStaffAttendanceReport(selectedBranch.id);
            setAttendanceData(raw);

            const allDates = Object.keys(raw || {}).filter(
                d => moment(d).month() + 1 === selectedMonth
            );

            const allStaff = new Set();
            allDates.forEach(date => {
                Object.keys(raw[date] || {}).forEach(staffKey => allStaff.add(staffKey));
            });
            setStaffList(Array.from(allStaff));
        } catch (e) {
            console.error('Failed to load staff attendance:', e);
        } finally {
            setLoading(false);
        }
    };

    // Call it via useEffect when dependencies change
    useEffect(() => {
        loadAttendance();
    }, [selectedMonth, selectedBranch]);


    useEffect(() => {
        if (!academicYearDates.start || !academicYearDates.end) return;
        const ref = moment().subtract(offsetDays, 'days');
        const range = [...Array(7)].map((_, i) => ref.clone().subtract(6 - i, 'days'));
        setDates(range);
    }, [offsetDays, academicYearDates]);

    useEffect(() => {
        if (markModalVisible && selectedBranch?.id && selectedAcademicYear?.id) {
            fetchAllStaffUsers(selectedBranch.id, selectedAcademicYear.id)
                .then(res => {
                    const options = res?.results?.map(user => ({
                        label: `${user.first_name || ''} ${user.last_name || ''} (${user.employee_id || 'N/A'})`,
                        value: user.id,
                    })) || [];
                    setStaffOptions(options);
                })
                .catch(err => console.error('Error loading users:', err));
        }
    }, [markModalVisible]);


    const handleMarkAttendance = async () => {
        if (!selectedUser || !markingStatus || !attendanceDate) return;

        setIsSubmitting(true);
        try {
            const payload = {
                status: markingStatus,
                user_id: selectedUser,
                attendance_date: moment(attendanceDate).format('YYYY-MM-DD'),
            };
            await markStaffAttendance(payload);

            setMarkModalVisible(false);
            setShowSuccessOverlay(true);
            await loadAttendance(); // ✅ Refresh data
            setTimeout(() => setShowSuccessOverlay(false), 2000);
        } catch (err) {
            console.error('Marking attendance failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };




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

    const isPrevDisabled = dates.length > 0 && dates[0].isSameOrBefore(academicYearDates.start, 'day');
    const isNextDisabled = dates.length > 0 && dates[dates.length - 1].isSameOrAfter(moment(), 'day');

    const renderHeader = () => (
        <View style={styles.stickyRow}>
            <View style={styles.stickyHeader}>
                <Text style={styles.headerText}>Emp ID / Name</Text>
            </View>
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

    const renderRow = (empKey) => (
        <View key={empKey} style={styles.rowWrapper}>
            <View style={styles.stickyCol}>
                <Text style={styles.idTextLight}>{empKey}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.flexRow}>
                    {dates.map(date => {
                        const dateStr = date.format('YYYY-MM-DD');
                        const status = attendanceData[dateStr]?.[empKey] || '--';
                        const pill = status === 'Present' ? 'P' : status === 'Absent' ? 'A' : '--';
                        const color = pill === 'P' ? '#3BB273' : pill === 'A' ? '#E03C32' : '#ccc';
                        return (
                            <View key={`${empKey}-${dateStr}`} style={[styles.statusCell, { backgroundColor: color }]}>
                                <Text style={styles.statusText}>{pill}</Text>
                            </View>
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


                {/* Header with navigation and title */}
                <View style={styles.pageHeaderSection}>
                    <PageHeader navigation={navigation} title="Staff Attendance" iconName="people" />
                </View>

                {/* Month dropdown (left) and Mark button (right) */}
                <View style={styles.controlsRow}>
                    <Dropdown
                        style={styles.monthDropdown}
                        data={months.map(m => ({ label: m.name, value: m.id }))}
                        labelField="label"
                        valueField="value"
                        placeholder="Month"
                        value={selectedMonth}
                        onChange={item => setSelectedMonth(item.value)}
                    />
                    <TouchableOpacity
                        onPress={() => setMarkModalVisible(true)}
                        style={styles.markButton}
                    >
                        <View style={styles.markButtonContent}>
                            <Icon name="checkmark-done-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.markButtonText}>Mark</Text>
                        </View>
                    </TouchableOpacity>


                </View>

                {/* Week navigation */}
                <View style={styles.navigationRow}>
                    <TouchableOpacity disabled={isPrevDisabled} onPress={goPrevWeek}>
                        <Text style={[styles.navArrow, isPrevDisabled && styles.disabledArrow]}>⟸ Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={isNextDisabled} onPress={goNextWeek}>
                        <Text style={[styles.navArrow, isNextDisabled && styles.disabledArrow]}>Next ⟹</Text>
                    </TouchableOpacity>
                </View>

                {renderHeader()}
                {loading
                    ? <ActivityIndicator size="large" color="#2d3e83" />
                    : staffList.map(renderRow)}
            </ScrollView>
            <Modal
                visible={markModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMarkModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mark Staff Attendance</Text>

                        <Text style={styles.modalLabel}>Status</Text>
                        <Dropdown
                            data={[{ label: 'Present', value: 'Present' }, { label: 'Absent', value: 'Absent' }]}
                            value={markingStatus}
                            labelField="label"
                            valueField="value"
                            onChange={item => setMarkingStatus(item.value)}
                            style={styles.modalDropdown}
                        />

                        <Text style={styles.modalLabel}>Select Staff</Text>
                        <Dropdown
                            search
                            searchPlaceholder="Search name or ID"
                            data={staffOptions}
                            value={selectedUser}
                            labelField="label"
                            valueField="value"
                            onChange={item => setSelectedUser(item.value)}
                            style={styles.modalDropdown}
                        />

                        <Text style={styles.modalLabel}>Attendance Date</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text>{moment(attendanceDate).format('YYYY-MM-DD')}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={attendanceDate}
                                mode="date"
                                display="default"
                                onChange={(e, date) => {
                                    setShowDatePicker(false);
                                    if (date) setAttendanceDate(date);
                                }}
                            />
                        )}

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setMarkModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.markBtn} onPress={handleMarkAttendance}>
                                <Text style={styles.markBtnText}>Mark Attendance</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {(isSubmitting || showSuccessOverlay) && (
                <View style={styles.successOverlay}>
                    {isSubmitting ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <Text style={styles.successText}>Attendance Marked Successfully</Text>
                    )}
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 10 },
    pageHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    addBtn: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2d3e83',
        paddingHorizontal: 10,
        paddingTop: 4,
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    dropdown: {
        width: '40%',
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    navigationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    navArrow: { fontSize: 14, color: '#2d3e83', fontWeight: 'bold' },
    disabledArrow: { color: '#999' },
    stickyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    flexRow: { flexDirection: 'row' },
    stickyHeader: {
        width: 140,
        backgroundColor: '#2d3e83',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    dateHeader: {
        width: COLUMN_WIDTH,
        backgroundColor: '#2d3e83',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    dateText: { color: '#fff', fontSize: 11 },
    rowWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 1 },
    stickyCol: {
        width: 140,
        backgroundColor: '#2d3e83',
        padding: 6,
        justifyContent: 'center',
    },
    idTextLight: { fontSize: 11, fontWeight: '600', color: '#fff' },
    statusCell: {
        width: COLUMN_WIDTH,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    titleDropdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthDropdown: {
        width: 100,
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginTop: 6,
    },
    pageHeaderSection: {
        marginBottom: 5,
    },
    headerLeftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    markButton: {
        backgroundColor: '#2d3e83',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    markButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    markButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalLabel: {
        marginTop: 10,
        marginBottom: 4,
        fontWeight: '600',
    },
    modalDropdown: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    datePickerButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelBtn: {
        padding: 10,
        backgroundColor: '#999',
        borderRadius: 6,
    },
    markBtn: {
        padding: 10,
        backgroundColor: '#2d3e83',
        borderRadius: 6,
    },
    cancelBtnText: { color: '#fff' },
    markBtnText: { color: '#fff', fontWeight: 'bold' },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    successText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },



});

export default StaffAttendanceScreen;
