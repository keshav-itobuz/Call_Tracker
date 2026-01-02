import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CallLog } from './src/types';
import { HomeStyle } from './HomeStyle';

const { CallLogModule } = NativeModules;

export default function Home() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);

  const requestCallLogPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'This feature is only available on Android');
      return false;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      ]);

      return (
        granted['android.permission.READ_CALL_LOG'] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const syncCallLogs = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestCallLogPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant call log permission to view call history',
        );
        setLoading(false);
        return;
      }

      const logs = await CallLogModule.getCallLogs(100);
      setCallLogs(logs);

      Alert.alert('Success', `Fetched ${logs.length} call logs`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch call logs');
      console.error('Call log error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case 'INCOMING':
        return '#4CAF50';
      case 'OUTGOING':
        return '#2196F3';
      case 'MISSED':
        return '#F44336';
      case 'REJECTED':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const renderCallLog = ({ item }: { item: CallLog }) => (
    <View style={HomeStyle.callLogItem}>
      <View style={HomeStyle.callLogHeader}>
        <Text style={HomeStyle.phoneNumber}>
          {item.name || item.phoneNumber}
        </Text>
        <View
          style={[
            HomeStyle.typeBadge,
            { backgroundColor: getCallTypeColor(item.type) },
          ]}
        >
          <Text style={HomeStyle.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
      {item.name && (
        <Text style={HomeStyle.phoneNumberSecondary}>{item.phoneNumber}</Text>
      )}
      <View style={HomeStyle.callLogFooter}>
        <Text style={HomeStyle.timestamp}>{formatDate(item.timestamp)}</Text>
        <Text style={HomeStyle.duration}>
          Duration: {formatDuration(item.duration)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={HomeStyle.container}>
      <View style={HomeStyle.header}>
        <Text style={HomeStyle.title}>Call Tracker</Text>
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
        <Text style={HomeStyle.statsText}>Total Calls: {callLogs.length}</Text>
      </View>

      {callLogs.length === 0 ? (
        <View style={HomeStyle.emptyState}>
          <Text style={HomeStyle.emptyStateText}>
            No call logs yet. Tap "Sync Call Logs" to fetch your call history.
          </Text>
        </View>
      ) : (
        <FlatList
          data={callLogs}
          renderItem={renderCallLog}
          keyExtractor={(item, index) =>
            `${item.phoneNumber}-${item.timestamp}-${index}`
          }
          contentContainerStyle={HomeStyle.listContainer}
        />
      )}
    </SafeAreaView>
  );
}
