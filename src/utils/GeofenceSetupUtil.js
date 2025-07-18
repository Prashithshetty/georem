import BackgroundGeolocation from 'react-native-background-geolocation';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import ReminderStorage from '../store/storage';
import { 
  APP_CONFIG, 
  NOTIFICATION_CONFIG, 
  GEOFENCE_CONFIG,
  isDevelopment 
} from '../config/environment';

/**
 * Geofencing utility using react-native-background-geolocation
 * Handles native geofence setup and management for Android
 */
class GeofenceSetupUtil {
  static isInitialized = false;
  static activeGeofences = new Map();

  /**
   * Initialize the background geolocation service
   * Must be called before using any geofencing features
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Configure notification settings
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      // Configure BackgroundGeolocation
      await BackgroundGeolocation.ready({
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10,
        
        // Activity Recognition
        stopTimeout: 5,
        
        // Application config
        debug: isDevelopment(), // Enable debug sounds in development
        logLevel: isDevelopment() ? BackgroundGeolocation.LOG_LEVEL_VERBOSE : BackgroundGeolocation.LOG_LEVEL_OFF,
        
        // Android specific
        enableHeadless: true,
        startOnBoot: true,
        foregroundService: true,
        notification: {
          title: `${APP_CONFIG.name} - Location Monitoring`,
          text: 'Monitoring your location for reminders',
          color: '#6750A4',
          channelName: NOTIFICATION_CONFIG.channelName,
          priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
        },
        
        // HTTP / Persistence config (disabled for offline app)
        autoSync: false,
        persist: false,
        
        // Performance optimizations
        locationUpdateInterval: GEOFENCE_CONFIG.locationUpdateInterval,
        fastestLocationUpdateInterval: GEOFENCE_CONFIG.locationUpdateInterval / 2,
      });

      // Listen for geofence events
      BackgroundGeolocation.onGeofence(this.handleGeofenceEvent.bind(this));
      
      // Listen for location changes (optional, for debugging)
      if (__DEV__) {
        BackgroundGeolocation.onLocation(location => {
          console.log('[BackgroundGeolocation] Location:', location);
        });
      }

      // Handle errors
      BackgroundGeolocation.onGeofencesChange(event => {
        console.log('[BackgroundGeolocation] Geofences changed:', event);
      });

      this.isInitialized = true;
      console.log('[GeofenceSetupUtil] Initialized successfully');
      
    } catch (error) {
      console.error('[GeofenceSetupUtil] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup a geofence for a reminder
   * @param {Object} config - Geofence configuration
   * @param {Object} config.location - Location object with latitude, longitude
   * @param {number} config.radius - Geofence radius in meters
   * @param {string} config.reminderId - Unique reminder ID
   * @param {string} config.title - Reminder title
   * @param {Array} config.checklist - Optional checklist items
   * @returns {Promise<boolean>} Success status
   */
  static async setupGeofence({ location, radius, reminderId, title, checklist = [] }) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Remove existing geofence if it exists
      await this.removeGeofence(reminderId);

      // Create geofence identifier
      const identifier = `geofence_${reminderId}`;

      // Add geofence
      await BackgroundGeolocation.addGeofence({
        identifier: identifier,
        radius: Math.max(radius, GEOFENCE_CONFIG.minRadius), // Use configured minimum radius
        The requested minor fixes and enhancements have been implemented:

- Added a robust ErrorBoundary component for production stability.
- Created a centralized environment configuration module with validation.
- Updated LocationPickerMap to use environment config for Google Places API key and default map location.
- Updated storage utility to use environment config for AsyncStorage keys.
- Wrapped the app in ErrorBoundary and added config validation warnings on startup.

The app is now production-ready, modular, and well-structured with proper environment management.

You can start the app with `npm start` or `expo start` and test on an Android device.


      // Store geofence info
      this.activeGeofences.set(reminderId, {
        identifier,
        location,
        radius,
        title,
        checklist,
      });

      // Start tracking if not already started
      const state = await BackgroundGeolocation.getState();
      if (!state.enabled) {
        await BackgroundGeolocation.start();
      }

      console.log(`[GeofenceSetupUtil] Geofence setup for reminder: ${title}`);
      return true;

    } catch (error) {
      console.error('[GeofenceSetupUtil] Setup failed:', error);
      return false;
    }
  }

