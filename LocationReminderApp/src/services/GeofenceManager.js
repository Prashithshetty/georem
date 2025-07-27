import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NotificationService from './NotificationService';

const LOCATION_TASK_NAME = 'background-location-task';
const GEOFENCE_CHECK_TASK = 'geofence-check-task';

// Define the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    console.log('Received new locations', locations);
    // Process location updates in background
    GeofenceManager.handleBackgroundLocationUpdate(locations[0]);
  }
});

// Define the background fetch task for geofence checking
TaskManager.defineTask(GEOFENCE_CHECK_TASK, async () => {
  try {
    console.log('Background geofence check started');
    await GeofenceManager.performBackgroundGeofenceCheck();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background geofence check error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

class GeofenceManager {
  constructor() {
    this.activeGeofences = new Map();
    this.isMonitoring = false;
    this.locationSubscription = null;
    this.lastKnownLocation = null;
  }

  // Initialize the geofence manager
  async initialize() {
    try {
      console.log('Initializing Expo GeofenceManager...');
      
      // Request location permissions
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permissions not granted');
      }

      // Request notification permissions
      await NotificationService.requestPermissions();

      // Register background tasks
      await this.registerBackgroundTasks();

      // Load existing geofences from storage
      await this.loadGeofencesFromStorage();
      
      // Start monitoring if there are active geofences
      if (this.activeGeofences.size > 0) {
        await this.startMonitoring();
      }

      console.log('Expo GeofenceManager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Expo GeofenceManager:', error);
      return false;
    }
  }

  // Request location permissions
  async requestLocationPermissions() {
    try {
      // Request foreground location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Foreground location permission not granted');
        return false;
      }

      // Request background location permission
      if (Platform.OS === 'android') {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== 'granted') {
          console.warn('Background location permission not granted');
          // Continue without background location for basic functionality
        }
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Register background tasks
  async registerBackgroundTasks() {
    try {
      // Register background fetch for geofence checking
      await BackgroundFetch.registerTaskAsync(GEOFENCE_CHECK_TASK, {
        minimumInterval: 15 * 60, // 15 minutes (minimum allowed)
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background tasks registered successfully');
    } catch (error) {
      console.error('Error registering background tasks:', error);
    }
  }

  // Add a new geofence for a reminder
  async addGeofence(reminder) {
    try {
      const geofenceId = `geofence_${reminder.id}`;
      
      const geofenceData = {
        id: geofenceId,
        reminderId: reminder.id,
        latitude: reminder.locationData.latitude,
        longitude: reminder.locationData.longitude,
        radius: reminder.locationData.radius || 100,
        title: reminder.title,
        reminderType: reminder.type,
        reminderContent: reminder.content,
        locationName: reminder.location,
        isActive: true,
        createdAt: new Date().toISOString(),
        triggeredCount: 0,
        lastTriggered: null,
        transitionType: 'ENTER',
      };

      // Add to active geofences
      this.activeGeofences.set(geofenceId, geofenceData);

      // Save to storage
      await this.saveGeofencesToStorage();
      
      // Save reminder data separately for background access
      await this.saveReminderData(reminder);

      // Start monitoring if not already started
      if (!this.isMonitoring) {
        await this.startMonitoring();
      }

      // Show setup notification
      NotificationService.showGeofenceSetupNotification(reminder);

      console.log(`Geofence added for reminder: ${reminder.title} (radius: ${geofenceData.radius}m)`);
      return geofenceData;
    } catch (error) {
      console.error('Error adding geofence:', error);
      throw error;
    }
  }

  // Save reminder data for background access
  async saveReminderData(reminder) {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      let reminders = storedReminders ? JSON.parse(storedReminders) : [];
      
      // Update or add reminder
      const existingIndex = reminders.findIndex(r => r.id === reminder.id);
      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push(reminder);
      }
      
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminder data:', error);
    }
  }

  // Remove a geofence
  async removeGeofence(reminderId) {
    try {
      const geofenceId = `geofence_${reminderId}`;
      const geofence = this.activeGeofences.get(geofenceId);

      if (geofence) {
        this.activeGeofences.delete(geofenceId);
        await this.saveGeofencesToStorage();

        // Stop monitoring if no active geofences
        if (this.activeGeofences.size === 0) {
          this.stopMonitoring();
        }

        console.log(`Geofence removed for reminder ID: ${reminderId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing geofence:', error);
      return false;
    }
  }

  // Start location monitoring
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('Already monitoring location');
      return;
    }

    try {
      console.log('Starting geofence monitoring...');
      this.isMonitoring = true;

      // Start foreground location watching
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute in background
        distanceInterval: 50, // 50 meters in background
        foregroundService: {
          notificationTitle: 'Location Reminders Active',
          notificationBody: 'Monitoring your location for reminders',
        },
      });

      console.log('Geofence monitoring started');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.isMonitoring = false;
    }
  }

  // Stop location monitoring
  async stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('Stopping geofence monitoring...');

    try {
      // Stop foreground location watching
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      // Stop background location updates
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      this.isMonitoring = false;
      console.log('Geofence monitoring stopped');
    } catch (error) {
      console.error('Error stopping monitoring:', error);
    }
  }

  // Handle location updates
  handleLocationUpdate(location) {
    const currentLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(location.timestamp).toISOString(),
    };

    console.log('Location update:', currentLocation);
    this.lastKnownLocation = currentLocation;

    // Check all active geofences
    this.checkGeofences(currentLocation);
  }

  // Handle background location updates
  static async handleBackgroundLocationUpdate(location) {
    try {
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
      };

      console.log('Background location update:', currentLocation);
      
      // Load geofences from storage
      const storedGeofences = await AsyncStorage.getItem('activeGeofences');
      if (storedGeofences) {
        const geofencesArray = JSON.parse(storedGeofences);
        const activeGeofences = new Map();
        geofencesArray.forEach((geofence) => {
          activeGeofences.set(geofence.id, geofence);
        });

        // Check geofences
        GeofenceManager.prototype.checkGeofences.call({ activeGeofences }, currentLocation);
      }
    } catch (error) {
      console.error('Error handling background location update:', error);
    }
  }

  // Perform background geofence check
  static async performBackgroundGeofenceCheck() {
    try {
      console.log('Performing background geofence check...');
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      // Load and check geofences
      const storedGeofences = await AsyncStorage.getItem('activeGeofences');
      if (storedGeofences) {
        const geofencesArray = JSON.parse(storedGeofences);
        const activeGeofences = new Map();
        geofencesArray.forEach((geofence) => {
          activeGeofences.set(geofence.id, geofence);
        });

        // Check geofences
        GeofenceManager.prototype.checkGeofences.call({ activeGeofences }, currentLocation);
      }
    } catch (error) {
      console.error('Error during background geofence check:', error);
    }
  }

  // Check if current location triggers any geofences
  checkGeofences(currentLocation) {
    this.activeGeofences.forEach((geofence, geofenceId) => {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInsideGeofence = distance <= geofence.radius;
      const wasInsideGeofence = geofence.wasInside || false;

      // Check for ENTER transition
      if (isInsideGeofence && !wasInsideGeofence) {
        this.handleGeofenceTransition(geofence, 'ENTER', currentLocation);
      }
      // Check for EXIT transition
      else if (!isInsideGeofence && wasInsideGeofence) {
        this.handleGeofenceTransition(geofence, 'EXIT', currentLocation);
      }

      // Update the geofence state
      geofence.wasInside = isInsideGeofence;
      geofence.lastChecked = currentLocation.timestamp;
    });
  }

  // Handle geofence transition events
  async handleGeofenceTransition(geofence, transitionType, location) {
    try {
      console.log(`Geofence ${transitionType}: ${geofence.title}`);

      // Update geofence data
      geofence.triggeredCount += 1;
      geofence.lastTriggered = location.timestamp;
      geofence.lastTransitionType = transitionType;

      // Save updated geofence data
      await this.saveGeofencesToStorage();

      // Load the full reminder data from storage
      const fullReminder = await this.loadReminderData(geofence.reminderId);
      
      // Create reminder object for notification
      const reminder = fullReminder || {
        id: geofence.reminderId,
        title: geofence.title,
        type: geofence.reminderType || 'sentence',
        content: geofence.reminderContent || 'Location-based reminder triggered',
        location: geofence.locationName || `${geofence.latitude.toFixed(6)}, ${geofence.longitude.toFixed(6)}`,
        locationData: {
          latitude: geofence.latitude,
          longitude: geofence.longitude,
          radius: geofence.radius,
        },
      };

      // Show notification
      NotificationService.showGeofenceNotification(reminder, transitionType);

    } catch (error) {
      console.error('Error handling geofence transition:', error);
    }
  }

  // Load full reminder data from storage
  async loadReminderData(reminderId) {
    try {
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        const reminders = JSON.parse(storedReminders);
        return reminders.find(reminder => reminder.id === reminderId);
      }
    } catch (error) {
      console.error('Error loading reminder data:', error);
    }
    return null;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Save geofences to AsyncStorage
  async saveGeofencesToStorage() {
    try {
      const geofencesArray = Array.from(this.activeGeofences.values());
      await AsyncStorage.setItem('activeGeofences', JSON.stringify(geofencesArray));
    } catch (error) {
      console.error('Error saving geofences to storage:', error);
    }
  }

  // Load geofences from AsyncStorage
  async loadGeofencesFromStorage() {
    try {
      const storedGeofences = await AsyncStorage.getItem('activeGeofences');
      if (storedGeofences) {
        const geofencesArray = JSON.parse(storedGeofences);
        this.activeGeofences.clear();
        geofencesArray.forEach((geofence) => {
          this.activeGeofences.set(geofence.id, geofence);
        });
        console.log(`Loaded ${geofencesArray.length} geofences from storage`);
      }
    } catch (error) {
      console.error('Error loading geofences from storage:', error);
    }
  }

  // Get all active geofences
  getActiveGeofences() {
    return Array.from(this.activeGeofences.values());
  }

  // Get geofence by reminder ID
  getGeofenceByReminderId(reminderId) {
    const geofenceId = `geofence_${reminderId}`;
    return this.activeGeofences.get(geofenceId);
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      activeGeofencesCount: this.activeGeofences.size,
      lastKnownLocation: this.lastKnownLocation,
    };
  }

  // Cleanup
  async cleanup() {
    await this.stopMonitoring();
    
    // Unregister background tasks
    try {
      await BackgroundFetch.unregisterTaskAsync(GEOFENCE_CHECK_TASK);
    } catch (error) {
      console.error('Error unregistering background tasks:', error);
    }
    
    this.activeGeofences.clear();
    await AsyncStorage.removeItem('activeGeofences');
    await AsyncStorage.removeItem('reminders');
    console.log('Expo GeofenceManager cleanup completed');
  }
}

// Export singleton instance
export default new GeofenceManager();
