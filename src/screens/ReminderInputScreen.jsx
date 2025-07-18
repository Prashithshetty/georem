import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Switch,
  Text,
  Surface,
  useTheme,
  Divider,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import ChecklistInput from '../components/ChecklistInput';
import ReminderStorage from '../store/storage';
import useGeofenceTrigger from '../hooks/useGeofenceTrigger';

/**
 * ReminderInputScreen Component
 * Screen for creating new location-based reminders
 * Features Material 3 design with smooth form interactions
 */
const ReminderInputScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(200);
  const [isSaving, setIsSaving] = useState(false);
  
  const theme = useTheme();
  const { setupReminderGeofence } = useGeofenceTrigger();

  // Handle location data from LocationPickerScreen
  React.useEffect(() => {
    if (route.params?.location) {
      setSelectedLocation(route.params.location);
    }
    if (route.params?.radius) {
      setSelectedRadius(route.params.radius);
    }
  }, [route.params]);

  /**
   * Toggle between single note and checklist mode
   */
  const toggleChecklistMode = () => {
    if (isChecklistMode && checklist.length > 0) {
      Alert.alert(
        'Switch Mode',
        'Switching to single note mode will clear your checklist. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              setIsChecklistMode(false);
              setChecklist([]);
            },
          },
        ]
      );
    } else {
      setIsChecklistMode(!isChecklistMode);
    }
  };

  /**
   * Navigate to location picker
   */
  const openLocationPicker = () => {
    navigation.navigate('LocationPicker', {
      initialLocation: selectedLocation,
      initialRadius: selectedRadius,
    });
  };

  /**
   * Validate form data
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reminder.');
      return false;
    }

    if (title.trim().length > 100) {
      Alert.alert('Title Too Long', 'Please keep the title under 100 characters.');
      return false;
    }

    if (isChecklistMode && checklist.length === 0) {
      Alert.alert('Empty Checklist', 'Please add at least one item to your checklist.');
      return false;
    }

    if (!selectedLocation) {
      Alert.alert('Missing Location', 'Please select a location for your reminder.');
      return false;
    }

    return true;
  };

  /**
   * Save the reminder
   */
  const saveReminder = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      // Create reminder object
      const reminder = {
        title: title.trim(),
        type: isChecklistMode ? 'checklist' : 'single',
        checklist: isChecklistMode ? checklist : [],
        location: selectedLocation,
        radius: selectedRadius,
      };

      // Save to storage
      const reminderId = await ReminderStorage.saveReminder(reminder);

      // Setup geofence
      const geofenceSuccess = await setupReminderGeofence({
        ...reminder,
        id: reminderId,
      });

      if (!geofenceSuccess) {
        Alert.alert(
          'Geofence Warning',
          'Reminder saved but geofencing setup failed. You may not receive location notifications.',
          [{ text: 'OK' }]
        );
      }

      // Show success message
      Alert.alert(
        'Reminder Created',
        `Your ${isChecklistMode ? 'checklist' : 'note'} reminder has been created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save your reminder. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
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
    
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  /**
   * Format radius for display
   * @param {number} radius - Radius in meters
   * @returns {string} Formatted radius
   */
  const formatRadius = (radius) => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)}km`;
    }
    return `${radius}m`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Input */}
        <Surface
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface }
          ]}
          elevation={2}
        >
          <Text
            variant="titleMedium"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Reminder Title
          </Text>
          
          <TextInput
            mode="outlined"
            label="What do you want to remember?"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            multiline={false}
            style={styles.titleInput}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            right={
              <TextInput.Icon
                icon={title.length > 80 ? 'alert' : 'pencil'}
                iconColor={
                  title.length > 80 ? theme.colors.error : theme.colors.outline
                }
              />
            }
          />
          
          <Text
            variant="bodySmall"
            style={[
              styles.characterCount,
              { 
                color: title.length > 80 
                  ? theme.colors.error 
                  : theme.colors.outline 
              }
            ]}
          >
            {title.length}/100 characters
          </Text>
        </Surface>

        {/* Mode Toggle */}
        <Surface
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface }
          ]}
          elevation={2}
        >
          <View style={styles.modeToggleContainer}>
            <View style={styles.modeToggleText}>
              <Text
                variant="titleMedium"
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface }
                ]}
              >
                Reminder Type
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.modeDescription,
                  { color: theme.colors.onSurfaceVariant }
                ]}
              >
                {isChecklistMode 
                  ? 'Create a checklist with multiple items'
                  : 'Create a simple note reminder'
                }
              </Text>
            </View>
            
            <View style={styles.switchContainer}>
              <Text
                variant="bodySmall"
                style={[
                  styles.switchLabel,
                  { 
                    color: !isChecklistMode 
                      ? theme.colors.primary 
                      : theme.colors.outline 
                  }
                ]}
              >
                Note
              </Text>
              <Switch
                value={isChecklistMode}
                onValueChange={toggleChecklistMode}
                style={styles.switch}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.switchLabel,
                  { 
                    color: isChecklistMode 
                      ? theme.colors.primary 
                      : theme.colors.outline 
                  }
                ]}
              >
                Checklist
              </Text>
            </View>
          </View>
        </Surface>

        {/* Checklist Input */}
        {isChecklistMode && (
          <Surface
            style={[
              styles.section,
              { backgroundColor: theme.colors.surface }
            ]}
            elevation={2}
          >
            <ChecklistInput
              checklist={checklist}
              onChecklistChange={setChecklist}
            />
          </Surface>
        )}

        <Divider style={styles.divider} />

        {/* Location Selection */}
        <Surface
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface }
          ]}
          elevation={2}
        >
          <Text
            variant="titleMedium"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Location & Radius
          </Text>
          
          {/* Selected Location Display */}
          <View style={styles.locationDisplay}>
            <View style={styles.locationInfo}>
              <Text
                variant="bodyMedium"
                style={[
                  styles.locationText,
                  { 
                    color: selectedLocation 
                      ? theme.colors.onSurface 
                      : theme.colors.outline 
                  }
                ]}
                numberOfLines={2}
              >
                📍 {formatLocation(selectedLocation)}
              </Text>
              
              {selectedLocation && (
                <Text
                  variant="bodySmall"
                  style={[
                    styles.radiusText,
                    { color: theme.colors.onSurfaceVariant }
                  ]}
                >
                  Radius: {formatRadius(selectedRadius)}
                </Text>
              )}
            </View>
            
            <IconButton
              icon="map"
              size={24}
              iconColor={theme.colors.primary}
              onPress={openLocationPicker}
              style={[
                styles.locationButton,
                { backgroundColor: theme.colors.primaryContainer }
              ]}
            />
          </View>
          
          <Button
            mode="outlined"
            onPress={openLocationPicker}
            style={styles.selectLocationButton}
            contentStyle={styles.selectLocationButtonContent}
            icon="map-marker-plus"
          >
            {selectedLocation ? 'Change Location' : 'Select Location'}
          </Button>
        </Surface>

        {/* Save Button */}
        <Surface
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface }
          ]}
          elevation={2}
        >
          <Button
            mode="contained"
            onPress={saveReminder}
            disabled={isSaving || !title.trim() || !selectedLocation}
            loading={isSaving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
            icon="content-save"
          >
            {isSaving ? 'Creating Reminder...' : 'Create Reminder'}
          </Button>
          
          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.savingText,
                  { color: theme.colors.onSurfaceVariant }
                ]}
              >
                Setting up geofence...
              </Text>
            </View>
          )}
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  titleInput: {
    marginBottom: 8,
  },
  inputContent: {
    paddingHorizontal: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeToggleText: {
    flex: 1,
    marginRight: 16,
  },
  modeDescription: {
    marginTop: 4,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  switch: {
    marginHorizontal: 8,
  },
  divider: {
    marginVertical: 8,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  radiusText: {
    fontSize: 14,
  },
  locationButton: {
    margin: 0,
  },
  selectLocationButton: {
    borderRadius: 12,
  },
  selectLocationButtonContent: {
    paddingVertical: 8,
  },
  saveButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
});

export default ReminderInputScreen;
