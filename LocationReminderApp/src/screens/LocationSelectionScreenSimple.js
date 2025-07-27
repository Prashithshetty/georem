import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows, globalStyles } from '../styles/styles';
import {
  requestLocationPermission,
  getCurrentLocation,
  DEFAULT_LOCATION,
  formatCoordinates,
} from '../utils/locationUtils';

const LocationSelectionScreenSimple = ({ navigation, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setManualLat(selectedLocation.latitude.toString());
      setManualLng(selectedLocation.longitude.toString());
    }
  }, [selectedLocation]);

  const initializeLocation = async () => {
    try {
      // Request location permission
      const permissionGranted = await requestLocationPermission();
      setHasLocationPermission(permissionGranted);

      if (!permissionGranted) {
        Alert.alert(
          'Location Permission',
          'Location permission is required for better experience. You can still enter coordinates manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
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
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid numeric values for latitude and longitude.');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180.');
      return;
    }

    setSelectedLocation({
      latitude: lat,
      longitude: lng,
    });
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please select a location using current location or enter coordinates manually.');
      return;
    }

    const locationData = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: formatCoordinates(selectedLocation.latitude, selectedLocation.longitude),
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

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting current location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {renderHeader()}
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Location Selection</Text>
          <Text style={styles.infoText}>
            Choose your location using one of the methods below
          </Text>
        </View>

        {/* Current Location Option */}
        <TouchableOpacity
          style={styles.locationOption}
          onPress={handleUseCurrentLocation}
          disabled={!hasLocationPermission}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>📱</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Use Current Location</Text>
              <Text style={styles.optionDescription}>
                {hasLocationPermission 
                  ? 'Tap to use your current GPS location'
                  : 'Location permission required'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Manual Input Option */}
        <View style={styles.manualInputSection}>
          <Text style={styles.sectionTitle}>Enter Coordinates Manually</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={manualLat}
                onChangeText={setManualLat}
                placeholder="-90 to 90"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={manualLng}
                onChangeText={setManualLng}
                placeholder="-180 to 180"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.setButton}
            onPress={handleManualInput}
          >
            <Text style={styles.setButtonText}>Set Location</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Location Display */}
        {selectedLocation && (
          <View style={styles.selectedLocationCard}>
            <Text style={styles.selectedLocationTitle}>Selected Location</Text>
            <Text style={styles.selectedLocationCoords}>
              {formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
            </Text>
            <View style={styles.coordsDetail}>
              <Text style={styles.coordLabel}>Lat: {selectedLocation.latitude.toFixed(6)}</Text>
              <Text style={styles.coordLabel}>Lng: {selectedLocation.longitude.toFixed(6)}</Text>
            </View>
          </View>
        )}

        {/* Common Locations */}
        <View style={styles.commonLocationsSection}>
          <Text style={styles.sectionTitle}>Common Locations</Text>
          <TouchableOpacity
            style={styles.commonLocation}
            onPress={() => setSelectedLocation({ latitude: 40.7128, longitude: -74.0060 })}
          >
            <Text style={styles.commonLocationText}>🗽 New York City</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commonLocation}
            onPress={() => setSelectedLocation({ latitude: 51.5074, longitude: -0.1278 })}
          >
            <Text style={styles.commonLocationText}>🇬🇧 London</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commonLocation}
            onPress={() => setSelectedLocation({ latitude: 35.6762, longitude: 139.6503 })}
          >
            <Text style={styles.commonLocationText}>🗾 Tokyo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  locationOption: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  manualInputSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...typography.body1,
    color: colors.text,
  },
  setButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  setButtonText: {
    ...typography.body2,
    color: colors.surface,
    fontWeight: '600',
  },
  selectedLocationCard: {
    backgroundColor: colors.secondary + '20',
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  selectedLocationTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectedLocationCoords: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  coordsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  coordLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  commonLocationsSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  commonLocation: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commonLocationText: {
    ...typography.body1,
    color: colors.text,
  },
});

export default LocationSelectionScreenSimple;
