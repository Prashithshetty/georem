import React, { useEffect } from 'react';
import { Alert, Platform, LogBox, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MainScreen from './src/screens/MainScreen';
import { colors } from './src/styles/styles';
import GeofenceManager from './src/services/GeofenceManager';
import NotificationService from './src/services/NotificationService';
import StorageService from './src/services/StorageService';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

const AppContent = () => {
  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Location Reminder App...');
        
        // Initialize storage first
        const storageInitialized = await StorageService.initialize();
        if (!storageInitialized) {
          throw new Error('Failed to initialize storage');
        }
        console.log('✅ Storage initialized');
        
        // Request notification permissions
        const notificationPermissions = await NotificationService.requestPermissions();
        console.log('📱 Notification permissions:', notificationPermissions);
        
        // Initialize geofence manager
        const geofenceInitialized = await GeofenceManager.initialize();
        
        if (geofenceInitialized) {
          console.log('✅ Geofencing system initialized successfully');
          console.log('🔔 Notifications will work when app is in background');
          console.log('📍 Location monitoring active');
        } else {
          console.warn('⚠️ Geofencing system initialization failed');
          
          // Show user-friendly error for permissions
          Alert.alert(
            'Location Permission Required',
            'This app needs location permissions to send you reminders when you arrive at specific locations. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    // iOS: Open app settings
                    Linking.openURL('app-settings:');
                  } else {
                    // Android: Open app settings
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }

        // Check notification permissions
        if (!notificationPermissions.alert) {
          setTimeout(() => {
            Alert.alert(
              'Notification Permission Required',
              'Please enable notifications to receive location-based reminders when you arrive at your saved locations.',
              [{ text: 'OK' }]
            );
          }, 1000);
        }
        
        console.log('✅ App initialization complete');
        
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        Alert.alert(
          'Setup Error',
          'There was an error setting up the app. Some features may not work properly. Please restart the app.',
          [{ text: 'OK' }]
        );
      }
    };

    initializeApp();

    // Cleanup on app unmount
    return () => {
      console.log('🧹 Cleaning up app services...');
      // Note: We don't clean up GeofenceManager here as it should persist
      // Only clean up on explicit user action or app uninstall
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.surface} />
      <MainScreen />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
