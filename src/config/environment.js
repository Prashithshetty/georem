import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Centralized configuration management for the app
 * Handles environment variables and default values
 */

// Get environment variables with fallbacks
const getEnvVar = (key, defaultValue = null) => {
  return Constants.expoConfig?.extra?.[key] || 
         process.env[key] || 
         defaultValue;
};

// App Configuration
export const APP_CONFIG = {
  name: getEnvVar('EXPO_PUBLIC_APP_NAME', 'GeoRem'),
  version: getEnvVar('EXPO_PUBLIC_APP_VERSION', '1.0.0'),
  debugMode: getEnvVar('EXPO_PUBLIC_DEBUG_MODE', __DEV__) === 'true',
  logLevel: getEnvVar('EXPO_PUBLIC_LOG_LEVEL', 'info'),
};

// Google Services Configuration
export const GOOGLE_CONFIG = {
  placesApiKey: getEnvVar('EXPO_PUBLIC_GOOGLE_PLACES_API_KEY', 'YOUR_GOOGLE_PLACES_API_KEY'),
  // Validate API key
  isApiKeyValid: () => {
    const key = GOOGLE_CONFIG.placesApiKey;
    return key && key !== 'YOUR_GOOGLE_PLACES_API_KEY' && key.length > 20;
  },
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  channelId: getEnvVar('EXPO_PUBLIC_NOTIFICATION_CHANNEL_ID', 'georem_reminders'),
  channelName: getEnvVar('EXPO_PUBLIC_NOTIFICATION_CHANNEL_NAME', 'Location Reminders'),
  enableDebugNotifications: getEnvVar('EXPO_PUBLIC_ENABLE_DEBUG_NOTIFICATIONS', 'true') === 'true',
};

// Geofencing Configuration
export const GEOFENCE_CONFIG = {
  minRadius: parseInt(getEnvVar('EXPO_PUBLIC_MIN_GEOFENCE_RADIUS', '100')),
  maxRadius: parseInt(getEnvVar('EXPO_PUBLIC_MAX_GEOFENCE_RADIUS', '1000')),
  defaultRadius: parseInt(getEnvVar('EXPO_PUBLIC_DEFAULT_GEOFENCE_RADIUS', '200')),
  loiteringDelay: parseInt(getEnvVar('EXPO_PUBLIC_GEOFENCE_LOITERING_DELAY', '30000')),
  locationUpdateInterval: parseInt(getEnvVar('EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL', '10000')),
};

// Storage Configuration
export const STORAGE_CONFIG = {
  keyPrefix: getEnvVar('EXPO_PUBLIC_STORAGE_KEY_PREFIX', '@georem_'),
  remindersKey: `${getEnvVar('EXPO_PUBLIC_STORAGE_KEY_PREFIX', '@georem_')}reminders`,
  settingsKey: `${getEnvVar('EXPO_PUBLIC_STORAGE_KEY_PREFIX', '@georem_')}settings`,
};

// Map Configuration
export const MAP_CONFIG = {
  defaultLocation: {
    latitude: parseFloat(getEnvVar('EXPO_PUBLIC_DEFAULT_MAP_LATITUDE', '37.78825')),
    longitude: parseFloat(getEnvVar('EXPO_PUBLIC_DEFAULT_MAP_LONGITUDE', '-122.4324')),
    latitudeDelta: parseFloat(getEnvVar('EXPO_PUBLIC_DEFAULT_MAP_ZOOM', '0.01')),
    longitudeDelta: parseFloat(getEnvVar('EXPO_PUBLIC_DEFAULT_MAP_ZOOM', '0.01')),
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableLocationSimulation: getEnvVar('EXPO_PUBLIC_ENABLE_LOCATION_SIMULATION', 'false') === 'true',
  enableCrashReporting: getEnvVar('EXPO_PUBLIC_ENABLE_CRASH_REPORTING', 'false') === 'true',
  enableDebugNotifications: getEnvVar('EXPO_PUBLIC_ENABLE_DEBUG_NOTIFICATIONS', 'true') === 'true',
};

// Validation Functions
export const validateConfiguration = () => {
  const errors = [];
  
  // Validate Google Places API Key
  if (!GOOGLE_CONFIG.isApiKeyValid()) {
    errors.push('Google Places API key is missing or invalid');
  }
  
  // Validate geofence configuration
  if (GEOFENCE_CONFIG.minRadius >= GEOFENCE_CONFIG.maxRadius) {
    errors.push('Minimum geofence radius must be less than maximum radius');
  }
  
  if (GEOFENCE_CONFIG.defaultRadius < GEOFENCE_CONFIG.minRadius || 
      GEOFENCE_CONFIG.defaultRadius > GEOFENCE_CONFIG.maxRadius) {
    errors.push('Default geofence radius must be within min/max range');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Development helpers
export const isDevelopment = () => __DEV__ || APP_CONFIG.debugMode;
export const isProduction = () => !__DEV__ && !APP_CONFIG.debugMode;

// Log configuration in development
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:', {
    app: APP_CONFIG,
    google: { ...GOOGLE_CONFIG, placesApiKey: GOOGLE_CONFIG.isApiKeyValid() ? '✅ Valid' : '❌ Invalid' },
    notifications: NOTIFICATION_CONFIG,
    geofence: GEOFENCE_CONFIG,
    storage: STORAGE_CONFIG,
    map: MAP_CONFIG,
    features: FEATURE_FLAGS,
  });
  
  const validation = validateConfiguration();
  if (!validation.isValid) {
    console.warn('⚠️ Configuration Issues:', validation.errors);
  }
}

// Export all configurations
export default {
  APP_CONFIG,
  GOOGLE_CONFIG,
  NOTIFICATION_CONFIG,
  GEOFENCE_CONFIG,
  STORAGE_CONFIG,
  MAP_CONFIG,
  FEATURE_FLAGS,
  validateConfiguration,
  isDevelopment,
  isProduction,
};
