import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  REMINDERS: '@LocationReminder:reminders',
  SETTINGS: '@LocationReminder:settings',
  GEOFENCES: '@LocationReminder:geofences',
  APP_VERSION: '@LocationReminder:version',
};

class StorageService {
  constructor() {
    this.currentVersion = '1.0.0';
  }

  // Initialize storage and handle migrations
  async initialize() {
    try {
      const storedVersion = await this.getAppVersion();
      
      if (!storedVersion) {
        // First time app launch
        await this.setAppVersion(this.currentVersion);
        await this.initializeDefaultData();
      } else if (storedVersion !== this.currentVersion) {
        // Handle migrations if needed
        await this.migrateData(storedVersion, this.currentVersion);
        await this.setAppVersion(this.currentVersion);
      }
      
      return true;
    } catch (error) {
      console.error('Storage initialization error:', error);
      return false;
    }
  }

  // Initialize default data
  async initializeDefaultData() {
    try {
      const existingReminders = await this.getReminders();
      if (!existingReminders || existingReminders.length === 0) {
        await this.saveReminders([]);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  // Get app version
  async getAppVersion() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);
    } catch (error) {
      console.error('Error getting app version:', error);
      return null;
    }
  }

  // Set app version
  async setAppVersion(version) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_VERSION, version);
    } catch (error) {
      console.error('Error setting app version:', error);
    }
  }

  // Migrate data between versions
  async migrateData(fromVersion, toVersion) {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    // Add migration logic here as needed
  }

  // Save reminders
  async saveReminders(reminders) {
    try {
      const jsonValue = JSON.stringify(reminders);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving reminders:', error);
      return false;
    }
  }

  // Get all reminders
  async getReminders() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Get active reminders
  async getActiveReminders() {
    try {
      const reminders = await this.getReminders();
      return reminders.filter(reminder => reminder.isActive);
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  }

  // Get reminder by ID
  async getReminderById(id) {
    try {
      const reminders = await this.getReminders();
      return reminders.find(reminder => reminder.id === id);
    } catch (error) {
      console.error('Error getting reminder by ID:', error);
      return null;
    }
  }

  // Add a new reminder
  async addReminder(reminder) {
    try {
      const reminders = await this.getReminders();
      const newReminder = {
        ...reminder,
        id: reminder.id || Date.now().toString(),
        createdAt: reminder.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      reminders.unshift(newReminder);
      await this.saveReminders(reminders);
      
      return newReminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  }

  // Update a reminder
  async updateReminder(id, updates) {
    try {
      const reminders = await this.getReminders();
      const index = reminders.findIndex(reminder => reminder.id === id);
      
      if (index !== -1) {
        reminders[index] = {
          ...reminders[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        await this.saveReminders(reminders);
        return reminders[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  // Delete a reminder
  async deleteReminder(id) {
    try {
      const reminders = await this.getReminders();
      const filteredReminders = reminders.filter(reminder => reminder.id !== id);
      
      if (filteredReminders.length < reminders.length) {
        await this.saveReminders(filteredReminders);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  // Toggle reminder active status
  async toggleReminderStatus(id) {
    try {
      const reminder = await this.getReminderById(id);
      if (reminder) {
        return await this.updateReminder(id, { isActive: !reminder.isActive });
      }
      return null;
    } catch (error) {
      console.error('Error toggling reminder status:', error);
      throw error;
    }
  }

  // Update checklist item
  async updateChecklistItem(reminderId, itemId, updates) {
    try {
      const reminder = await this.getReminderById(reminderId);
      if (reminder && reminder.type === 'checklist') {
        const updatedContent = reminder.content.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        );
        
        return await this.updateReminder(reminderId, { content: updatedContent });
      }
      return null;
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }

  // Save settings
  async saveSettings(settings) {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Get settings
  async getSettings() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return jsonValue != null ? JSON.parse(jsonValue) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Get default settings
  getDefaultSettings() {
    return {
      notificationsEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      defaultRadius: 100,
      locationAccuracy: 'balanced',
      theme: 'light',
    };
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.REMINDERS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.GEOFENCES,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const reminders = await this.getReminders();
      const settings = await this.getSettings();
      
      return {
        version: this.currentVersion,
        exportDate: new Date().toISOString(),
        reminders,
        settings,
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data from backup
  async importData(data) {
    try {
      if (data.reminders) {
        await this.saveReminders(data.reminders);
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new StorageService();
