import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const PermissionsHOC = (WrappedComponent, requiredCodenames = []) => {
  return (props) => {
    const { permissions, loading } = useContext(AuthContext);
    const [allCodenames, setAllCodenames] = useState([]);
    const [hasRequiredPermissions, setHasRequiredPermissions] = useState(null);

    useEffect(() => {
      if (!loading) {
        let extractedCodenames = [];

        if (Array.isArray(permissions)) {
          extractedCodenames = permissions.flatMap(p => p?.codename ? [p.codename] : []);
        } else if (typeof permissions === 'object' && permissions !== null) {
          extractedCodenames = Object.values(permissions).flatMap(group =>
            Array.isArray(group?.codenames) ? group.codenames : []
          );
        }

        if (__DEV__) {
          console.log('🔐 Extracted codenames:', extractedCodenames);
        }

        setAllCodenames(extractedCodenames);

        const hasPermissions = requiredCodenames.every(codename =>
          extractedCodenames.includes(codename)
        );

        setHasRequiredPermissions(hasPermissions);
      }
    }, [permissions, loading, requiredCodenames]);

    const hasPermission = (codename) => {
      return allCodenames.includes(codename);
    };

    if (loading || hasRequiredPermissions === null) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2d3e83" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      );
    }

    if (!hasRequiredPermissions) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            🚫 You do not have permission to view this screen.
          </Text>
        </View>
      );
    }

    return <WrappedComponent {...props} hasPermission={hasPermission} />;
  };
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default PermissionsHOC;
