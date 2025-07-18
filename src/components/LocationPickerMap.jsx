import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import {
  Searchbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Text,
  IconButton,
} from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { GOOGLE_CONFIG, MAP_CONFIG, isDevelopment } from '../config/environment';

const { width, height } = Dimensions.get('window');

/**
 * LocationPickerMap Component
 * Interactive map with Google Places autocomplete and draggable pin
 * Features Material 3 design with smooth map interactions
 */
const LocationPickerMap = ({ 
  initialLocation = null,
  initialRadius = 200,
  onLocationSelect,
  onRadiusChange,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || MAP_CONFIG.defaultLocation
  );
  const [radius, setRadius] = useState(initialRadius);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    requestLocationPermission();
    if (!initialLocation) {
      getCurrentLocation();
    }
    
    // Warn about API key in development
    if (isDevelopment() && !GOOGLE_CONFIG.isApiKeyValid()) {
      console.warn('⚠️ Google Places API key is not configured properly');
      Alert.alert(
        'API Key Missing',
        'Google Places API key is not configured. Search functionality will be limited.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  /**
   * Request location permissions
   */
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access is needed to show your current position on the map.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  /**
   * Get user's current location
   */
  const getCurrentLocation = async () => {
    if (!locationPermission) return;

    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setSelectedLocation(newLocation);
      
      // Animate to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newLocation, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please select a location manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle map press to select location
   * @param {Object} event - Map press event
   */
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      ...selectedLocation,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    
    setSelectedLocation(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
    }
  };

  /**
   * Handle marker drag to update location
   * @param {Object} event - Marker drag event
   */
  const handleMarkerDrag = (event) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      ...selectedLocation,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    
    setSelectedLocation(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
    }
  };

  /**
   * Handle place selection from autocomplete
   * @param {Object} data - Place data
   * @param {Object} details - Place details
   */
  const handlePlaceSelect = (data, details) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      const newLocation = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setSelectedLocation(newLocation);
      setSearchQuery(data.description);

      // Animate to selected place
      if (mapRef.current) {
        mapRef.current.animateToRegion(newLocation, 1000);
      }

      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: data.description,
        });
      }
    }
  };

  /**
   * Handle search input change
   * @param {string} query - Search query
   */
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  /**
   * Clear search and reset to current location
   */
  const clearSearch = () => {
    setSearchQuery('');
    getCurrentLocation();
  };

  /**
   * Zoom in on the map
   */
  const zoomIn = () => {
    if (mapRef.current) {
      const newRegion = {
        ...selectedLocation,
        latitudeDelta: selectedLocation.latitudeDelta * 0.5,
        longitudeDelta: selectedLocation.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setSelectedLocation(newRegion);
    }
  };

  /**
   * Zoom out on the map
   */
  const zoomOut = () => {
    if (mapRef.current) {
      const newRegion = {
        ...selectedLocation,
        latitudeDelta: selectedLocation.latitudeDelta * 2,
        longitudeDelta: selectedLocation.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setSelectedLocation(newRegion);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Surface
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface }
        ]}
        elevation={4}
      >
        <GooglePlacesAutocomplete
          placeholder="Search for a place..."
          onPress={handlePlaceSelect}
          query={{
            key: GOOGLE_CONFIG.placesApiKey,
            language: 'en',
            components: 'country:us', // Restrict to US (optional)
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={300}
          minLength={2}
          nearbyPlacesAPI="GooglePlacesSearch"
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInputContainer: [
              styles.searchInputContainer,
              { backgroundColor: theme.colors.surfaceVariant }
            ],
            textInput: [
              styles.searchInput,
              { 
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurfaceVariant,
              }
            ],
            listView: [
              styles.suggestionsList,
              { backgroundColor: theme.colors.surface }
            ],
            row: styles.suggestionRow,
            description: [
              styles.suggestionText,
              { color: theme.colors.onSurface }
            ],
          }}
          renderRightButton={() => (
            searchQuery ? (
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={clearSearch}
                style={styles.clearButton}
              />
            ) : (
              <IconButton
                icon="crosshairs-gps"
                size={20}
                iconColor={theme.colors.primary}
                onPress={getCurrentLocation}
                style={styles.gpsButton}
              />
            )
          )}
        />
      </Surface>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={selectedLocation}
          onPress={handleMapPress}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {/* Selected location marker */}
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable
            onDragEnd={handleMarkerDrag}
            title="Reminder Location"
            description="Drag to adjust position"
            pinColor={theme.colors.primary}
          />

          {/* Radius circle */}
          <Circle
            center={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            radius={radius}
            strokeColor={theme.colors.primary}
            strokeWidth={2}
            fillColor={`${theme.colors.primary}20`}
          />
        </MapView>

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Surface
              style={[
                styles.loadingContainer,
                { backgroundColor: theme.colors.surface }
              ]}
              elevation={4}
            >
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
              />
              <Text
                variant="bodyMedium"
                style={[
                  styles.loadingText,
                  { color: theme.colors.onSurface }
                ]}
              >
                Getting your location...
              </Text>
            </Surface>
          </View>
        )}

        {/* Map controls */}
        <View style={styles.mapControls}>
          <Surface
            style={[
              styles.controlButton,
              { backgroundColor: theme.colors.surface }
            ]}
            elevation={2}
          >
            <IconButton
              icon="plus"
              size={20}
              iconColor={theme.colors.onSurface}
              onPress={zoomIn}
            />
          </Surface>
          <Surface
            style={[
              styles.controlButton,
              { backgroundColor: theme.colors.surface }
            ]}
            elevation={2}
          >
            <IconButton
              icon="minus"
              size={20}
              iconColor={theme.colors.onSurface}
              onPress={zoomOut}
            />
          </Surface>
        </View>
      </View>

      {/* Location info */}
      <Surface
        style={[
          styles.locationInfo,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
        elevation={1}
      >
        <Text
          variant="bodySmall"
          style={[
            styles.coordinatesText,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </Text>
        <Text
          variant="bodySmall"
          style={[
            styles.instructionText,
            { color: theme.colors.outline }
          ]}
        >
          Tap on the map or drag the pin to select location
        </Text>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1000,
  },
  autocompleteContainer: {
    flex: 0,
  },
  searchInputContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    fontSize: 16,
    borderRadius: 12,
  },
  suggestionsList: {
    borderRadius: 12,
    marginTop: 8,
  },
  suggestionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 14,
  },
  clearButton: {
    margin: 0,
  },
  gpsButton: {
    margin: 0,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: width,
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -50 }],
  },
  controlButton: {
    borderRadius: 28,
    marginVertical: 4,
  },
  locationInfo: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  coordinatesText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LocationPickerMap;
