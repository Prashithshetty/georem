import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.configure();
  }

  async configure() {
    // Request permissions
    await this.requestPermissions();

    // Set up notification channels for Android
    if (Platform.OS === 'android') {
      await this.createNotificationChannels();
    }
  }

  async createNotificationChannels() {
    // High-priority channel for location reminders
    await Notifications.setNotificationChannelAsync('geofence-reminders', {
      name: 'Location Reminders',
      description: 'Important notifications for location-based reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // Standard channel for geofence setup/status alerts
    await Notifications.setNotificationChannelAsync('geofence-alerts', {
      name: 'Geofence Status',
      description: 'Status updates for geofenced areas',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      enableVibrate: false,
      showBadge: false,
    });
  }

  // Show local notification when geofence is triggered
  async showGeofenceNotification(reminder, transitionType) {
    const isEntering = transitionType === 'ENTER';
    const title = reminder.title;
    const message = isEntering 
      ? `📍 You've arrived at your location`
      : `🚶 Leaving location reminder`;

    const formattedContent = this.formatReminderContent(reminder);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: message,
          data: {
            reminderId: reminder.id,
            transitionType: transitionType,
            timestamp: new Date().toISOString(),
            reminderType: reminder.type,
            fullContent: formattedContent,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: false,
          autoDismiss: true,
        },
        trigger: null, // Show immediately
      });

      console.log(`Geofence notification sent for: ${reminder.title}`);
      console.log(`Content: ${formattedContent}`);
    } catch (error) {
      console.error('Error showing geofence notification:', error);
    }
  }

  // Format reminder content for notification
  formatReminderContent(reminder) {
    if (reminder.type === 'sentence') {
      return reminder.content;
    } else if (reminder.type === 'checklist') {
      // Show ALL checklist items as plain text
      const itemText = reminder.content.map(item => `• ${item.text}`).join('\n');
      return itemText;
    }
    return reminder.title;
  }

  // Show notification for geofence setup
  async showGeofenceSetupNotification(reminder) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Geofence Active',
          body: `Location reminder set for: ${reminder.title}`,
          data: {
            reminderId: reminder.id,
            type: 'setup',
          },
          sound: false,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing geofence setup notification:', error);
    }
  }

  // Show notification when geofence is removed
  async showGeofenceRemovedNotification(reminder) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔕 Geofence Removed',
          body: `Location reminder disabled for: ${reminder.title}`,
          data: {
            reminderId: reminder.id,
            type: 'removed',
          },
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing geofence removed notification:', error);
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return { alert: false, sound: false, badge: false };
      }

      console.log('Notification permissions granted');
      return { alert: true, sound: true, badge: true };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { alert: false, sound: false, badge: false };
    }
  }

  // Cancel all notifications for a specific reminder
  async cancelNotificationsForReminder(reminderId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const presentedNotifications = await Notifications.getPresentedNotificationsAsync();

      // Cancel scheduled notifications
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }

      // Dismiss presented notifications
      for (const notification of presentedNotifications) {
        if (notification.request.content.data?.reminderId === reminderId) {
          await Notifications.dismissNotificationAsync(notification.request.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling notifications for reminder:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      return {
        alert: permissions.status === 'granted',
        sound: permissions.status === 'granted',
        badge: permissions.status === 'granted',
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { alert: false, sound: false, badge: false };
    }
  }
}

// Export singleton instance
export default new NotificationService();
