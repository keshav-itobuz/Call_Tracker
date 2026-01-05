import {
  StatusBar,
  useColorScheme,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './screens/Home';
import Login from './screens/Login';
import LoadingScreen from './components/Loading';
import PermissionScreen from './screens/PermissionScreen';
import { useEffect, useRef, useState } from 'react';
import { createNotificationChannels } from './services/notifications/channels';
import { scheduleDailyNotifications } from './services/notifications/schedule';
import notifee, { EventType } from '@notifee/react-native';
import { useUser } from './context/UserContext';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const homeRef = useRef<any>(null);
  const { user, isLoading: isLoadingUser } = useUser();
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
    if (user) {
      requestPermissions();
    }

    // Handle notification press when app is in foreground or background
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        setTimeout(() => {
          if (homeRef?.current?.triggerSync) {
            homeRef.current.triggerSync();
          }
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Show loading while checking user
  if (isLoadingUser) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user?.id) {
    return (
      <SafeAreaProvider>
        <Login />
      </SafeAreaProvider>
    );
  }

  if (isCheckingPermissions) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!hasPermissions) {
    return <PermissionScreen onRequestPermissions={requestPermissions} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <Home ref={homeRef} />
    </SafeAreaProvider>
  );
}

export default AppContent;
