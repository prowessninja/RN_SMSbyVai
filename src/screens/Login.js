import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, Image, ActivityIndicator, StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return Alert.alert('Error', 'Enter both username and password');
    }
    setBusy(true);
    try {
      const res = await fetch('https://vai.dev.sms.visionariesai.com/api/get-token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      console.log('LOGIN RESPONSE:', data);

      const tokenValue = data.token || data.access;
      if (res.ok && tokenValue) {
        await login(tokenValue);
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect. Retry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top-right logo and info */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.poweredContainer}>
          <Text style={styles.poweredText}>Powered By</Text>
          <Text style={styles.poweredText}>VisionariesAI Labs</Text>
          <Text style={styles.poweredText}>V.2025.01.0001</Text>
        </View>
      </View>

      {/* Center animation */}
      <LottieView
        source={require('../../assets/lottie/login.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Welcome to SMS by Vai</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  poweredContainer: {
    alignItems: 'center',
  },
  poweredText: {
    fontSize: 10,
    color: '#555',
    fontStyle: 'italic',
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: '#2d3e83',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
