import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Button,
  useTheme,
  Surface,
  Text,
} from 'react-native-paper';
import LocationPickerMap from '../components/LocationPickerMap';
import RadiusSelectorSlider from '../components/RadiusSelectorSlider';

/**
 * LocationPickerScreen Component
 * Full-screen location and radius selection interface
 * Combines map picker with radius selector in Material 3 design
 */
const LocationPickerScreen = ({ navigation, route }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(200);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const theme = useTheme();

  // Initialize with passed parameters
  useEffect(() => {
    if (route.params?.initialLocation) {
      setSelectedLocation(route.params.initialLocation);
    }
    if (route.params?.initialRadius) {
      setSelectedRadius(route.params.initialRadius);
    }
  }, [route.params]);

  /**
   * Handle location selection from map
   * @param {Object} location - Selected location object
   */
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  /**
   * Handle radius change from slider
   * @param {number} radius - Selected radius in meters
   */
  const handleRadiusChange = (radius) => {
    setSelectedRadius(radius);
  };

  /**
   * Confirm location and radius selection
   */
  const confirmSelection = () => {
    if (!selectedLocation) {
      Alert.alert(
        'No Location Selected',
        'Please select a location on the map before confirming.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsConfirming(true);

    // Navigate back with selected data
    navigation.navigate('ReminderInput', {
      location: selectedLocation,
      radius: selectedRadius,
    });

    setIsConfirming(false);
  };

  /**
   * Cancel selection and go back
   */
  const cancelSelection = () => {
    navigation.goBack();
  };

  /**
   * Reset to current location
   */
  const resetToCurrentLocation = () => {
    Alert.alert(
      'Reset Location',
      'This will reset the map to your current location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setSelectedLocation(null);
            // The map component will handle getting current location
          },
        },
      ]
    );
  };

  /**
   * Format location for display
   * @param {Object} location - Location object
   * @returns {string} Formatted location string
   */
  const formatLocation = (location) => {
    if (!location) return 'No location selected';
    
    if (location.address) {
      return location.address;
    }
    
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Map Section */}
      <View style={styles.mapSection}>
        <LocationPickerMap
          initialLocation={selectedLocation}
          initialRadius={selectedRadius}
          onLocationSelect={handleLocationSelect}
          onRadiusChange={handleRadiusChange}
        />
      </View>

      {/* Radius Selector */}
      <View style={styles.radiusSection}>
        <RadiusSelectorSlider
          initialRadius={selectedRadius}
          onRadiusChange={handleRadiusChange}
          minRadius={100}
          maxRadius={1000}
          step={50}
        />
      </View>

      {/* Selection Summary */}
      <Surface
        style={[
          styles.summarySection,
          { backgroundColor: theme.colors.surface }
        ]}
        elevation={3}
      >
        <Text
          variant="titleSmall"
          style={[
            styles.summaryTitle,
            { color: theme.colors.onSurface }
          ]}
        >
          Selection Summary
        </Text>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text
              variant="bodyMedium"
              style={[
                styles.summaryLabel,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              📍 Location:
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.summaryValue,
                { 
                  color: selectedLocation 
                    ? theme.colors.onSurface 
                    : theme.colors.outline 
                }
              ]}
              numberOfLines={2}
            >
              {formatLocation(selectedLocation)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text
              variant="bodyMedium"
              style={[
                styles.summaryLabel,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              📏 Radius:
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.summaryValue,
                { color: theme.colors.onSurface }
              ]}
            >
              {selectedRadius >= 1000 
                ? `${(selectedRadius / 1000).toFixed(1)}km`
                : `${selectedRadius}m`
              }
            </Text>
          </View>
        </View>
      </Surface>

      {/* Action Buttons */}
      <Surface
        style={[
          styles.actionsSection,
          { backgroundColor: theme.colors.surface }
        ]}
        elevation={4}
      >
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={cancelSelection}
            style={[
              styles.actionButton,
              styles.cancelButton,
            ]}
            contentStyle={styles.actionButtonContent}
            labelStyle={[
              styles.actionButtonLabel,
              { color: theme.colors.outline }
            ]}
          >
            Cancel
          </Button>
          
          <Button
            mode="text"
            onPress={resetToCurrentLocation}
            style={styles.resetButton}
            contentStyle={styles.resetButtonContent}
            labelStyle={[
              styles.resetButtonLabel,
              { color: theme.colors.primary }
            ]}
            icon="crosshairs-gps"
            compact
          >
            Reset
          </Button>
          
          <Button
            mode="contained"
            onPress={confirmSelection}
            disabled={!selectedLocation || isConfirming}
            loading={isConfirming}
            style={[
              styles.actionButton,
              styles.confirmButton,
            ]}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            icon="check"
          >
            Confirm
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSection: {
    flex: 1,
  },
  radiusSection: {
    // RadiusSelectorSlider has its own margin/padding
  },
  summarySection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontWeight: '500',
    minWidth: 80,
    marginRight: 8,
  },
  summaryValue: {
    flex: 1,
    flexWrap: 'wrap',
  },
  actionsSection: {
    padding: 16,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 12,
    minWidth: 100,
  },
  actionButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    // Additional styles for cancel button if needed
  },
  confirmButton: {
    // Additional styles for confirm button if needed
  },
  resetButton: {
    borderRadius: 20,
  },
  resetButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  resetButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LocationPickerScreen;
