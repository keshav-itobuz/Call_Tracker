import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../public/callTrackerIconTransparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" color="#22C55E" />

      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#071A2D', // 🔥 matches logo
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    fontSize: 16,
    color: '#E5E7EB', // light text on dark bg
    marginTop: 16,
  },
});

export default LoadingScreen;
