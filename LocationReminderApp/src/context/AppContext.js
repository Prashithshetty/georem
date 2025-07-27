import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import GeofenceManager from '../services/GeofenceManager';
import NotificationService from '../services/NotificationService';
import { Alert } from 'react-native';

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App Provider component
export const AppProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState(null);
  const [geofenceStatus, setGeofenceStatus] = useState({
    isMonitoring: false,
    activeGeofencesCount: 0,
    lastKnownLocation: null,
  });
  const [error, setError] = useState(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize app data and services
  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize storage
      await StorageService.initialize();

      // Load reminders
      const loadedReminders = await StorageService.getActiveReminders();
      setReminders(loadedReminders);

      // Load settings
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);

      // Update geofence status
      const status = GeofenceManager.getMonitoringStatus();
      setGeofenceStatus(status);

      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
      setError('Failed to initialize app. Please restart.');
      Alert.alert(
        'Initialization Error',
        'There was an error loading your data. Please restart the app.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh reminders
  const refreshReminders = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const loadedReminders = await StorageService.getActiveReminders();
      setReminders(loadedReminders);

      // Update geofence status
      const status = GeofenceManager.getMonitoringStatus();
      setGeofenceStatus(status);

      return true;
    } catch (error) {
      console.error('Error refreshing reminders:', error);
      setError('Failed to refresh reminders');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Add a new reminder
  const addReminder = useCallback(async (reminderData) => {
    try {
      setError(null);

      // Save to storage
      const newReminder = await StorageService.addReminder(reminderData);

      // Add geofence
      try {
        await GeofenceManager.addGeofence(newReminder);
        console.log('Geofence added successfully');
      } catch (geofenceError) {
        console.error('Error adding geofence:', geofenceError);
        Alert.alert(
          'Geofence Warning',
          'The reminder was saved but location monitoring could not be activated. Please check your location permissions.',
          [{ text: 'OK' }]
        );
      }

      // Update local state
      setReminders(prevReminders => [newReminder, ...prevReminders]);

      // Update geofence status
      const status = GeofenceManager.getMonitoringStatus();
      setGeofenceStatus(status);

      return newReminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      setError('Failed to add reminder');
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
      throw error;
    }
  }, []);

  // Update a reminder
  const updateReminder = useCallback(async (id, updates) => {
    try {
      setError(null);

      const updatedReminder = await StorageService.updateReminder(id, updates);
      
      if (updatedReminder) {
        // Update local state
        setReminders(prevReminders =>
          prevReminders.map(reminder =>
            reminder.id === id ? updatedReminder : reminder
          )
        );

        // Update geofence if location changed
        if (updates.locationData) {
          await GeofenceManager.removeGeofence(id);
          await GeofenceManager.addGeofence(updatedReminder);
        }

        return updatedReminder;
      }

      return null;
    } catch (error) {
      console.error('Error updating reminder:', error);
      setError('Failed to update reminder');
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
      throw error;
    }
  }, []);

  // Delete a reminder
  const deleteReminder = useCallback(async (id) => {
    try {
      setError(null);

      // Show confirmation dialog
      return new Promise((resolve) => {
        Alert.alert(
          'Delete Reminder',
          'Are you sure you want to delete this reminder?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Remove geofence
                  await GeofenceManager.removeGeofence(id);

                  // Delete from storage
                  const success = await StorageService.deleteReminder(id);

                  if (success) {
                    // Update local state
                    setReminders(prevReminders =>
                      prevReminders.filter(reminder => reminder.id !== id)
                    );

                    // Update geofence status
                    const status = GeofenceManager.getMonitoringStatus();
                    setGeofenceStatus(status);

                    resolve(true);
                  } else {
                    resolve(false);
                  }
                } catch (error) {
                  console.error('Error deleting reminder:', error);
                  Alert.alert('Error', 'Failed to delete reminder. Please try again.');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      setError('Failed to delete reminder');
      return false;
    }
  }, []);

  // Toggle reminder status
  const toggleReminderStatus = useCallback(async (id) => {
    try {
      setError(null);

      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return null;

      const updatedReminder = await StorageService.toggleReminderStatus(id);
      
      if (updatedReminder) {
        // Update geofence
        if (updatedReminder.isActive) {
          await GeofenceManager.addGeofence(updatedReminder);
        } else {
          await GeofenceManager.removeGeofence(id);
        }

        // Update local state
        setReminders(prevReminders =>
          prevReminders.map(r =>
            r.id === id ? updatedReminder : r
          )
        );

        // Update geofence status
        const status = GeofenceManager.getMonitoringStatus();
        setGeofenceStatus(status);

        return updatedReminder;
      }

      return null;
    } catch (error) {
      console.error('Error toggling reminder status:', error);
      setError('Failed to update reminder status');
      Alert.alert('Error', 'Failed to update reminder status. Please try again.');
      throw error;
    }
  }, [reminders]);

  // Update checklist item
  const updateChecklistItem = useCallback(async (reminderId, itemId, updates) => {
    try {
      setError(null);

      const updatedReminder = await StorageService.updateChecklistItem(reminderId, itemId, updates);
      
      if (updatedReminder) {
        // Update local state
        setReminders(prevReminders =>
          prevReminders.map(reminder =>
            reminder.id === reminderId ? updatedReminder : reminder
          )
        );

        return updatedReminder;
      }

      return null;
    } catch (error) {
      console.error('Error updating checklist item:', error);
      setError('Failed to update checklist item');
      throw error;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setError(null);

      const success = await StorageService.saveSettings(newSettings);
      
      if (success) {
        setSettings(newSettings);
        
        // Apply notification settings
        if (newSettings.notificationsEnabled === false) {
          await NotificationService.cancelAllNotifications();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      throw error;
    }
  }, []);

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      setError(null);

      return new Promise((resolve) => {
        Alert.alert(
          'Clear All Data',
          'This will delete all your reminders and reset the app. Are you sure?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Clear All',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Clean up geofences
                  await GeofenceManager.cleanup();

                  // Clear storage
                  await StorageService.clearAllData();

                  // Reset state
                  setReminders([]);
                  setSettings(StorageService.getDefaultSettings());
                  setGeofenceStatus({
                    isMonitoring: false,
                    activeGeofencesCount: 0,
                    lastKnownLocation: null,
                  });

                  resolve(true);
                } catch (error) {
                  console.error('Error clearing data:', error);
                  Alert.alert('Error', 'Failed to clear data. Please try again.');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error in clearAllData:', error);
      setError('Failed to clear data');
      return false;
    }
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    try {
      setError(null);
      const data = await StorageService.exportData();
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
      Alert.alert('Error', 'Failed to export data. Please try again.');
      throw error;
    }
  }, []);

  // Import data
  const importData = useCallback(async (data) => {
    try {
      setError(null);

      const success = await StorageService.importData(data);
      
      if (success) {
        // Reload app data
        await initializeApp();
        Alert.alert('Success', 'Data imported successfully!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      setError('Failed to import data');
      Alert.alert('Error', 'Failed to import data. Please check the file and try again.');
      throw error;
    }
  }, []);

  // Context value
  const value = {
    // State
    reminders,
    isLoading,
    isRefreshing,
    settings,
    geofenceStatus,
    error,

    // Actions
    refreshReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderStatus,
    updateChecklistItem,
    updateSettings,
    clearAllData,
    exportData,
    importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
