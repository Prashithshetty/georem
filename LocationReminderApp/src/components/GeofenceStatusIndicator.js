import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/styles';

const GeofenceStatusIndicator = ({ 
  geofence, 
  locationData, 
  onPress, 
  compact = false,
  testID 
}) => {
  if (!geofence) return null;

  const getStatusColor = () => {
    if (!geofence.isActive) return colors.textSecondary;
    if (geofence.triggeredCount > 0) return colors.secondary;
    return colors.primary;
  };

  const getStatusIcon = () => {
    if (!geofence.isActive) return '🔕';
    if (geofence.triggeredCount > 0) return '✅';
    return '📍';
  };

  const getStatusText = () => {
    if (!geofence.isActive) return 'Inactive';
    if (geofence.triggeredCount > 0) return 'Triggered';
    return 'Active';
  };

  const formatRadius = (radius) => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)}km`;
    }
    return `${radius}m`;
  };

  const formatLastTriggered = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Recently';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderColor: getStatusColor() }]}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={[styles.radiusText, { color: getStatusColor() }]}>
          {formatRadius(locationData?.radius || 100)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusSection}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        <Text style={styles.radiusDisplay}>
          {formatRadius(locationData?.radius || 100)}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Triggers:</Text>
          <Text style={styles.detailValue}>{geofence.triggeredCount}</Text>
        </View>
        
        {geofence.lastTriggered && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last:</Text>
            <Text style={styles.detailValue}>
              {formatLastTriggered(geofence.lastTriggered)}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>
            {geofence.transitionType || 'ENTER'}
          </Text>
        </View>
      </View>

      {/* Battery Impact Indicator */}
      {locationData?.radius < 100 && (
        <View style={styles.batteryWarning}>
          <Text style={styles.batteryWarningIcon}>⚡</Text>
          <Text style={styles.batteryWarningText}>High precision</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    marginLeft: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  radiusDisplay: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  radiusText: {
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs / 2,
  },
  details: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  batteryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  batteryWarningIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  batteryWarningText: {
    ...typography.caption,
    color: colors.warning || '#F59E0B',
    fontSize: 10,
  },
});

export default GeofenceStatusIndicator;
