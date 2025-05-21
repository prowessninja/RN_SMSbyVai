import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import Snackbar from 'react-native-snackbar';
import { cacheLastAction, retryLastAction } from '../utils/actions'; 

const NoInternetOverlay = () => {
  const [isConnected, setIsConnected] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial fetch to set correct state on mount
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      console.log('Initial network status:', state);
      setIsConnected(online);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('NetInfo change:', state);
      const online = state.isConnected && state.isInternetReachable !== false;

      // If we just came back online from offline
      if (!isConnected && online) {
        Snackbar.show({
          text: 'Back online! Retrying last action...',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'green',
        });
        retryLastAction();
      }

      setIsConnected(online);
    });

    return () => unsubscribe();
  }, [isConnected]);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const handleReconnect = () => {
    NetInfo.fetch().then(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      if (online) {
        setIsConnected(true);
        Snackbar.show({
          text: 'Reconnected!',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'green',
        });
        retryLastAction();
      } else {
        Snackbar.show({
          text: 'Still no connection...',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'red',
        });
      }
    });
  };

  return (
    <Modal visible={!isConnected} transparent animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require('../../assets/animations/no-internet.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.text}>No Internet Connection</Text>
        <Text style={styles.subText}>Waiting to reconnect...</Text>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.button} onPress={handleReconnect}>
            <Text style={styles.buttonText}>Reconnect</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
  },
  button: {
    marginTop: 25,
    backgroundColor: '#ffffff22',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default NoInternetOverlay;
