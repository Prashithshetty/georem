import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, typography, spacing, borderRadius, shadows, globalStyles } from '../styles/styles';
import TypeToggle from '../components/TypeToggle';
import ChecklistItem from '../components/ChecklistItem';
import LocationSelectionScreenSearch from './LocationSelectionScreenSearch';
import RadiusSelector from '../components/RadiusSelector';
import GeofenceManager from '../services/GeofenceManager';

const CreateReminderScreen = ({ navigation, onSave }) => {
  // State management
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderType, setReminderType] = useState('sentence'); // 'sentence' or 'checklist'
  const [singleSentence, setSingleSentence] = useState('');
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', text: '', completed: false }
  ]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(100); // Default 100m radius
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Validation functions
  const validateTitle = (title) => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateContent = () => {
    if (reminderType === 'sentence') {
      if (!singleSentence.trim()) {
        setContentError('Please enter a reminder description');
        return false;
      }
    } else {
      const validItems = checklistItems.filter(item => item.text.trim());
      if (validItems.length === 0) {
        setContentError('Please add at least one checklist item');
        return false;
      }
    }
    setContentError('');
    return true;
  };

  const validateLocation = () => {
    if (!selectedLocation) {
      setLocationError('Please select a location for your reminder');
      return false;
    }
    setLocationError('');
    return true;
  };

  // Checklist management functions
  const addChecklistItem = () => {
    const newItem = {
      id: Date.now().toString(),
      text: '',
      completed: false
    };
    setChecklistItems([...checklistItems, newItem]);
  };

  const updateChecklistItem = (id, text) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const removeChecklistItem = (id) => {
    if (checklistItems.length > 1) {
      setChecklistItems(items => items.filter(item => item.id !== id));
    }
  };

  // Location handlers
  const handleLocationPress = () => {
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (locationError) setLocationError('');
    setShowLocationModal(false);
  };

  const handleLocationModalClose = () => {
    setShowLocationModal(false);
  };

  // Save handler
  const handleSave = async () => {
    const isTitleValid = validateTitle(reminderTitle);
    const isContentValid = validateContent();
    const isLocationValid = validateLocation();

    if (!isTitleValid || !isContentValid || !isLocationValid) {
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      title: reminderTitle.trim(),
      type: reminderType,
      content: reminderType === 'sentence' 
        ? singleSentence.trim()
        : checklistItems.filter(item => item.text.trim()),
      location: selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`,
      locationData: {
        ...selectedLocation,
        radius: geofenceRadius,
      },
      geofence: {
        id: `geofence_${Date.now()}`,
        isActive: true,
        triggeredCount: 0,
        lastTriggered: null,
        transitionType: 'ENTER',
        createdAt: new Date().toISOString(),
      },
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving reminder:', newReminder);
    
    // Call the onSave callback which will handle adding to storage and geofence
    if (onSave) {
      try {
        await onSave(newReminder);
        // Navigation is handled by the parent component after successful save
      } catch (error) {
        console.error('Error saving reminder:', error);
        // Error alert is handled by the context/parent component
      }
    }
  };

  const handleCancel = () => {
    if (reminderTitle.trim() || singleSentence.trim() || checklistItems.some(item => item.text.trim()) || selectedLocation) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation?.goBack?.() || console.log('Navigate back')
          }
        ]
      );
    } else {
      navigation?.goBack?.() || console.log('Navigate back');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Create Reminder</Text>
      <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
        <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTitleInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Reminder Title</Text>
      <TextInput
        style={[styles.textInput, titleError && styles.inputError]}
        value={reminderTitle}
        onChangeText={(text) => {
          setReminderTitle(text);
          if (titleError) validateTitle(text);
        }}
        placeholder="Enter reminder title..."
        placeholderTextColor={colors.textSecondary}
        maxLength={100}
        testID="title-input"
      />
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
    </View>
  );

  const renderTypeToggle = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Reminder Type</Text>
      <TypeToggle
        selectedType={reminderType}
        onTypeChange={setReminderType}
        testID="type-toggle"
      />
    </View>
  );

  const renderSentenceInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Description</Text>
      <TextInput
        style={[styles.textInput, styles.multilineInput, contentError && styles.inputError]}
        value={singleSentence}
        onChangeText={(text) => {
          setSingleSentence(text);
          if (contentError) setContentError('');
        }}
        placeholder="Enter your reminder description..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
        maxLength={500}
        testID="sentence-input"
      />
      {contentError ? <Text style={styles.errorText}>{contentError}</Text> : null}
    </View>
  );

  const renderChecklistInput = () => (
    <View style={styles.section}>
      <View style={styles.checklistHeader}>
        <Text style={styles.sectionLabel}>Checklist Items</Text>
        <TouchableOpacity onPress={addChecklistItem} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>
      
      {checklistItems.map((item, index) => (
        <ChecklistItem
          key={item.id}
          item={item}
          index={index}
          onTextChange={(text) => updateChecklistItem(item.id, text)}
          onRemove={() => removeChecklistItem(item.id)}
          canRemove={checklistItems.length > 1}
          testID={`checklist-item-${index}`}
        />
      ))}
      
      {contentError ? <Text style={styles.errorText}>{contentError}</Text> : null}
    </View>
  );

  const renderLocationSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Location</Text>
      <TouchableOpacity
        style={[styles.locationButton, locationError && styles.inputError]}
        onPress={handleLocationPress}
        activeOpacity={0.7}
      >
        <View style={styles.locationButtonContent}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationTextContainer}>
            {selectedLocation ? (
              <>
                <Text style={styles.locationText} numberOfLines={1}>
                  {selectedLocation.address || 'Selected Location'}
                </Text>
                <Text style={styles.locationCoords} numberOfLines={1}>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Text>
              </>
            ) : (
              <Text style={styles.locationPlaceholder}>Tap to select location</Text>
            )}
          </View>
          <Text style={styles.locationArrow}>›</Text>
        </View>
      </TouchableOpacity>
      {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
    </View>
  );

  const renderRadiusSelector = () => {
    if (!selectedLocation) return null;
    
    return (
      <View style={styles.section}>
        <RadiusSelector
          radius={geofenceRadius}
          onRadiusChange={setGeofenceRadius}
          minRadius={50}
          maxRadius={1000}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.surface} />
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderTitleInput()}
          {renderTypeToggle()}
          
          {reminderType === 'sentence' ? renderSentenceInput() : renderChecklistInput()}
          
          {renderLocationSelector()}
          
          {renderRadiusSelector()}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleLocationModalClose}
      >
        <LocationSelectionScreenSearch
          navigation={{
            goBack: handleLocationModalClose
          }}
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation}
        />
      </Modal>
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
  saveButton: {
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body1,
    color: colors.text,
    ...shadows.small,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  locationButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.small,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  locationTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationText: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  locationCoords: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationPlaceholder: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  locationArrow: {
    ...typography.h3,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  radiusContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.small,
  },
  radiusText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  radiusDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default CreateReminderScreen;
