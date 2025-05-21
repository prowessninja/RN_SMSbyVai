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

const OrganisationAdminDashboard = ({ branch, year }) => {
    const [loading, setLoading] = useState(true);
    const [trackingSummary, setTrackingSummary] = useState({});
    const [expanded, setExpanded] = useState(false);
    const [feeExpanded, setFeeExpanded] = useState(false);
    const [expenseExpanded, setExpenseExpanded] = useState(false);

    useEffect(() => {
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
            } catch (err) {
                console.error('OrganisationAdminDashboard load error:', err);
                setTrackingSummary({});
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [branch, year]);

    const feeChartOptions = {
        title: {
            text: 'Fee Overview',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
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
                label: {
                    show: false,
                    position: 'center',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: false,
                },
                data: [
                    { value: 104800, name: 'Collected', itemStyle: { color: '#4d6dcf' } },
                    { value: 25200, name: 'Pending', itemStyle: { color: '#90cf6d' } },
                    { value: 9600, name: 'Waived', itemStyle: { color: '#f5c148' } },
                ],
            },
        ],
    };

    const expenseChartOptions = {
        title: {
            text: 'Expense Overview',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            data: ['Salaries', 'Utilities', 'Maintenance', 'Events', 'Transport',],
            type: 'scroll',
            itemGap: 10,
            textStyle: {
                fontSize: 12,
            },
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
                label: {
                    show: false,
                    position: 'center',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: false,
                },
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
                <View style={[styles.card, { backgroundColor: '#4d6dcf' }]}>
                    <Eyecon name="users" size={28} color="#fff" />
                    <Text style={styles.cardTitle}>Total Students</Text>
                    <Text style={styles.cardValue}>15,000</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#66bb6a' }]}>
                    <Eyecon name="chalkboard-teacher" size={28} color="#fff" />
                    <Text style={styles.cardTitle}>Teaching Staff</Text>
                    <Text style={styles.cardValue}>230</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#f5c148' }]}>
                    <Eyecon name="user-tie" size={28} color="#fff" />
                    <Text style={styles.cardTitle}>Non-Teaching</Text>
                    <Text style={styles.cardValue}>120</Text>
                </View>
            </View>

            {/* Inventory Section */}
            <TouchableOpacity
                onPress={() => setExpanded((e) => !e)}
                style={styles.inventoryHeader}
                accessibilityLabel="Toggle inventory chart"
            >
                <Text style={styles.inventoryHeaderText}>Inventory Overview</Text>
                <Eyecon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#2d3e83"
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>This Month’s Inventory Tracking</Text>
                    <EChartsWebView option={getInventoryBarChartOptions(trackingSummary)} />
                </View>
            )}

            {/* Fee Overview Section */}
            <TouchableOpacity
                onPress={() => setFeeExpanded((e) => !e)}
                style={styles.inventoryHeader}
                accessibilityLabel="Toggle fee chart"
            >
                <Text style={styles.inventoryHeaderText}>Fee Overview</Text>
                <Eyecon
                    name={feeExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#2d3e83"
                />
            </TouchableOpacity>

            {feeExpanded && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>This Month’s Fee Distribution</Text>
                    <EChartsWebView option={feeChartOptions} />
                </View>
            )}

            {/* Expense Overview Section */}
            <TouchableOpacity
                onPress={() => setExpenseExpanded((e) => !e)}
                style={styles.inventoryHeader}
                accessibilityLabel="Toggle expense chart"
            >
                <Text style={styles.inventoryHeaderText}>Expense Overview</Text>
                <Eyecon
                    name={expenseExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#2d3e83"
                />
            </TouchableOpacity>

            {expenseExpanded && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>This Month’s Expense Distribution</Text>
                    <EChartsWebView option={expenseChartOptions} />
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        height: 120,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
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

});

export default OrganisationAdminDashboard;
