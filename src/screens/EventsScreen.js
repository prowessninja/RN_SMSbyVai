import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from '../components/ProfileSection';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Calendar } from 'react-native-calendars';
import { fetchAllEvents } from '../api/eventsApi';
import EventDetailsModal from '../components/EventDetailsModal';
import dayjs from 'dayjs';
import { useIsFocused, useRoute } from '@react-navigation/native'; // ADD THIS
import { deleteEvent } from '../api/eventsApi'; // ✅ Add this
import { Alert } from 'react-native';


const EventsScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);

    const [showProfile, setShowProfile] = useState(true);
    const [events, setEvents] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [selectedDate, setSelectedDate] = useState(
        dayjs().format('YYYY-MM-DD')
    );
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const route = useRoute(); // 👈 needed to access route params
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Fetch events on mount
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchAllEvents();
                setEvents(data);

                const marked = {};
                data.forEach((event) => {
                    const start = dayjs(event.start_date);
                    const end = dayjs(event.end_date);
                    const rangeStart = start.isBefore(end) ? start : end;
                    const rangeEnd = start.isAfter(end) ? start : end;

                    let current = rangeStart;
                    while (current.isBefore(rangeEnd) || current.isSame(rangeEnd, 'day')) {
                        const dateStr = current.format('YYYY-MM-DD');
                        marked[dateStr] = {
                            marked: true,
                            dotColor: '#2d3e83',
                        };
                        current = current.add(1, 'day');
                    }
                });

                setMarkedDates(marked);
            } catch (err) {
                console.error('❌ Failed to fetch events:', err);
            }
        };

        // Trigger fetch on focus or refresh param
        if (isFocused || route.params?.refresh) {
            loadEvents();
        }
    }, [isFocused, route.params?.refresh]);

    useEffect(() => {
        if (route.params?.refresh) {
            navigation.setParams({ refresh: false }); // Reset refresh flag
        }
    }, [route.params?.refresh]);

    // Events filtered by selected date
    const eventsForDate = events.filter((event) => {
        if (!event.start_date || !event.end_date) return false;

        const selected = dayjs(selectedDate);
        const start = dayjs(event.start_date);
        const end = dayjs(event.end_date);
        const rangeStart = start.isBefore(end) ? start : end;
        const rangeEnd = start.isAfter(end) ? start : end;

        return selected.isSame(rangeStart, 'day') ||
            selected.isSame(rangeEnd, 'day') ||
            (selected.isAfter(rangeStart, 'day') && selected.isBefore(rangeEnd, 'day'));
    });

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    const handleDelete = () => {
        Vibration.vibrate([0, 200, 100, 200, 100, 300]);
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoadingDelete(true);
                        try {
                            await deleteEvent(selectedEvent.id);
                            Alert.alert('Deleted', 'Event deleted successfully.');

                            // Remove from local state
                            setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
                            setModalVisible(false);
                            setSelectedEvent(null);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete event.');
                        } finally {
                            setLoadingDelete(false);
                        }
                    },
                },
            ]
        );
    };


    return (
        <View style={styles.container}>
            <ProfileSection
                user={user}
                showProfile={showProfile}
                setShowProfile={setShowProfile}
            />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="#2d3e83" />
                </TouchableOpacity>
                <Icon
                    name="calendar-alt"
                    size={20}
                    color="#2d3e83"
                    style={styles.iconSpacing}
                />
                <Text style={styles.heading}>Events</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('EditEventScreen', { event: null })}
                >
                    <Icon name="plus" size={16} color="#fff" />
                </TouchableOpacity>

            </View>

            <Calendar
                markedDates={{
                    ...markedDates,
                    [selectedDate]: {
                        selected: true,
                        selectedColor: '#2d3e83',
                        ...(markedDates[selectedDate] || {}),
                    },
                }}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                theme={{
                    todayTextColor: '#fb8c00',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    arrowColor: '#2d3e83',
                }}
            />

            <FlatList
                data={eventsForDate}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.eventItem}
                        onPress={() => handleEventPress(item)}
                    >
                        <Text style={styles.eventName}>{item.name}</Text>
                        <Text style={styles.eventDesc} numberOfLines={1}>
                            {item.description}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.noEventText}>
                        No events on this date.
                    </Text>
                }
            />

            <EventDetailsModal
                visible={modalVisible}
                event={selectedEvent}
                onClose={() => setModalVisible(false)}
                onEdit={() => {
                    setModalVisible(false);
                    navigation.navigate('EditEventScreen', { event: selectedEvent });
                }}
                onDelete={handleDelete}           // ✅ New delete handler
                loading={loadingDelete}           // ✅ Shows spinner while deleting
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    iconSpacing: { marginHorizontal: 10 },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d3e83',
        flex: 1,
    },
    addButton: {
        backgroundColor: '#2d3e83',
        padding: 8,
        borderRadius: 20,
    },
    eventItem: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginVertical: 5,
    },
    eventName: { fontWeight: '600', fontSize: 16, color: '#333' },
    eventDesc: { fontSize: 12, color: '#555' },
    noEventText: { textAlign: 'center', marginTop: 20, color: '#888' },
});

export default EventsScreen;