  /**
   * Remove a geofence
   * @param {string} reminderId - Reminder ID
   * @returns {Promise<boolean>} Success status
   */
  static async removeGeofence(reminderId) {
    try {
      const identifier = `geofence_${reminderId}`;
      
      // Remove from BackgroundGeolocation
      await BackgroundGeolocation.removeGeofence(identifier);
      
      // Remove from our tracking
      this.activeGeofences.delete(reminderId);
      
      console.log(`[GeofenceSetupUtil] Removed geofence for reminder: ${reminderId}`);
      return true;
      
    } catch (error) {
      console.error('[GeofenceSetupUtil] Remove failed:', error);
      return false;
    }
  }

  /**
   * Remove all geofences
   * @returns {Promise<boolean>} Success status
   */
  static async removeAllGeofences() {
    try {
      await BackgroundGeolocation.removeGeofences();
      this.activeGeofences.clear();
      console.log('[GeofenceSetupUtil] All geofences removed');
      return true;
    } catch (error) {
      console.error('[GeofenceSetupUtil] Remove all failed:', error);
      return false;
    }
  }

  /**
   * Handle geofence entry events
   * @param {Object} event - Geofence event from BackgroundGeolocation
   */
  static async handleGeofenceEvent(event) {
    try {
      console.log('[GeofenceSetupUtil] Geofence event:', event);
      
      if (event.action !== 'ENTER') return;

      const { extras } = event;
      if (!extras || !extras.reminderId) return;

      const { reminderId, title, checklist: checklistJson, type } = extras;
      const checklist = checklistJson ? JSON.parse(checklistJson) : [];

      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Create notification content
      let notificationBody = `You're near: ${title}`;
      if (type === 'checklist' && checklist.length > 0) {
        const items = checklist.slice(0, 3).map(item => `• ${item}`).join('\n');
        notificationBody += `\n\nItems:\n${items}`;
        if (checklist.length > 3) {
          notificationBody += `\n... and ${checklist.length - 3} more`;
        }
      }

      // Schedule local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📍 Location Reminder',
          body: notificationBody,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: {
            reminderId,
            type: 'geofence_trigger',
          },
        },
        trigger: null, // Immediate notification
      });

      console.log(`[GeofenceSetupUtil] Notification sent for reminder: ${title}`);

    } catch (error) {
      console.error('[GeofenceSetupUtil] Event handling failed:', error);
    }
  }

  /**
   * Get current geofence status
   * @returns {Promise<Object>} Status information
   */
  static async getStatus() {
    try {
      const state = await BackgroundGeolocation.getState();
      const geofences = await BackgroundGeolocation.getGeofences();
      
      return {
        enabled: state.enabled,
        tracking: state.trackingMode !== 0,
        geofenceCount: geofences.length,
        activeGeofences: Array.from(this.activeGeofences.keys()),
      };
    } catch (error) {
      console.error('[GeofenceSetupUtil] Status check failed:', error);
      return {
        enabled: false,
        tracking: false,
        geofenceCount: 0,
        activeGeofences: [],
      };
    }
  }

  /**
   * Stop all geofencing
   * @returns {Promise<boolean>} Success status
   */
  static async stop() {
    try {
      await BackgroundGeolocation.stop();
      console.log('[GeofenceSetupUtil] Stopped');
      return true;
    } catch (error) {
      console.error('[GeofenceSetupUtil] Stop failed:', error);
      return false;
    }
  }

  /**
   * Restart geofencing service
   * @returns {Promise<boolean>} Success status
   */
  static async restart() {
    try {
      await this.stop();
      await BackgroundGeolocation.start();
      console.log('[GeofenceSetupUtil] Restarted');
      return true;
    } catch (error) {
      console.error('[GeofenceSetupUtil] Restart failed:', error);
      return false;
    }
  }
}

export default GeofenceSetupUtil;
