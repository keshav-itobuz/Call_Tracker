export interface CallLog {
  phoneNumber: string;
  name: string;
  type:
    | 'INCOMING'
    | 'OUTGOING'
    | 'MISSED'
    | 'VOICEMAIL'
    | 'REJECTED'
    | 'BLOCKED'
    | 'UNKNOWN';
  timestamp: number;
  duration: number;
}
