import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LOCATION_HISTORY: '@LocationReminder:locationHistory',
  LOCATION_FREQUENCY: '@LocationReminder:locationFrequency',
};

class LocationHistoryService {
  constructor() {
    this.maxHistoryItems = 15;
    this.maxFrequentItems = 5;
  }

  // Initialize location history
  async initialize() {
    try {
      const history = await this.getLocationHistory();
      if (!history) {
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify([]));
      }
      
      const frequency = await this.getLocationFrequency();
      if (!frequency) {
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_FREQUENCY, JSON.stringify({}));
      }
      
      return true;
    } catch (error) {
      console.error('Location history initialization error:', error);
      return false;
    }
  }

  // Add location to history
  async addLocation(location) {
    try {
      // Validate location object
      if (!location || !location.latitude || !location.longitude) {
        console.error('Invalid location object');
        return false;
      }

      // Get current history
      let history = await this.getLocationHistory();
      
      // Create location entry
      const locationEntry = {
        id: Date.now().toString(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        timestamp: new Date().toISOString(),
        ...location,
      };

      // Remove duplicate locations (same coordinates)
      history = history.filter(item => 
        !(Math.abs(item.latitude - location.latitude) < 0.0001 && 
          Math.abs(item.longitude - location.longitude) < 0.0001)
      );

      // Add new location at the beginning
      history.unshift(locationEntry);

      // Limit history size
      if (history.length > this.maxHistoryItems) {
        history = history.slice(0, this.maxHistoryItems);
      }

      // Save updated history
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));

      // Update frequency
      await this.updateLocationFrequency(locationEntry);

      return true;
    } catch (error) {
      console.error('Error adding location to history:', error);
      return false;
    }
  }

  // Get location history
  async getLocationHistory() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  // Get recent locations (last 5)
  async getRecentLocations(limit = 5) {
    try {
      const history = await this.getLocationHistory();
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent locations:', error);
      return [];
    }
  }

  // Update location frequency
  async updateLocationFrequency(location) {
    try {
      let frequency = await this.getLocationFrequency();
      
      // Create a key based on coordinates (rounded to avoid minor variations)
      const key = `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
      
      if (!frequency[key]) {
        frequency[key] = {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          },
          count: 0,
          lastUsed: null,
        };
      }
      
      frequency[key].count += 1;
      frequency[key].lastUsed = new Date().toISOString();
      frequency[key].location.address = location.address || frequency[key].location.address;

      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_FREQUENCY, JSON.stringify(frequency));
      return true;
    } catch (error) {
      console.error('Error updating location frequency:', error);
      return false;
    }
  }

  // Get location frequency data
  async getLocationFrequency() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_FREQUENCY);
      return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (error) {
      console.error('Error getting location frequency:', error);
      return {};
    }
  }

  // Get frequently used locations
  async getFrequentLocations(limit = 5) {
    try {
      const frequency = await this.getLocationFrequency();
      
      // Convert to array and sort by count
      const frequentLocations = Object.values(frequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((item, index) => ({
          id: `freq_${index}`,
          ...item.location,
          frequency: item.count,
          lastUsed: item.lastUsed,
        }));

      return frequentLocations;
    } catch (error) {
      console.error('Error getting frequent locations:', error);
      return [];
    }
  }

  // Search location history
  async searchHistory(query) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const history = await this.getLocationHistory();
      const searchTerm = query.toLowerCase();

      return history.filter(location => 
        location.address?.toLowerCase().includes(searchTerm) ||
        `${location.latitude}, ${location.longitude}`.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching location history:', error);
      return [];
    }
  }

  // Clear location history
  async clearHistory() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing location history:', error);
      return false;
    }
  }

  // Clear location frequency
  async clearFrequency() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_FREQUENCY, JSON.stringify({}));
      return true;
    } catch (error) {
      console.error('Error clearing location frequency:', error);
      return false;
    }
  }

  // Clear all location data
  async clearAll() {
    try {
      await this.clearHistory();
      await this.clearFrequency();
      return true;
    } catch (error) {
      console.error('Error clearing all location data:', error);
      return false;
    }
  }

  // Remove specific location from history
  async removeFromHistory(locationId) {
    try {
      let history = await this.getLocationHistory();
      history = history.filter(item => item.id !== locationId);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error removing location from history:', error);
      return false;
    }
  }

  // Get location suggestions (combination of frequent and recent)
  async getLocationSuggestions() {
    try {
      const frequent = await this.getFrequentLocations(3);
      const recent = await this.getRecentLocations(5);
      
      // Combine and remove duplicates
      const suggestions = [...frequent];
      const frequentCoords = frequent.map(loc => `${loc.latitude.toFixed(4)}_${loc.longitude.toFixed(4)}`);
      
      recent.forEach(location => {
        const coords = `${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
        if (!frequentCoords.includes(coords)) {
          suggestions.push(location);
        }
      });

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error getting location suggestions:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new LocationHistoryService();
