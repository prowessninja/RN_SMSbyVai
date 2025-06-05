import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { fetchStudentsBySection, markStudentAttendance } from '../api/timetableApi';
import CheckBox from '@react-native-community/checkbox';

const MarkStudentAttendanceModal = ({ visible, onClose, period, section, branchId }) => {
    const [students, setStudents] = useState([]);
    const [absentStudents, setAbsentStudents] = useState(new Set());
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);


    useEffect(() => {
        if (visible && section?.id) {
            loadStudents();
        }
    }, [visible]);

    const loadStudents = async () => {
        try {
            const data = await fetchStudentsBySection(branchId, section.id);
            setStudents(data);
            setAbsentStudents(new Set()); // All present by default
        } catch (e) {
            console.error('❌ Error loading students:', e);
        }
    };

    const toggleAbsent = (id) => {
        setAbsentStudents(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setShowOverlay(false);
            const attendance = {};
            students.forEach(s => {
                if (s.admission_number) {
                    attendance[s.admission_number] = absentStudents.has(s.id) ? 'A' : 'P';
                }
            });

            const payload = {
                period_id: period.id,
                attendance,
                attendance_date: moment(date).format('YYYY-MM-DD'),
            };

            console.log('📤 Submitting Attendance:', payload);
            await markStudentAttendance(payload);
            console.log('✅ Attendance submitted');

            setShowOverlay(true); // ✅ Show global success overlay
            setTimeout(() => {
                setShowOverlay(false);
                onClose(true);
            }, 2000);
        } catch (e) {
            console.error('❌ Error submitting attendance:', e);
            onClose(false);
        } finally {
            setLoading(false);
        }
    };


    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={() => onClose(false)} transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.heading}>
                        Mark attendance for {section?.standard?.name} - {section?.name}
                    </Text>

                    <Text style={styles.label}>
                        Period: {period?.subject?.name || period?.department?.name} [{period?.teacher?.first_name}]
                    </Text>

                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateBtnText}>
                            📅 {moment(date).format('YYYY-MM-DD')} (Change)
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    {loading && <ActivityIndicator size="large" color="#2d3e83" style={{ marginVertical: 10 }} />}
                    {successMessage !== '' && (
                        <Text style={{ textAlign: 'center', color: 'green', marginBottom: 10 }}>
                            {successMessage}
                        </Text>
                    )}

                    <ScrollView style={{ maxHeight: 300 }}>
                        {students.map((student) => (
                            <View key={student.id} style={styles.studentCard}>
                                <CheckBox
                                    value={absentStudents.has(student.id)}
                                    onValueChange={() => toggleAbsent(student.id)}
                                />
                                <Text style={styles.studentText}>
                                    {student.first_name} {student.last_name || ''} ({student.admission_number})
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.submitText}>Mark Attendance</Text>
                    </TouchableOpacity>
                </View>

                {showOverlay && (
                    <View style={styles.fullOverlay}>
                        <View style={styles.successBox}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.successText}>✅ Attendance marked successfully!</Text>
                        </View>
                    </View>
                )}

            </View>
        </Modal>
    );
};

export default MarkStudentAttendanceModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#0005',
        justifyContent: 'center',
        padding: 10,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        maxHeight: '90%',
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3e83',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
    },
    dateBtn: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    dateBtnText: {
        textAlign: 'center',
        color: '#2d3e83',
        fontWeight: '600',
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 8,
        borderRadius: 6,
    },
    studentText: {
        marginLeft: 8,
        fontSize: 13,
    },
    submitBtn: {
        backgroundColor: '#2d3e83',
        marginTop: 12,
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fullOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    successBox: {
        backgroundColor: '#2d3e83',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },

    successText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    fullOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },


});
