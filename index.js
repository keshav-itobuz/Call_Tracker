/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import './src/services/notifications/background';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Handle notification press when app is killed or in background
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@CallTracker:shouldSync', 'true');
  }
});

AppRegistry.registerComponent(appName, () => App);
