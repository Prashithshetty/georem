import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Card,
  IconButton,
  Chip,
  Surface,
  useTheme,
  Button,
  Divider,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import ReminderStorage from '../store/storage';
import useGeofenceTrigger from '../hooks/useGeofenceTrigger';

/**
 * HomeScreen Component
 * Main screen displaying all location-based reminders
 * Features Material 3 design with smooth animations and interactions
 */
const HomeScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [geofencingStatus, setGeofencingStatus] = useState({
    enabled: false,
    tracking: false,
    geofenceCount: 0,
  });

  const theme = useTheme();
  const {
    getGeofencingStatus,
    removeReminderGeofence,
    refreshGeofencingStatus,
    testNotification,
  } = useGeofenceTrigger();

  // Load reminders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadReminders();
      checkGeofencingStatus();
    }, [])
  );

  /**
   * Load all reminders from storage
   */
  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const storedReminders = await ReminderStorage.getAllReminders();
      setReminders(storedReminders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check geofencing service status
   */
  const checkGeofencingStatus = async () => {
    try {
      const status = await getGeofencingStatus();
      setGeofencingStatus(status);
    } catch (error) {
      console.error('Error checking geofencing status:', error);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    await checkGeofencingStatus();
    await refreshGeofencingStatus();
    setRefreshing(false);
  };

  /**
   * Delete a reminder
   * @param {string} reminderId - ID of reminder to delete
   */
  const deleteReminder = async (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from storage
              await ReminderStorage.deleteReminder(reminderId);
              
              // Remove geofence
              await removeReminderGeofence(reminderId);
              
              // Reload reminders
              await loadReminders();
              await checkGeofencingStatus();
              
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
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

  /**
   * Render individual reminder item
   */
  const renderReminderItem = ({ item }) => (
    <Card
      style={[
        styles.reminderCard,
        { backgroundColor: theme.colors.surface }
      ]}
      elevation={2}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header */}
        <View style={styles.reminderHeader}>
          <View style={styles.reminderTitleContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.reminderTitle,
                { color: theme.colors.onSurface }
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.reminderDate,
                { color: theme.colors.outline }
              ]}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => deleteReminder(item.id)}
            style={styles.deleteButton}
          />
        </View>

        {/* Type and Radius Info */}
        <View style={styles.reminderMeta}>
          <Chip
            icon={item.type === 'checklist' ? 'format-list-checks' : 'note-text'}
            style={[
              styles.typeChip,
              { backgroundColor: theme.colors.primaryContainer }
            ]}
            textStyle={[
              styles.chipText,
              { color: theme.colors.onPrimaryContainer }
            ]}
            compact
          >
            {item.type === 'checklist' ? 'Checklist' : 'Note'}
          </Chip>
          
          <Chip
            icon="map-marker-radius"
            style={[
              styles.radiusChip,
              { backgroundColor: theme.colors.secondaryContainer }
            ]}
            textStyle={[
              styles.chipText,
              { color: theme.colors.onSecondaryContainer }
            ]}
            compact
          >
            {formatRadius(item.radius || 200)}
          </Chip>
        </View>

        {/* Checklist Preview */}
        {item.type === 'checklist' && item.checklist && item.checklist.length > 0 && (
          <View style={styles.checklistPreview}>
            <Text
              variant="bodySmall"
              style={[
                styles.checklistLabel,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Items ({item.checklist.length}):
            </Text>
            {item.checklist.slice(0, 3).map((checklistItem, index) => (
              <Text
                key={index}
                variant="bodySmall"
                style={[
                  styles.checklistItem,
                  { color: theme.colors.onSurfaceVariant }
                ]}
                numberOfLines={1}
              >
                • {checklistItem}
              </Text>
            ))}
            {item.checklist.length > 3 && (
              <Text
                variant="bodySmall"
                style={[
                  styles.checklistMore,
                  { color: theme.colors.outline }
                ]}
              >
                ... and {item.checklist.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Location Info */}
        {item.location && (
          <View style={styles.locationInfo}>
            <Text
              variant="bodySmall"
              style={[
                styles.locationText,
                { color: theme.colors.outline }
              ]}
            >
              📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
              {item.location.address && ` • ${item.location.address}`}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Surface
        style={[
          styles.emptyCard,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
        elevation={1}
      >
        <Text
          variant="displaySmall"
          style={[
            styles.emptyIcon,
            { color: theme.colors.outline }
          ]}
        >
          📍
        </Text>
        <Text
          variant="headlineSmall"
          style={[
            styles.emptyTitle,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          No reminders yet
        </Text>
        <Text
          variant="bodyLarge"
          style={[
            styles.emptySubtitle,
            { color: theme.colors.outline }
          ]}
        >
          Create your first location-based reminder to get started
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ReminderInput')}
          style={styles.emptyButton}
          contentStyle={styles.emptyButtonContent}
        >
          Create Reminder
        </Button>
      </Surface>
    </View>
  );

  /**
   * Render geofencing status
   */
  const renderGeofencingStatus = () => (
    <Surface
      style={[
        styles.statusContainer,
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
      elevation={1}
    >
      <View style={styles.statusHeader}>
        <Text
          variant="titleSmall"
          style={[
            styles.statusTitle,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          Geofencing Status
        </Text>
        <IconButton
          icon="refresh"
          size={16}
          iconColor={theme.colors.primary}
          onPress={checkGeofencingStatus}
          style={styles.refreshButton}
        />
      </View>
      
      <View style={styles.statusRow}>
        <Chip
          icon={geofencingStatus.enabled ? 'check-circle' : 'alert-circle'}
          style={[
            styles.statusChip,
            {
              backgroundColor: geofencingStatus.enabled
                ? theme.colors.primaryContainer
                : theme.colors.errorContainer
            }
          ]}
          textStyle={{
            color: geofencingStatus.enabled
              ? theme.colors.onPrimaryContainer
              : theme.colors.onErrorContainer
          }}
          compact
        >
          {geofencingStatus.enabled ? 'Active' : 'Inactive'}
        </Chip>
        
        <Text
          variant="bodySmall"
          style={[
            styles.statusText,
            { color: theme.colors.outline }
          ]}
        >
          {geofencingStatus.geofenceCount} active geofences
        </Text>
      </View>

      <Button
        mode="outlined"
        onPress={testNotification}
        style={styles.testButton}
        contentStyle={styles.testButtonContent}
        compact
      >
        Test Notification
      </Button>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Geofencing Status */}
      {renderGeofencingStatus()}
      
      <Divider style={styles.divider} />

      {/* Reminders List */}
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('ReminderInput')}
        label="New Reminder"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontWeight: '600',
  },
  refreshButton: {
    margin: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  testButton: {
    borderRadius: 8,
  },
  testButtonContent: {
    paddingVertical: 4,
  },
  divider: {
    marginHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  reminderCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  reminderTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 12,
  },
  deleteButton: {
    margin: 0,
  },
  reminderMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeChip: {
    marginRight: 8,
  },
  radiusChip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checklistPreview: {
    marginBottom: 12,
  },
  checklistLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  checklistItem: {
    marginLeft: 8,
    marginBottom: 2,
  },
  checklistMore: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  locationInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  locationText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 24,
  },
  emptyButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

export default HomeScreen;
