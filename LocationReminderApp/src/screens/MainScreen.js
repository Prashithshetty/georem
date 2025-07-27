import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import ReminderItem from '../components/ReminderItem';
import FloatingActionButton from '../components/FloatingActionButton';
import EmptyState from '../components/EmptyState';
import CreateReminderScreen from './CreateReminderScreen';
import ReminderStats from '../components/ReminderStats';
import { colors, globalStyles, spacing, typography, borderRadius, shadows } from '../styles/styles';

const MainScreen = () => {
  const {
    reminders,
    isLoading,
    isRefreshing,
    geofenceStatus,
    refreshReminders,
    addReminder,
    deleteReminder,
    toggleReminderStatus,
    updateChecklistItem,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'inactive'
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    await refreshReminders();
  }, [refreshReminders]);

  const handleReminderPress = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setShowDetailsModal(true);
  }, []);

  const handleAddReminder = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleSaveReminder = useCallback(async (newReminder) => {
    try {
      await addReminder(newReminder);
      setShowCreateModal(false);
      
      // Show success feedback
      Alert.alert(
        'Success',
        `Reminder created! You'll be notified when you arrive within ${newReminder.locationData.radius}m of ${newReminder.location}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving reminder:', error);
      // Error is handled in context
    }
  }, [addReminder]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleDeleteReminder = useCallback(async (reminderId) => {
    const success = await deleteReminder(reminderId);
    if (success) {
      setShowDetailsModal(false);
      setSelectedReminder(null);
    }
  }, [deleteReminder]);

  const handleToggleStatus = useCallback(async (reminderId) => {
    await toggleReminderStatus(reminderId);
  }, [toggleReminderStatus]);

  const handleChecklistToggle = useCallback(async (reminderId, itemId, completed) => {
    await updateChecklistItem(reminderId, itemId, { completed: !completed });
  }, [updateChecklistItem]);

  const handleGeofencePress = useCallback((reminder) => {
    const geofence = reminder.geofence;
    const status = geofence?.isActive ? 'Active' : 'Inactive';
    const triggers = geofence?.triggeredCount || 0;
    const lastTriggered = geofence?.lastTriggered 
      ? new Date(geofence.lastTriggered).toLocaleString() 
      : 'Never';

    Alert.alert(
      'Geofence Status',
      `Status: ${status}\nRadius: ${reminder.locationData?.radius || 100}m\nTriggers: ${triggers}\nLast Triggered: ${lastTriggered}`,
      [{ text: 'OK' }]
    );
  }, []);

  const renderReminderItem = useCallback(({ item, index }) => (
    <ReminderItem
      reminder={item}
      onPress={() => handleReminderPress(item)}
      onGeofencePress={() => handleGeofencePress(item)}
      onToggleStatus={() => handleToggleStatus(item.id)}
      onDelete={() => handleDeleteReminder(item.id)}
      testID={`reminder-item-${index}`}
    />
  ), [handleReminderPress, handleGeofencePress, handleToggleStatus, handleDeleteReminder]);

  const getFilteredReminders = useCallback(() => {
    switch (filterType) {
      case 'active':
        return reminders.filter(r => r.isActive);
      case 'inactive':
        return reminders.filter(r => !r.isActive);
      default:
        return reminders;
    }
  }, [reminders, filterType]);

  const renderEmptyComponent = useCallback(() => {
    const filteredCount = getFilteredReminders().length;
    const hasReminders = reminders.length > 0;

    if (hasReminders && filteredCount === 0) {
      return (
        <EmptyState
          title={`No ${filterType === 'active' ? 'Active' : 'Inactive'} Reminders`}
          message={`You don't have any ${filterType === 'active' ? 'active' : 'inactive'} reminders. Try changing the filter to see all reminders.`}
        />
      );
    }

    return (
      <EmptyState
        title="No Reminders Yet"
        message="Create your first location-based reminder to get started. You'll be notified when you arrive at or leave your chosen locations."
      />
    );
  }, [reminders.length, filterType, getFilteredReminders]);

  const renderHeader = useCallback(() => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <Text style={globalStyles.headerTitle}>GeoRem</Text>
          <TouchableOpacity
            style={styles.statsToggle}
            onPress={() => setShowStats(!showStats)}
          >
            <Text style={styles.statsToggleIcon}>{showStats ? '📊' : '📈'}</Text>
          </TouchableOpacity>
        </View>
        
        {showStats && (
          <ReminderStats 
            reminders={reminders} 
            geofenceStatus={geofenceStatus}
          />
        )}
        
        {reminders.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {['all', 'active', 'inactive'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    filterType === type && styles.filterButtonActive
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filterType === type && styles.filterButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    );
  }, [geofenceStatus, reminders, showStats, filterType, scrollY]);

  const renderDetailsModal = useCallback(() => {
    if (!selectedReminder) return null;

    let contentText = '';
    if (selectedReminder.type === 'sentence') {
      contentText = selectedReminder.content;
    } else if (selectedReminder.type === 'checklist') {
      const items = selectedReminder.content || [];
      contentText = items.map((item, index) => 
        `${index + 1}. ${item.text} ${item.completed ? '✓' : ''}`
      ).join('\n');
    }

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedReminder.title}</Text>
            <Text style={styles.modalLocation}>📍 {selectedReminder.location}</Text>
            <Text style={styles.modalRadius}>Radius: {selectedReminder.locationData?.radius || 100}m</Text>
            
            <View style={styles.modalDivider} />
            
            {selectedReminder.type === 'sentence' ? (
              <Text style={styles.modalContentText}>{contentText}</Text>
            ) : (
              <View style={styles.checklistContainer}>
                {selectedReminder.content.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checklistItem}
                    onPress={() => handleChecklistToggle(selectedReminder.id, item.id, item.completed)}
                  >
                    <Text style={[
                      styles.checklistText,
                      item.completed && styles.checklistCompleted
                    ]}>
                      {item.completed ? '☑' : '☐'} {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteReminder(selectedReminder.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [showDetailsModal, selectedReminder, handleChecklistToggle, handleDeleteReminder]);

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <StatusBar style="dark" backgroundColor={colors.surface} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.surface} />
      
      {renderHeader()}
      
      <View style={globalStyles.container}>
        <Animated.FlatList
          data={getFilteredReminders()}
          renderItem={renderReminderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            globalStyles.listContainer,
            getFilteredReminders().length === 0 && { flex: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          testID="reminders-list"
        />
        
        <FloatingActionButton
          onPress={handleAddReminder}
          icon="+"
          testID="add-reminder-fab"
        />
      </View>

      {/* Create Reminder Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseCreateModal}
      >
        <CreateReminderScreen
          navigation={{
            goBack: handleCloseCreateModal
          }}
          onSave={handleSaveReminder}
        />
      </Modal>

      {/* Details Modal */}
      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  statsToggle: {
    padding: spacing.xs,
  },
  statsToggleIcon: {
    fontSize: 24,
  },
  filterContainer: {
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalLocation: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalRadius: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  modalContentText: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  checklistContainer: {
    marginBottom: spacing.lg,
  },
  checklistItem: {
    paddingVertical: spacing.sm,
  },
  checklistText: {
    ...typography.body1,
    color: colors.text,
  },
  checklistCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  deleteButtonText: {
    ...typography.body2,
    color: colors.surface,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.sm,
  },
  closeButtonText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
});

export default MainScreen;
