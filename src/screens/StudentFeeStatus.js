// StudentFeeStatus.js
import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import CommonAPI from '../api/common';
import {
    fetchStudentFeeSummaries,
    fetchFeeSummary,
    fetchFeePayments,
    fetchTotalFeeSummary,
} from '../api/feeApi';
import ProfileSection from '../components/ProfileSection';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeeFormModal from '../components/FeeFormModal';

const StudentFeeStatus = ({ navigation }) => {
    const { user, selectedBranch, selectedAcademicYear } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [standards, setStandards] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [feeSummaries, setFeeSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const fetchStandardsForYearBranch = CommonAPI.fetchStandardsForYearBranch;

    const [showFeeFormModal, setShowFeeFormModal] = useState(false);
    const [modalFeeSummary, setModalFeeSummary] = useState(null);
    const [modalUserInfo, setModalUserInfo] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (selectedBranch?.id && selectedAcademicYear?.id) {
            fetchInitialData();
        }
    }, [selectedBranch, selectedAcademicYear]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const standardList = await fetchStandardsForYearBranch(
                selectedAcademicYear.id,
                selectedBranch.id,
                token
            );
            setStandards(standardList.results || []);

            const feeSummaryData = await fetchStudentFeeSummaries(
                selectedBranch.id,
                selectedAcademicYear.id
            );
            setFeeSummaries(feeSummaryData.results || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredList = feeSummaries.filter((student) => {
        const matchesSearch =
            student.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admission_number.toString().includes(searchTerm);
        const matchesStandard =
            !selectedStandard || student.standard_id === selectedStandard;
        return matchesSearch && matchesStandard;
    });

    const fetchAndShowModalData = async (userId) => {
        setModalLoading(true);
        try {
            const [feeSummaryData, totalSummaryData, feePaymentsData] = await Promise.all([
                fetchFeeSummary(userId, selectedAcademicYear.id),
                fetchTotalFeeSummary(
                    selectedBranch.id,
                    selectedAcademicYear.id,
                    selectedStandard,
                    userId
                ),
                fetchFeePayments(userId),
            ]);

            const concessions = totalSummaryData.results[0]?.concessions || [];

            // Inject concession_amount into feeSummaryData
            const enrichedFeeSummary = {
                ...feeSummaryData,
                results: (feeSummaryData.results || []).map((item) => {
                    const concessionMatch = concessions.find(
                        (c) => c.fee_type === item.fee.fee_type.name
                    );
                    return {
                        ...item,
                        concession_amount: concessionMatch ? concessionMatch.amount : 0,
                    };
                }),
            };

            const enrichedUserInfo = {
                ...totalSummaryData.results[0],
                transactions: feePaymentsData.results || [],
            };

            setModalFeeSummary(enrichedFeeSummary);
            setModalUserInfo(enrichedUserInfo);
            setShowFeeFormModal(true);
        } catch (error) {
            console.error("Error loading modal data:", error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleModalRefresh = async () => {
        if (modalUserInfo?.user_id) {
            setShowFeeFormModal(false); // Close modal first
            await fetchInitialData();   // Refresh main list
        }
    };



    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.user_name}</Text>
                <TouchableOpacity onPress={() => fetchAndShowModalData(item.user_id)}>
                    <Icon name="receipt-long" size={24} color="#2d3e83" />
                </TouchableOpacity>
            </View>
            <Text style={styles.text}>Admission No: {item.admission_number}</Text>
            <Text style={styles.text}>Section: {item.section || 'N/A'}</Text>
            <Text style={styles.text}>Academic Year: {item.academic_year}</Text>
            <Text style={styles.text}>Total Fee: ₹{item.totalfee}</Text>
            <Text style={styles.textPending}>Pending Fee: ₹{item.pending_fee}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ProfileSection user={user} showProfile={true} setShowProfile={() => { }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={28} color="#2d3e83" />
                </TouchableOpacity>
                <Icon name="account-balance-wallet" size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2d3e83', marginLeft: 10 }}>
                    Student Fee Status
                </Text>
            </View>

            <View style={{ zIndex: 1000, marginBottom: 12 }}>
                <View style={styles.filterRow}>
                    <TextInput
                        placeholder="Search by name or admission no."
                        style={styles.searchBar}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    <DropDownPicker
                        open={dropdownOpen}
                        value={selectedStandard}
                        items={standards.map((s) => ({ label: s.name, value: s.id }))}
                        setOpen={setDropdownOpen}
                        setValue={setSelectedStandard}
                        onChangeValue={(val) => setSelectedStandard(val)}
                        placeholder="Standard"
                        containerStyle={{ width: 150 }}
                        zIndex={1000}
                        listMode="MODAL"
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2d3e83" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item) => item.user_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            {modalUserInfo && modalFeeSummary && (
                <FeeFormModal
                    visible={showFeeFormModal}
                    onClose={() => setShowFeeFormModal(false)}
                    selectedFeeSummary={modalFeeSummary}
                    selectedUserInfo={modalUserInfo}
                    onRefresh={handleModalRefresh}
                />

            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4ff',
        padding: 16,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchBar: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    text: {
        fontSize: 14,
        color: '#555',
    },
    textPending: {
        fontSize: 14,
        color: 'red',
        marginTop: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
});

export default StudentFeeStatus;
