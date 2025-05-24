import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';
import { Dropdown } from 'react-native-element-dropdown';
import Eyecon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // for back arrow & analytics icon
import { fetchInventoryAnalytics } from '../api/analytics';
import EChartsWebView from '../components/EChartsWebView';

const InventoryAnalyticsScreen = ({ navigation }) => {
    const { user, branches, academicYears } = useContext(AuthContext);
    const [branch, setBranch] = useState(branches?.[0]?.id);
    const [year, setYear] = useState(academicYears?.[0]?.id);
    const [showProfile, setShowProfile] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (branch) {
            fetchInventoryAnalytics(branch).then(setData).catch(console.error);
        }
    }, [branch]);

    const animationSource = require('../../assets/default.json');

    // Use only 4 colors as requested (excluding last green one)
    const colors = ['#2d3e83', '#fa8c16', '#fa541c', '#13c2c2'];

    const pieOption = (title, dataMap) => ({
        title: { text: title, left: 'center', top: 10, textStyle: { fontWeight: 'bold' } },
        tooltip: { trigger: 'item' },
        legend: { bottom: 10, left: 'center' },
        grid: {
            left: 25,   // Add this to allow breathing room
            right: 20,
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: Object.entries(dataMap).map(([name, value], i) => ({
                    name,
                    value,
                    itemStyle: { color: colors[i % colors.length] },
                })),
                label: { formatter: '{b}: {d}%' },
            },
        ],
    });

    const barOption = (title = 'Monthly Tracking Summary', monthly) => {
        const months = [...new Set(monthly.map((m) => m.month.slice(0, 7)))];
        const statuses = [...new Set(monthly.map((m) => m.status))];

        const series = statuses.map((status, i) => ({
            name: status,
            type: 'bar',
            stack: 'total',
            itemStyle: { color: colors[i % colors.length] },
            data: months.map((month) => {
                const entry = monthly.find(
                    (e) => e.month.startsWith(month) && e.status === status
                );
                return entry?.total || 0;
            }),
        }));

        return {
            title: {
                text: title,
                left: 'center',
                top: 10,
                textStyle: { fontWeight: 'bold' },
            },
            tooltip: { trigger: 'axis' },
            legend: { top: 40 },
            grid: { top: 80, left: '15%', right: 20, bottom: 40 },
            xAxis: { type: 'category', data: months },
            yAxis: { type: 'value' },
            series,
        };
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* Profile toggle */}
            <TouchableOpacity
                onPress={() => setShowProfile((p) => !p)}
                style={styles.iconToggle}
            >
                <Eyecon name={showProfile ? 'eye-slash' : 'eye'} size={15} color="#fff" />
            </TouchableOpacity>

            {/* User Profile Card */}
            {showProfile && (
                <View style={styles.profileCard}>
                    {user?.profile_image ? (
                        <Image source={{ uri: user.profile_image }} style={styles.profileImage} />
                    ) : (
                        <LottieView source={animationSource} autoPlay loop style={styles.animation} />
                    )}
                    <Text style={styles.greeting}>Hello, {user?.first_name || 'User'}</Text>
                    <Text style={styles.role}>{user?.group?.name || 'Role'}</Text>

                    <View style={styles.dropdownRow}>
                        <Dropdown
                            style={styles.dropdown}
                            data={(academicYears || []).map((y) => ({ label: y.name, value: y.id }))}
                            labelField="label"
                            valueField="value"
                            value={year}
                            placeholder="Academic Year"
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownText}
                            onChange={(item) => setYear(item.value)}
                        />
                        <Dropdown
                            style={styles.dropdown}
                            data={(branches || []).map((b) => ({ label: b.name, value: b.id }))}
                            labelField="label"
                            valueField="value"
                            value={branch}
                            placeholder="Branch"
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownText}
                            onChange={(item) => setBranch(item.value)}
                        />
                    </View>
                </View>
            )}

            {/* Header with Back arrow, Analytics Icon & Title */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#2d3e83" />
                </TouchableOpacity>
                <MaterialIcons name="analytics" size={28} color="#2d3e83" style={{ marginHorizontal: 8 }} />
                <Text style={styles.headerTitle}>Inventory Analytics</Text>
            </View>

            {/* Inventory Summary Heading */}
            <Text style={styles.summaryHeading}>Inventory Summary</Text>

            {/* Summary Cards */}
            {data ? (
                <>
                    <View style={styles.cardGrid}>
                        {Object.entries(data.inventory_summary).map(([label, value], i) => (
                            <View
                                key={i}
                                style={[
                                    styles.summaryCard,
                                    {
                                        backgroundColor: colors[i % colors.length] + '33', // 20% opacity for bg
                                        borderColor: colors[i % colors.length],
                                    },
                                ]}
                            >
                                <Text style={[styles.cardValue, { color: colors[i % colors.length] }]}>{value}</Text>
                                <Text style={styles.cardLabel}>{label.replace(/_/g, ' ')}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Each chart inside its own card with spacing */}
                    <View style={styles.chartCard}>
                        <EChartsWebView option={pieOption('Inventory Status', data.inventory_status)} />
                    </View>
                    <View style={styles.chartCard}>
                        <EChartsWebView option={pieOption('Tracking Summary', data.tracking_summary)} />
                    </View>
                    <View style={styles.chartCard}>
                        <EChartsWebView option={barOption('Monthly Inventory Tracking', data.monthly_tracking)} />
                    </View>
                </>
            ) : (
                <Text style={styles.placeholderText}>Loading analytics...</Text>
            )}

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#FAFAFA',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2d3e83',
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#2d3e83',
        padding: 20,
        borderRadius: 16,
        elevation: 4,
    },
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    animation: {
        height: 80,
        width: 80,
        marginBottom: 10,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    role: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 10,
    },
    iconToggle: {
        alignSelf: 'flex-end',
        backgroundColor: '#2d3e83',
        padding: 8,
        borderRadius: 20,
        marginRight: 10,
        marginTop: 1,
    },
    dropdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    dropdown: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    dropdownText: { fontSize: 14, color: '#333' },
    dropdownPlaceholder: { color: '#999', fontSize: 14 },
    summaryHeading: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d3e83',
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center',
    },

    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        width: '48%',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    cardValue: { fontSize: 28, fontWeight: 'bold' },
    cardLabel: { fontSize: 16, color: '#555', marginTop: 6, textAlign: 'center' },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        elevation: 4,
        alignItems: 'center',
        width: '100%', // Ensure it does not overflow parent
    },

    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
});

export default InventoryAnalyticsScreen;
