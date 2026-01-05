import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  NativeModules,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CallLog as CallLogType } from '../types';
import { HomeStyle } from './HomeStyle';
import CallLog from '../components/CallLog';

const { CallLogModule } = NativeModules;
const LAST_SYNC_KEY = '@CallTracker:lastSyncTimestamp';

const Home = forwardRef((_props, ref) => {
  const [callLogs, setCallLogs] = useState<CallLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    loadLastSyncTime();
    checkAndTriggerSync();
  }, []);

  const checkAndTriggerSync = async () => {
    try {
      const shouldSync = await AsyncStorage.getItem('@CallTracker:shouldSync');
      if (shouldSync === 'true') {
        console.log('Auto-triggering sync from notification press');
        await AsyncStorage.removeItem('@CallTracker:shouldSync');
        // Wait a bit for UI to be ready
        setTimeout(() => {
          syncCallLogs();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to check sync flag:', error);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (savedTime) {
        setLastSyncTime(Number.parseInt(savedTime, 10));
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const saveLastSyncTime = async (timestamp: number) => {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
      setLastSyncTime(timestamp);
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  };

  const syncCallLogs = async () => {
    setLoading(true);
    try {
      const logs = await CallLogModule.getCallLogs(100);

      // Filter logs to only show those after last sync
      const currentTime = Date.now();
      const newLogs = lastSyncTime
        ? logs.filter((log: CallLogType) => log.timestamp > lastSyncTime)
        : logs;

      // Update state with new logs only
      setCallLogs(newLogs);

      // Save current time as last sync
      await saveLastSyncTime(currentTime);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch call logs');
    } finally {
      setLoading(false);
    }
  };

  // Expose sync function to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSync: syncCallLogs,
  }));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={HomeStyle.container}>
      <View style={HomeStyle.header}>
        <Text style={HomeStyle.title}>Call Tracker</Text>
        {lastSyncTime && (
          <Text style={HomeStyle.lastSyncText}>
            Last sync: {formatDate(lastSyncTime)}
          </Text>
        )}
        <TouchableOpacity
          style={[
            HomeStyle.syncButton,
            loading && HomeStyle.syncButtonDisabled,
          ]}
          onPress={syncCallLogs}
          disabled={loading}
        >
          <Text style={HomeStyle.syncButtonText}>
            {loading ? 'Syncing...' : 'Sync Call Logs'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={HomeStyle.stats}>
        <Text style={HomeStyle.statsText}>New Calls: {callLogs.length}</Text>
      </View>

      {callLogs.length === 0 ? (
        <View style={HomeStyle.emptyState}>
          <Text style={HomeStyle.emptyStateText}>
            {lastSyncTime
              ? 'No new call logs since last sync. Tap "Sync Call Logs" to check again.'
              : 'No call logs yet. Tap "Sync Call Logs" to fetch your call history.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={callLogs}
          renderItem={({ item }) => <CallLog item={item} />}
          keyExtractor={(item, index) =>
            `${item.phoneNumber}-${item.timestamp}-${index}`
          }
          contentContainerStyle={HomeStyle.listContainer}
        />
      )}
    </SafeAreaView>
  );
});

export default Home;
