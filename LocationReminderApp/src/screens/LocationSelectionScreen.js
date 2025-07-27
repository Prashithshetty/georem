import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors, typography, spacing, borderRadius, shadows, globalStyles } from '../styles/styles';
import SearchBar from '../components/SearchBar';
import LocationPin from '../components/LocationPin';
import {
  requestLocationPermission,
  getCurrentLocation,
  DEFAULT_LOCATION,
  formatCoordinates,
  isValidCoordinate,
} from '../utils/locationUtils';

const LocationSelectionScreen = ({ navigation, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(initialLocation || DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  // Add timeout to handle map loading issues in production builds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        Alert.alert(
          'Map Configuration Required',
          'Google Maps requires an API key for production builds. The map functionality is limited without it.\n\nPlease refer to GOOGLE_MAPS_SETUP_GUIDE.md for setup instructions.',
          [
            { 
              text: 'Continue Without Map', 
              onPress: () => {
                // Set a default location if none selected
                if (!selectedLocation) {
                  setSelectedLocation(DEFAULT_LOCATION);
                }
              }
            }
          ]
        );
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading, selectedLocation]);

  const initializeLocation = async () => {
    try {
      setIsLoading(true);
      
      // Request location permission
      const permissionGranted = await requestLocationPermission();
      setHasLocationPermission(permissionGranted);

      if (permissionGranted) {
        // Get current location
        const location = await getCurrentLocation();
        setCurrentRegion(location);
        
        // If no initial location provided, set current location as selected
        if (!initialLocation) {
          setSelectedLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      } else {
        // Use default location if permission denied
        setCurrentRegion(DEFAULT_LOCATION);
        Alert.alert(
          'Location Permission',
          'Location permission is required for better experience. You can still select a location manually on the map.',
          [{ text: 'OK' }]
        );
      }

      // Set initial location if provided
      if (initialLocation && isValidCoordinate(initialLocation.latitude, initialLocation.longitude)) {
        setSelectedLocation({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        });
        setCurrentRegion({
          ...initialLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Location initialization error:', error);
      Alert.alert('Error', 'Failed to initialize location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setSearchQuery(''); // Clear search when manually selecting
  };

  const handleSearchLocationSelect = (location) => {
    const newLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    
    setSelectedLocation(newLocation);
    
    // Animate to selected location
    const region = {
      ...newLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    setCurrentRegion(region);
    mapRef.current?.animateToRegion(region, 1000);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please select a location on the map or search for one.');
      return;
    }

    const locationData = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: `${formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}`,
      timestamp: new Date().toISOString(),
    };

    if (onLocationSelect) {
      onLocationSelect(locationData);
    }

    navigation?.goBack?.();
  };

  const handleCancel = () => {
    navigation?.goBack?.();
  };

  const handleMyLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please grant location permission to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      
      setSelectedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      setCurrentRegion(location);
      mapRef.current?.animateToRegion(location, 1000);
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Select Location</Text>
      <TouchableOpacity onPress={handleConfirmLocation} style={styles.headerButton}>
        <Text style={[styles.headerButtonText, styles.confirmButton]}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <SearchBar
        onLocationSelect={handleSearchLocationSelect}
        onClear={handleSearchClear}
        placeholder="Search for a location..."
      />
    </View>
  );

  const renderMyLocationButton = () => (
    <TouchableOpacity
      style={styles.myLocationButton}
      onPress={handleMyLocation}
      activeOpacity={0.8}
    >
      <Text style={styles.myLocationButtonText}>📍</Text>
    </TouchableOpacity>
  );

  const renderSelectedLocationInfo = () => {
    if (!selectedLocation) return null;

    return (
      <View style={styles.locationInfo}>
        <Text style={styles.locationInfoTitle}>Selected Location</Text>
        <Text style={styles.locationInfoCoords}>
          {formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
        </Text>
      </View>
    );
  };

  const renderInstructions = () => {
    if (selectedLocation) return null;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap on the map to select a location or use the search bar above
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {renderHeader()}
      
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={currentRegion}
          onPress={handleMapPress}
          onRegionChangeComplete={setCurrentRegion}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description={formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
            >
              <LocationPin
                coordinate={selectedLocation}
                title="Selected Location"
              />
            </Marker>
          )}
        </MapView>

        {renderSearchBar()}
        {renderMyLocationButton()}
        {renderSelectedLocationInfo()}
        {renderInstructions()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: spacing.xl + 80, // Above location info
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  myLocationButtonText: {
    fontSize: 20,
  },
  locationInfo: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  locationInfoTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  locationInfoCoords: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  instructionsText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default LocationSelectionScreen;
