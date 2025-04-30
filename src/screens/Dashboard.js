// screens/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('https://vai.dev.sms.visionariesai.com/api/some-endpoint/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Dashboard (Raw JSON)</Text>
      <Text selectable>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  );
};

export default Dashboard;
