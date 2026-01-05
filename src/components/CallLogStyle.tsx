import { StyleSheet } from 'react-native';

export const CallLogStyle = StyleSheet.create({
  callLogItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  callLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  phoneNumberSecondary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  callLogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  duration: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
