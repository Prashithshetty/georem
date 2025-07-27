import * as Location from 'expo-location';
import { Platform, Alert, Linking } from 'react-native';

// Default location (San Francisco)
export const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Request location permissions
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      return false;
    }

    // For Android, also request background permission
    if (Platform.OS === 'android') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
        // Continue without background permission
      }
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Format coordinates for display
export const formatCoordinates = (latitude, longitude) => {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  return `${lat}, ${lng}`;
};

// Validate coordinates
export const isValidCoordinate = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// Calculate distance between two points (in meters)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Geocode address to coordinates
export const geocodeAddress = async (address) => {
  try {
    // Add a minimum length check
    if (!address || address.trim().length < 2) {
      return null;
    }

    const results = await Location.geocodeAsync(address);
    
    if (results && results.length > 0) {
      const { latitude, longitude } = results[0];
      
      // Try to get a better address description
      const reverseResults = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      let formattedAddress = address;
      if (reverseResults && reverseResults.length > 0) {
        formattedAddress = formatAddress(reverseResults[0]);
      }
      
      return {
        latitude,
        longitude,
        address: formattedAddress,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Geocode address to multiple results
export const geocodeAddressMultiple = async (address, limit = 5) => {
  try {
    if (!address || address.trim().length < 2) {
      return [];
    }

    const results = await Location.geocodeAsync(address);
    
    if (results && results.length > 0) {
      // Get detailed addresses for each result
      const detailedResults = await Promise.all(
        results.slice(0, limit).map(async (result, index) => {
          const { latitude, longitude } = result;
          
          try {
            const reverseResults = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            
            let formattedAddress = address;
            if (reverseResults && reverseResults.length > 0) {
              formattedAddress = formatAddress(reverseResults[0]);
            }
            
            return {
              id: `${index}-${latitude}-${longitude}`,
              latitude,
              longitude,
              address: formattedAddress,
              name: formattedAddress.split(',')[0] || address,
            };
          } catch (error) {
            return {
              id: `${index}-${latitude}-${longitude}`,
              latitude,
              longitude,
              address,
              name: address,
            };
          }
        })
      );
      
      return detailedResults;
    }
    
    return [];
  } catch (error) {
    console.error('Error geocoding multiple addresses:', error);
    return [];
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (results && results.length > 0) {
      const address = results[0];
      const formattedAddress = formatAddress(address);
      return formattedAddress;
    }
    
    return formatCoordinates(latitude, longitude);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return formatCoordinates(latitude, longitude);
  }
};

// Format address object to string
const formatAddress = (address) => {
  const parts = [];
  
  if (address.name) parts.push(address.name);
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.region) parts.push(address.region);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  return parts.filter(Boolean).join(', ');
};

// Check if location services are enabled
export const checkLocationServices = async () => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    
    if (!enabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => {
            // Open device settings
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }},
        ]
      );
    }
    
    return enabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};
