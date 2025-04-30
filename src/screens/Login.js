import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, Button,
  Alert, Image, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]     = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return Alert.alert('Error', 'Enter both username and password');
    }
    setBusy(true);
    try {
      const res = await fetch('https://vai.dev.sms.visionariesai.com/get-token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      console.log('LOGIN RESPONSE:', data);

      // your endpoint might return { access: '…' } not { token: '…' }
      const tokenValue = data.token || data.access;
      if (res.ok && tokenValue) {
        await login(tokenValue);
        // AppNavigator will switch screens for you
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
    <View style={{ flex:1, justifyContent:'center',alignItems:'center',padding:20 }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width:120, height:120, marginBottom:30 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize:24, marginBottom:20 }}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ borderWidth:1, width:'100%', marginBottom:10, padding:10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth:1, width:'100%', marginBottom:20, padding:10 }}
      />
      {busy
        ? <ActivityIndicator size="large" />
        : <Button title="Login" onPress={handleLogin} />}
    </View>
  );
};

export default Login;
