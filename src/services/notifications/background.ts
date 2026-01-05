import notifee, { EventType } from '@notifee/react-native';
import { scheduleDailyNotifications } from './schedule';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (
    type === EventType.DELIVERED &&
    detail.notification?.id === 'reminder-20'
  ) {
    // 8pm fired → schedule next day
    await scheduleDailyNotifications();
  }
});
