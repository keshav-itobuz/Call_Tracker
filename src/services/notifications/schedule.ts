import notifee, { TriggerType } from '@notifee/react-native';

const FIXED_HOURS = [12, 16, 18, 20];

export async function scheduleDailyNotifications() {
  try {
    // Cancel all existing notifications first
    await notifee.cancelAllNotifications();

    const now = new Date();

    for (const hour of FIXED_HOURS) {
      const triggerDate = new Date();
      triggerDate.setHours(hour, 0, 0, 0); // Set to exactly on the hour

      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const notificationId = `reminder-${hour}`;

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: '📞 Call Tracker Reminder',
          body: 'Time to sync your call logs and recordings!',
          android: {
            channelId: 'default',
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            importance: 4, // HIGH
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.getTime(),
          alarmManager: {
            allowWhileIdle: true,
          },
        },
      );
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
}
