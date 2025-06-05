// Updated FeeAnalyticsScreen.js with enhanced visuals and chart fixes
import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import EChartsWebView from '../components/EChartsWebView';
import { fetchSchoolAnalytics, fetchFeeCollectionStats, fetchFeeTypeDistribution } from '../api/feeApi';

const FeeAnalyticsScreen = ({ navigation }) => {
    const { user, selectedBranch, selectedAcademicYear } = useContext(AuthContext);
    const [showProfile, setShowProfile] = useState(true);
    const [schoolData, setSchoolData] = useState(null);
    const [feeStats, setFeeStats] = useState(null);
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedBranch?.id && selectedAcademicYear?.id) {
            loadAnalytics();
        }
    }, [selectedBranch, selectedAcademicYear]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [school, stats, types] = await Promise.all([
                fetchSchoolAnalytics(selectedBranch.id, selectedAcademicYear.id),
                fetchFeeCollectionStats(selectedBranch.id, selectedAcademicYear.id),
                fetchFeeTypeDistribution(selectedBranch.id, selectedAcademicYear.id),
            ]);
            setSchoolData(school);
            setFeeStats(stats);
            setFeeTypes(types?.fee_distribution || []);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setFeeTypes([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !schoolData || !feeStats) {
        return (
            <View style={styles.centered}><ActivityIndicator size="large" color="#2d3e83" /></View>
        );
    }

    const pieOption = {
        tooltip: { trigger: 'item' },
        legend: { top: 'bottom' },
        series: [
            {
                name: 'Fee Distribution',
                type: 'pie',
                radius: '55%',
                data: [
                    {
                        value: feeStats.fees_collected,
                        name: `Collected (₹${feeStats.fees_collected} - ${((feeStats.fees_collected / feeStats.total_fees) * 100).toFixed(1)}%)`
                    },
                    {
                        value: Math.abs(feeStats.fees_pending),
                        name: `Pending (₹${Math.abs(feeStats.fees_pending)} - ${((Math.abs(feeStats.fees_pending) / feeStats.total_fees) * 100).toFixed(1)}%)`
                    },
                    {
                        value: feeStats.total_concessions,
                        name: `Concession (₹${feeStats.total_concessions} - ${((feeStats.total_concessions / feeStats.total_fees) * 100).toFixed(1)}%)`
                    }
                ]
            }
        ]
    };


    const barOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Total', 'Pending'] },
        xAxis: {
            type: 'category',
            data: feeTypes.map(t => t.fee_type__name),
            axisLabel: { rotate: 45, interval: 0 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { overflow: 'truncate' }
        },
        series: [
            {
                name: 'Total',
                type: 'bar',
                data: feeTypes.map(t => t.total_amount),
                itemStyle: { color: '#2d3e83' }
            },
            {
                name: 'Pending',
                type: 'bar',
                data: feeTypes.map(t => t.total_amount - t.collected_amount),
                itemStyle: { color: '#ff6961' }
            }
        ]
    };

    const areaOption = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: schoolData.balance_analytics.monthly_data.map(m => m.month)
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: 'Income',
                type: 'line',
                smooth: true,
                areaStyle: {},
                data: schoolData.balance_analytics.monthly_data.map(m => m.income),
                itemStyle: { color: '#2d3e83' },
            },
            {
                name: 'Due',
                type: 'line',
                smooth: true,
                areaStyle: {},
                data: schoolData.balance_analytics.monthly_data.map(m => m.due),
                itemStyle: { color: '#ffa500' },
            }
        ]
    };

    return (
        <ScrollView style={styles.container}>
            <ProfileSection user={user} showProfile={showProfile} setShowProfile={setShowProfile} />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={28} color="#2d3e83" />
                </TouchableOpacity>
                <Icon name="analytics" size={28} color="#2d3e83" style={{ marginLeft: 10 }} />
                <Text style={styles.screenTitle}>Fee Analytics</Text>
            </View>

            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.cardRow}>
                <View style={[styles.infoCard, { backgroundColor: '#f6c90e' }]}>
                    <Text style={styles.cardTitle}>🎓 Students</Text>
                    <Text style={styles.cardText}>{schoolData.total_students.count}</Text>
                    <Text style={styles.cardText}>
                        {schoolData.total_students.growth > 0
                            ? '⬆️'
                            : schoolData.total_students.growth < 0
                                ? '⬇️'
                                : '↔️'}{' '}
                        {Math.abs(schoolData.total_students.growth)}%
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#3cba54' }]}>
                    <Text style={styles.cardTitle}>👨‍🏫 Staff</Text>
                    <Text style={styles.cardText}>{schoolData.total_staff.count}</Text>
                    <Text style={styles.cardText}>
                        {schoolData.total_staff.growth > 0
                            ? '⬆️'
                            : schoolData.total_staff.growth < 0
                                ? '⬇️'
                                : '↔️'}{' '}
                        {Math.abs(schoolData.total_staff.growth)}%
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#ff6f61' }]}>
                    <Text style={styles.cardTitle}>💰 Balance</Text>
                    <Text style={styles.cardText}>₹{schoolData.school_balance.amount}</Text>
                    <Text style={styles.cardText}>
                        {schoolData.school_balance.growth > 0
                            ? '⬆️'
                            : schoolData.school_balance.growth < 0
                                ? '⬇️'
                                : '↔️'}{' '}
                        {Math.abs(schoolData.school_balance.growth)}%
                    </Text>
                </View>
            </View>


            <Text style={styles.sectionTitle}>Financial Summary</Text>
            <View style={styles.cardRow}>
                <View style={[styles.statCard, { backgroundColor: '#cde9ff' }]}><Text>Total Fee</Text><Text>₹{feeStats.total_fees}</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#d1ffd6' }]}><Text>Collected</Text><Text>₹{feeStats.fees_collected}</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#ffe4c4' }]}><Text>Concession</Text><Text>₹{feeStats.total_concessions}</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#ffc2c2' }]}><Text>Pending</Text><Text>₹{feeStats.fees_pending}</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#f0e68c' }]}><Text>Pending Students</Text><Text>{feeStats.students_with_pending_fees}</Text></View>
                <View style={[styles.statCard, { backgroundColor: '#cdb4db' }]}><Text>Collection %</Text><Text>{feeStats.collection_percentage}%</Text></View>
            </View>

            <Text style={styles.sectionTitle}>Fee Distribution</Text>
            <EChartsWebView option={pieOption} />

            <Text style={styles.sectionTitle}>Fee Collection Status by Type</Text>
            <EChartsWebView option={barOption} />

            <Text style={styles.sectionTitle}>Monthly Income vs Due</Text>
            <EChartsWebView option={areaOption} />
        </ScrollView>
    );
};

export default FeeAnalyticsScreen;

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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d3e83',
        marginTop: 20,
        marginBottom: 10
    },
    cardRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    infoCard: {
        borderRadius: 12,
        padding: 12,
        width: '30%',
        alignItems: 'center'
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#fff'
    },
    cardText: {
        color: '#fff',
        fontWeight: '600',
        marginTop: 2
    },
    statCard: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        width: '48%'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
