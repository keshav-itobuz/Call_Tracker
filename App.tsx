import {
  StatusBar,
  useColorScheme,
  PermissionsAndroid,
  Platform,
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './Home';
import { useEffect, useRef, useState } from 'react';
import { createNotificationChannels } from './src/notifications/channels';
import { scheduleDailyNotifications } from './src/notifications/schedule';
import notifee, { EventType } from '@notifee/react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const homeRef = useRef<any>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  const requestPermissions = async () => {
    setIsCheckingPermissions(true);
    try {
      if (Platform.OS === 'android') {
        // Request notification permission on Android 13+
        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }

        // Request call log and contacts permissions
        const callLogPermissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        const hasCallLogPermission =
          callLogPermissions['android.permission.READ_CALL_LOG'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (!hasCallLogPermission) {
          setHasPermissions(false);
          setIsCheckingPermissions(false);
          Alert.alert(
            'Permission Denied',
            'Call log permission is required to use this app. Please grant the permission.',
          );
          return false;
        }

        setHasPermissions(true);
        setIsCheckingPermissions(false);

        // Setup notifications
        await createNotificationChannels();
        await scheduleDailyNotifications();
        console.log('Notifications scheduled successfully');
        return true;
      }

      setHasPermissions(true);
      setIsCheckingPermissions(false);
      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      setHasPermissions(false);
      setIsCheckingPermissions(false);
      return false;
    }
  };

  useEffect(() => {
    requestPermissions();

    // Handle notification press when app is in foreground or background
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        // Trigger sync when notification is pressed
        setTimeout(() => {
          if (homeRef.current && homeRef.current.triggerSync) {
            homeRef.current.triggerSync();
          }
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isCheckingPermissions) {
    return (
      <SafeAreaProvider>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!hasPermissions) {
    return (
      <SafeAreaProvider>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>⚠️ Permission Required</Text>
          <Text style={styles.errorText}>
            This app requires call log permissions to function properly.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={requestPermissions}
          >
            <Text style={styles.retryButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Home ref={homeRef} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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

export default App;
