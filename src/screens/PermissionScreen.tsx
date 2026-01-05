import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface PermissionScreenProps {
  onRequestPermissions: () => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onRequestPermissions,
}) => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.errorTitle}>⚠️ Permission Required</Text>
        <Text style={styles.errorText}>
          This app requires call log permissions to function properly.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRequestPermissions}
        >
          <Text style={styles.retryButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PermissionScreen;
