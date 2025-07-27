import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';
import GeofenceStatusIndicator from './GeofenceStatusIndicator';

const ReminderItem = ({ 
  reminder, 
  onPress, 
  onGeofencePress, 
  onToggleStatus,
  onDelete,
  testID 
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGeofencePress = () => {
    if (onGeofencePress) {
      onGeofencePress(reminder);
    }
  };

  const handleToggle = (value) => {
    if (onToggleStatus) {
      onToggleStatus(value);
    }
  };

  const handleLongPress = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const getContentPreview = () => {
    if (reminder.type === 'sentence') {
      return reminder.content.length > 80 
        ? reminder.content.substring(0, 80) + '...' 
        : reminder.content;
    } else if (reminder.type === 'checklist') {
      const items = reminder.content || [];
      const completedCount = items.filter(item => item.completed).length;
      return `${completedCount}/${items.length} items completed`;
    }
    return '';
  };

  return (
    <Animated.View style={[
      styles.container, 
      { transform: [{ scale: scaleValue }] },
      !reminder.isActive && styles.inactiveContainer
    ]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => onPress && onPress(reminder)}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.mainContent}>
            <View style={styles.titleContainer}>
              <Text style={[
                styles.title,
                !reminder.isActive && styles.inactiveText
              ]} numberOfLines={2}>
                {reminder.title}
              </Text>
              <View style={styles.typeIndicator}>
                <Text style={styles.typeIcon}>
                  {reminder.type === 'checklist' ? '✅' : '📝'}
                </Text>
              </View>
            </View>
            
            {/* Content Preview */}
            <View style={styles.contentPreview}>
              <Text style={[
                styles.contentText,
                !reminder.isActive && styles.inactiveText
              ]} numberOfLines={2}>
                {getContentPreview()}
              </Text>
            </View>
            
            <View style={styles.locationContainer}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={[
                  styles.location,
                  !reminder.isActive && styles.inactiveText
                ]} numberOfLines={1}>
                  {reminder.location}
                </Text>
              </View>
              <View style={styles.controls}>
                {reminder.geofence && (
                  <GeofenceStatusIndicator
                    geofence={reminder.geofence}
                    locationData={reminder.locationData}
                    onPress={handleGeofencePress}
                    compact={true}
                    isActive={reminder.geofence?.isActive && reminder.isActive}
                    testID={`${testID}-geofence-status`}
                  />
                )}
                {onToggleStatus && (
                  <Switch
                    value={reminder.isActive}
                    onValueChange={handleToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={reminder.isActive ? colors.surface : colors.textSecondary}
                    style={styles.switch}
                  />
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.metaContainer}>
            <Text style={[
              styles.date,
              !reminder.isActive && styles.inactiveText
            ]}>
              {formatDate(reminder.createdAt)}
            </Text>
            <View style={styles.footer}>
              <Text style={[
                styles.radius,
                !reminder.isActive && styles.inactiveText
              ]}>
                {reminder.locationData?.radius || 100}m
              </Text>
              {reminder.geofence?.lastTriggered && (
                <Text style={[
                  styles.lastTriggered,
                  !reminder.isActive && styles.inactiveText
                ]}>
                  Triggered
                </Text>
              )}
            </View>
          </View>
        </View>

        {!reminder.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },
  inactiveContainer: {
    opacity: 0.7,
  },
  touchable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.small,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  typeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    fontSize: 14,
  },
  contentPreview: {
    marginBottom: spacing.sm,
  },
  contentText: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  location: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginLeft: spacing.sm,
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    alignItems: 'flex-end',
  },
  radius: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastTriggered: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs / 2,
  },
  inactiveText: {
    color: colors.textSecondary,
  },
  inactiveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderBottomLeftRadius: borderRadius.md,
  },
  inactiveBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
});

export default ReminderItem;
