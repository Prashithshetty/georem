import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_CONFIG } from '../config/environment';

const REMINDERS_KEY = STORAGE_CONFIG.remindersKey;

/**
 * Storage utility for managing reminders offline
 * Uses AsyncStorage for persistent local storage
 */
class ReminderStorage {
  
  /**
   * Get all reminders from storage
   * @returns {Promise<Array>} Array of reminder objects
   */
  static async getAllReminders() {
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDERS_KEY);
      return remindersJson ? JSON.parse(remindersJson) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  /**
   * Save a new reminder
   * @param {Object} reminder - Reminder object to save
   * @returns {Promise<string>} Generated reminder ID
   */
  static async saveReminder(reminder) {
    try {
      const reminders = await this.getAllReminders();
      const newReminder = {
        ...reminder,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
      };
      
      reminders.push(newReminder);
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
      
      return newReminder.id;
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  }

  /**
   * Update an existing reminder
   * @param {string} id - Reminder ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<boolean>} Success status
   */
  static async updateReminder(id, updates) {
    try {
      const reminders = await this.getAllReminders();
      const index = reminders.findIndex(r => r.id === id);
      
      if (index === -1) {
        throw new Error('Reminder not found');
      }
      
      reminders[index] = {
        ...reminders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
      return true;
    } catch (error) {
      console.error('Error updating reminder:', error);
      return false;
    }
  }

  /**
   * Delete a reminder
   * @param {string} id - Reminder ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteReminder(id) {
    try {
      const reminders = await this.getAllReminders();
      const filteredReminders = reminders.filter(r => r.id !== id);
      
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filteredReminders));
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }

  /**
   * Get a specific reminder by ID
   * @param {string} id - Reminder ID
   * @returns {Promise<Object|null>} Reminder object or null
   */
  static async getReminderById(id) {
    try {
      const reminders = await this.getAllReminders();
      return reminders.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting reminder by ID:', error);
      return null;
    }
  }

  /**
   * Clear all reminders (for testing/reset)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllReminders() {
    try {
      await AsyncStorage.removeItem(REMINDERS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing reminders:', error);
      return false;
    }
  }

  /**
   * Generate a unique ID for reminders
   * @returns {string} Unique identifier
   */
  static generateId() {
    return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get reminders by location proximity (for geofencing)
   * @param {Object} location - Location object with latitude and longitude
   * @param {number} maxDistance - Maximum distance in meters
   * @returns {Promise<Array>} Array of nearby reminders
   */
  static async getNearbyReminders(location, maxDistance = 1000) {
    try {
      const reminders = await this.getAllReminders();
      return reminders.filter(reminder => {
        if (!reminder.location) return false;
        
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          reminder.location.latitude,
          reminder.location.longitude
        );
        
        return distance <= maxDistance;
      });
    } catch (error) {
      console.error('Error getting nearby reminders:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in meters
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

export default ReminderStorage;
