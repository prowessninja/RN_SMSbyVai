// FeePaymentHistoryScreen.js — Simplified for full fetch UX
import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, TextInput, StyleSheet,
    TouchableOpacity, ActivityIndicator
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { fetchStandardsForYearBranch } from '../api/common';
import { fetchAllFeePayments } from '../api/feeApi';
import ProfileSection from '../components/ProfileSection';

const FeePaymentHistoryScreen = ({ navigation }) => {
    const { user, selectedBranch, selectedAcademicYear } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [standards, setStandards] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [feePayments, setFeePayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProfile, setShowProfile] = useState(true);

    useEffect(() => {
        if (selectedBranch?.id && selectedAcademicYear?.id) {
            setFeePayments([]);
            loadInitialData();
        }
    }, [selectedBranch, selectedAcademicYear]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const standardList = await fetchStandardsForYearBranch(
                selectedAcademicYear.id,
                selectedBranch.id,
                token
            );
            setStandards(standardList.results || []);

            const data = await fetchAllFeePayments({
                branch: selectedBranch.id,
                academic_year: selectedAcademicYear.id
            });

            setFeePayments(data?.results || []);
            console.log(`[FeePaymentHistory] Fetched ${data?.results.length} records`);
        } catch (error) {
            console.error('[loadInitialData] Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = standards.length === 0 ? [] : feePayments.filter((item) => {
        const matchesSearch = item.students_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.identifier?.toString().includes(searchTerm);
        const matchesStandard = !selectedStandard ||
            standards.find((s) => s.id === selectedStandard)?.name === item.standard;
        return matchesSearch && matchesStandard;
    });

    useEffect(() => {
        console.log(`[FeePaymentHistory] Filtered: ${filteredData.length} / ${feePayments.length} records`);
    }, [searchTerm, selectedStandard, filteredData]);


    const exportToXLSX = async () => {
        const wsData = filteredData.map((item) => ({
            Date: item.date,
            Student: item.students_name,
            "Roll No": item.identifier,
            Standard: item.standard,
            "Fee Type": item.feetype,
            Mode: item.payment_type,
            Amount: item.amount
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payments');
        const file = `${RNFS.DownloadDirectoryPath}/FeePaymentHistory.xlsx`;
        await RNFS.writeFile(file, XLSX.write(wb, { type: 'binary', bookType: 'xlsx' }), 'ascii');
        await Share.open({ url: `file://${file}` });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.students_name}</Text>
            <Text>Roll No: {item.identifier}</Text>
            <Text>Standard: {item.standard}</Text>
            <Text>Fee Type: {item.feetype}</Text>
            <Text>Mode: {item.payment_type}</Text>
            <Text>Amount Paid: ₹{item.amount}</Text>
            <Text>Date: {item.date}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={28} color="#2d3e83" />
                </TouchableOpacity>
                <Icon name="payments" size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
                <Text style={styles.screenTitle}>Fee Payment History</Text>
            </View>

            <View style={styles.filterRow}>
                <TextInput
                    placeholder="Search by name or roll no."
                    style={styles.searchInput}
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

            {filteredData.length === 0 && !loading ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
                    No payment records found.
                </Text>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListFooterComponent={
                        loading ? (
                            <ActivityIndicator size="small" color="#2d3e83" style={{ marginTop: 10 }} />
                        ) : null
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={exportToXLSX}>
                <Icon name="file-download" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default FeePaymentHistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4ff',
        padding: 16
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#2d3e83'
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        gap: 10
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12
    },
    card: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 1
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2d3e83'
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2d3e83',
        borderRadius: 30,
        padding: 14,
        elevation: 3
    }
});
