import notifee, { TriggerType } from '@notifee/react-native';

const FIXED_HOURS = [12, 16, 18, 20]; // 11am, 4pm, 6pm, 8pm

export async function scheduleDailyNotifications() {
  try {
    // Cancel all existing notifications first
    await notifee.cancelAllNotifications();
    console.log('Cancelled all existing notifications');

    const now = new Date();
    console.log('Current time:', now.toLocaleString());

    for (const hour of FIXED_HOURS) {
      const triggerDate = new Date();
      triggerDate.setHours(hour, 8, 0, 0); // Set to exactly on the hour

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

      console.log(
        `Scheduled notification ${notificationId} for ${triggerDate.toLocaleString()}`,
      );
    }

    // Get all scheduled notifications to verify
    const notifications = await notifee.getTriggerNotifications();
    console.log(`Total scheduled notifications: ${notifications.length}`);
    notifications.forEach(n => {
      const trigger = n.trigger as any;
      const timestamp = trigger.timestamp
        ? new Date(trigger.timestamp).toLocaleString()
        : 'unknown';
      console.log(`- ${n.notification.id}: ${timestamp}`);
    });
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
}
