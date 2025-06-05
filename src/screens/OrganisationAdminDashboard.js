// ...top imports (unchanged)
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
import { getDashboardApi } from '../api/dashboardApiRouter';
import { getInventoryBarChartOptions } from '../utils/chartUtils';
import {
    fetchSchoolAnalytics,
    fetchFeeCollectionStats,
} from '../api/feeApi';

const OrganisationAdminDashboard = ({ branch, year }) => {
    const [loading, setLoading] = useState(true);
    const [trackingSummary, setTrackingSummary] = useState({});
    const [feeChartOptions, setFeeChartOptions] = useState(null);
    const [revenueChartOptions, setRevenueChartOptions] = useState(null);

    const [expanded, setExpanded] = useState(false);
    const [feeExpanded, setFeeExpanded] = useState(false);
    const [expenseExpanded, setExpenseExpanded] = useState(false);
    const [revenueExpanded, setRevenueExpanded] = useState(false);

    const [schoolAnalytics, setSchoolAnalytics] = useState(null);

    useEffect(() => {
        if (!branch || !year) return;

        const load = async () => {
            setLoading(true);
            try {
                const apiModule = getDashboardApi('Organisation Admin');
                const { fetchDashboardData } = apiModule;
                const data = await fetchDashboardData(branch, year);
                const inv = data.inventoryDashboard || {};

                const summary = (inv.monthly_tracking || []).reduce((acc, { status, total }) => {
                    acc[status] = (acc[status] || 0) + total;
                    return acc;
                }, {});
                setTrackingSummary(summary);

                const analytics = await fetchSchoolAnalytics(branch, year);
                setSchoolAnalytics(analytics);

                const feeStats = await fetchFeeCollectionStats(branch, year);
                const { fees_collected, fees_pending, total_concessions } = feeStats;

                // Set Fee Pie Chart
                setFeeChartOptions({
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
                        data: ['Collected', 'Pending', 'Waived'],
                    },
                    series: [
                        {
                            name: 'Fee',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 10,
                                borderColor: '#fff',
                                borderWidth: 2,
                            },
                            label: { show: false, position: 'center' },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                },
                            },
                            labelLine: { show: false },
                            data: [
                                { value: Math.abs(fees_collected), name: 'Collected', itemStyle: { color: '#4d6dcf' } },
                                { value: Math.abs(fees_pending), name: 'Pending', itemStyle: { color: '#90cf6d' } },
                                { value: Math.abs(total_concessions), name: 'Waived', itemStyle: { color: '#f5c148' } },
                            ],
                        },
                    ],
                });

                // Set Revenue Bar Chart
                const monthlyData = analytics?.balance_analytics?.monthly_data || [];
                const months = monthlyData.map(item => item.month);
                const incomeData = monthlyData.map(item => item.income);
                const dueData = monthlyData.map(item => item.due);

                setRevenueChartOptions({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' }
                    },
                    legend: {
                        data: ['Income', 'Due'],
                        top: 0,
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '10%',
                        containLabel: true,
                    },
                    xAxis: {
                        type: 'category',
                        data: months,
                        axisLabel: { rotate: months.length > 5 ? 30 : 0 }
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            name: 'Income',
                            type: 'bar',
                            stack: 'total',
                            label: { show: true },
                            itemStyle: { color: '#4caf50' },
                            data: incomeData,
                        },
                        {
                            name: 'Due',
                            type: 'bar',
                            stack: 'total',
                            label: { show: true },
                            itemStyle: { color: '#f44336' },
                            data: dueData,
                        },
                    ]
                });

            } catch (err) {
                console.error('OrganisationAdminDashboard load error:', err);
                setTrackingSummary({});
                setFeeChartOptions(null);
                setRevenueChartOptions(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [branch, year]);

    const expenseChartOptions = {
        title: {
            text: 'Expense Overview',
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
            type: 'scroll',
            itemGap: 10,
            textStyle: { fontSize: 12 },
            data: ['Salaries', 'Utilities', 'Maintenance', 'Events', 'Transport'],
        },
        series: [
            {
                name: 'Expenses',
                type: 'pie',
                radius: ['0%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                },
                labelLine: { show: false },
                data: [
                    { value: 300000, name: 'Salaries', itemStyle: { color: '#f54291' } },
                    { value: 25000, name: 'Utilities', itemStyle: { color: '#42a5f5' } },
                    { value: 30000, name: 'Maintenance', itemStyle: { color: '#66bb6a' } },
                    { value: 20000, name: 'Events', itemStyle: { color: '#ffca28' } },
                    { value: 50000, name: 'Transport', itemStyle: { color: '#4d6dcf' } },
                ],
            },
        ],
    };

    const renderCard = (title, icon, value, growth, bgColor) => {
        const growthColor = growth > 0 ? styles.growthUp : growth < 0 ? styles.growthDown : styles.growthNeutral;
        const badgeColor = growth > 0 ? styles.badgeGreen : growth < 0 ? styles.badgeRed : styles.badgeYellow;
        const formattedGrowth = growth > 0
            ? `🔺 ${Math.abs(growth)}%`
            : growth < 0
                ? `🔻 ${Math.abs(growth)}%`
                : '＝ 0%';

        return (
            <View style={[styles.card, { backgroundColor: bgColor }]}>
                <Eyecon name={icon} size={28} color="#fff" />
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardValue}>{value}</Text>
                <View style={[styles.growthBadge, badgeColor]}>
                    <Text style={[styles.growthText, growthColor]}>
                        {formattedGrowth}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, styles.loaderContainer]}>
                <ActivityIndicator size="large" color="#2d3e83" />
            </View>
        );
    }

    return (
        <View>
            <View style={styles.cardContainer}>
                {renderCard(
                    'Total Students',
                    'users',
                    schoolAnalytics?.total_students?.count?.toLocaleString('en-IN') || '0',
                    schoolAnalytics?.total_students?.growth,
                    '#4d6dcf'
                )}
                {renderCard(
                    'Teaching Staff',
                    'chalkboard-teacher',
                    schoolAnalytics?.total_staff?.count?.toLocaleString('en-IN') || '0',
                    schoolAnalytics?.total_staff?.growth,
                    '#66bb6a'
                )}
                {renderCard(
                    'Income',
                    'rupee-sign',
                    `₹${schoolAnalytics?.school_balance?.amount?.toLocaleString('en-IN') || '0'}`,
                    schoolAnalytics?.school_balance?.growth,
                    '#f5c148'
                )}
            </View>

            <Section
                title="Inventory Overview"
                expanded={expanded}
                onToggle={() => setExpanded(e => !e)}
                chartTitle="This Month’s Inventory Tracking"
                chartOptions={getInventoryBarChartOptions(trackingSummary)}
            />

            <Section
                title="Fee Overview"
                expanded={feeExpanded}
                onToggle={() => setFeeExpanded(e => !e)}
                chartTitle="This Month’s Fee Distribution"
                chartOptions={feeChartOptions}
            />

            <Section
                title="Expense Overview"
                expanded={expenseExpanded}
                onToggle={() => setExpenseExpanded(e => !e)}
                chartTitle="This Month’s Expense Distribution"
                chartOptions={expenseChartOptions}
            />

            <Section
                title="Revenue Overview"
                expanded={revenueExpanded}
                onToggle={() => setRevenueExpanded(e => !e)}
                chartTitle="Month-wise Income vs Due"
                chartOptions={revenueChartOptions}
            />
        </View>
    );
};

