import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplash({ onAnimationEnd }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onAnimationEnd();
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo at top right */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Centered animation */}
      <LottieView
        source={require('../../assets/animations/splash.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />

      {/* Text below animation */}
      <Text style={styles.loadingText}>
        Application is loading... please wait
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  // or your preferred bg color
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,  // so logo is not at very top edge
  },
  logo: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 80,
    height: 80,
  },
  animation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
