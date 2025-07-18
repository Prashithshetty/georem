import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import GeofenceSetupUtil from '../utils/GeofenceSetupUtil';
import ReminderStorage from '../store/storage';

/**
 * Custom hook for handling geofence triggers and notifications
 * Manages the lifecycle of geofencing service and notification handling
 */
const useGeofenceTrigger = () => {
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Initialize geofencing service
    const initializeGeofencing = async () => {
      try {
        await GeofenceSetupUtil.initialize();
        console.log('[useGeofenceTrigger] Geofencing initialized');
      } catch (error) {
        console.error('[useGeofenceTrigger] Failed to initialize geofencing:', error);
      }
    };

    // Setup notification listeners
    const setupNotificationListeners = () => {
      // Listen for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('[useGeofenceTrigger] Notification received:', notification);
        
        // Handle geofence trigger notifications
        if (notification.request.content.data?.type === 'geofence_trigger') {
          handleGeofenceNotification(notification.request.content.data);
        }
      });

      // Listen for user interactions with notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('[useGeofenceTrigger] Notification response:', response);
        
        // Handle user tapping on geofence notifications
        if (response.notification.request.content.data?.type === 'geofence_trigger') {
          handleNotificationTap(response.notification.request.content.data);
        }
      });
    };

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useGeofenceTrigger] App has come to the foreground');
        // Refresh geofencing status when app becomes active
        refreshGeofencingStatus();
      }
      appState.current = nextAppState;
    };

    // Initialize everything
    initializeGeofencing();
    setupNotificationListeners();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      subscription?.remove();
    };
  }, []);

  /**
   * Handle geofence trigger notifications
   * @param {Object} data - Notification data
   */
  const handleGeofenceNotification = async (data) => {
    try {
      const { reminderId } = data;
      
      // Get reminder details from storage
      const reminder = await ReminderStorage.getReminderById(reminderId);
      if (!reminder) {
        console.warn('[useGeofenceTrigger] Reminder not found:', reminderId);
        return;
      }

      // Log the trigger event
      console.log(`[useGeofenceTrigger] Geofence triggered for: ${reminder.title}`);
      
      // You can add additional logic here, such as:
      // - Updating reminder statistics
      // - Logging trigger events
      // - Custom notification sounds based on reminder type
      
    } catch (error) {
      console.error('[useGeofenceTrigger] Error handling geofence notification:', error);
    }
  };

  /**
   * Handle user tapping on notification
   * @param {Object} data - Notification data
   */
  const handleNotificationTap = async (data) => {
    try {
      const { reminderId } = data;
      
      // Get reminder details
      const reminder = await ReminderStorage.getReminderById(reminderId);
      if (!reminder) {
        console.warn('[useGeofenceTrigger] Reminder not found for tap:', reminderId);
        return;
      }

      console.log(`[useGeofenceTrigger] User tapped notification for: ${reminder.title}`);
      
      // You can navigate to a specific screen or show reminder details
      // This would require navigation context or a callback function
      
    } catch (error) {
      console.error('[useGeofenceTrigger] Error handling notification tap:', error);
    }
  };

  /**
   * Refresh geofencing status and sync with stored reminders
   */
  const refreshGeofencingStatus = async () => {
    try {
      const status = await GeofenceSetupUtil.getStatus();
      console.log('[useGeofenceTrigger] Geofencing status:', status);
      
      // Get all reminders from storage
      const reminders = await ReminderStorage.getAllReminders();
      
      // Check if any reminders need geofences setup
      for (const reminder of reminders) {
        if (reminder.location && !status.activeGeofences.includes(reminder.id)) {
          console.log(`[useGeofenceTrigger] Setting up missing geofence for: ${reminder.title}`);
          
          await GeofenceSetupUtil.setupGeofence({
            location: reminder.location,
            radius: reminder.radius || 200,
            reminderId: reminder.id,
            title: reminder.title,
            checklist: reminder.checklist || [],
          });
        }
      }
      
    } catch (error) {
      console.error('[useGeofenceTrigger] Error refreshing geofencing status:', error);
    }
  };

  /**
   * Setup geofence for a new reminder
   * @param {Object} reminder - Reminder object
   * @returns {Promise<boolean>} Success status
   */
  const setupReminderGeofence = async (reminder) => {
    try {
      if (!reminder.location) {
        console.warn('[useGeofenceTrigger] No location provided for reminder');
        return false;
      }

      const success = await GeofenceSetupUtil.setupGeofence({
        location: reminder.location,
        radius: reminder.radius || 200,
        reminderId: reminder.id,
        title: reminder.title,
        checklist: reminder.checklist || [],
      });

      if (success) {
        console.log(`[useGeofenceTrigger] Geofence setup successful for: ${reminder.title}`);
      } else {
        console.error(`[useGeofenceTrigger] Geofence setup failed for: ${reminder.title}`);
      }

      return success;
    } catch (error) {
      console.error('[useGeofenceTrigger] Error setting up reminder geofence:', error);
      return false;
    }
  };

  /**
   * Remove geofence for a reminder
   * @param {string} reminderId - Reminder ID
   * @returns {Promise<boolean>} Success status
   */
  const removeReminderGeofence = async (reminderId) => {
    try {
      const success = await GeofenceSetupUtil.removeGeofence(reminderId);
      
      if (success) {
        console.log(`[useGeofenceTrigger] Geofence removed for reminder: ${reminderId}`);
      } else {
        console.error(`[useGeofenceTrigger] Failed to remove geofence for: ${reminderId}`);
      }

      return success;
    } catch (error) {
      console.error('[useGeofenceTrigger] Error removing reminder geofence:', error);
      return false;
    }
  };

  /**
   * Get current geofencing status
   * @returns {Promise<Object>} Status object
   */
  const getGeofencingStatus = async () => {
    try {
      return await GeofenceSetupUtil.getStatus();
    } catch (error) {
      console.error('[useGeofenceTrigger] Error getting status:', error);
      return {
        enabled: false,
        tracking: false,
        geofenceCount: 0,
        activeGeofences: [],
      };
    }
  };

  /**
   * Test notification system
   * @returns {Promise<void>}
   */
  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from GeoRem',
          sound: 'default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null,
      });
      console.log('[useGeofenceTrigger] Test notification sent');
    } catch (error) {
      console.error('[useGeofenceTrigger] Test notification failed:', error);
    }
  };

  return {
    setupReminderGeofence,
    removeReminderGeofence,
    getGeofencingStatus,
    refreshGeofencingStatus,
    testNotification,
  };
};

export default useGeofenceTrigger;