const Section = ({ title, expanded, onToggle, chartTitle, chartOptions }) => (
    <>
        <TouchableOpacity onPress={onToggle} style={styles.inventoryHeader} accessibilityLabel={`Toggle ${title.toLowerCase()} chart`}>
            <Text style={styles.inventoryHeaderText}>{title}</Text>
            <Eyecon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#2d3e83" />
        </TouchableOpacity>
        {expanded && chartOptions && (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{chartTitle}</Text>
                <EChartsWebView option={chartOptions} />
            </View>
        )}
    </>
);

const styles = StyleSheet.create({
    loaderContainer: { height: 120 },
    center: { justifyContent: 'center', alignItems: 'center' },
    inventoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginTop: 20,
    },
    inventoryHeaderText: {
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
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        marginHorizontal: 10,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
        paddingVertical: 15,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cardTitle: {
        marginTop: 8,
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    cardValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    growthBadge: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 6,
        alignSelf: 'center',
    },
    growthText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    growthUp: { color: '#2e7d32' },
    growthDown: { color: '#d32f2f' },
    growthNeutral: { color: '#fb8c00' },
    badgeGreen: { backgroundColor: '#e8f5e9' },
    badgeRed: { backgroundColor: '#fdecea' },
    badgeYellow: { backgroundColor: '#fff3e0' },
});

export default OrganisationAdminDashboard;
