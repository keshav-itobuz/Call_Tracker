import React from 'react';
import { Text, View } from 'react-native';
import { CallLog as CallLogType } from '../types';
import { CallLogStyle } from './CallLogStyle';

interface CallLogProps {
  item: CallLogType;
}

const CallLog: React.FC<CallLogProps> = ({ item }) => {
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

  return (
    <View style={CallLogStyle.callLogItem}>
      <View style={CallLogStyle.callLogHeader}>
        <Text style={CallLogStyle.phoneNumber}>
          {item.name || item.phoneNumber}
        </Text>
        <View
          style={[
            CallLogStyle.typeBadge,
            { backgroundColor: getCallTypeColor(item.type) },
          ]}
        >
          <Text style={CallLogStyle.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
      {item.name && (
        <Text style={CallLogStyle.phoneNumberSecondary}>
          {item.phoneNumber}
        </Text>
      )}
      <View style={CallLogStyle.callLogFooter}>
        <Text style={CallLogStyle.timestamp}>{formatDate(item.timestamp)}</Text>
        <Text style={CallLogStyle.duration}>
          Duration: {formatDuration(item.duration)}
        </Text>
      </View>
    </View>
  );
};

export default CallLog;
