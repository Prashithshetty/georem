import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';

const ReminderStats = ({ reminders, geofenceStatus }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const activeReminders = reminders.filter(r => r.isActive).length;
  const totalReminders = reminders.length;
  const recentlyTriggered = reminders.filter(r => {
    if (!r.geofence?.lastTriggered) return false;
    const lastTriggered = new Date(r.geofence.lastTriggered);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastTriggered > dayAgo;
  }).length;

  const stats = [
    {
      label: 'Active',
      value: activeReminders,
      color: colors.success,
      icon: '✓',
    },
    {
      label: 'Total',
      value: totalReminders,
      color: colors.primary,
      icon: '📍',
    },
    {
      label: 'Recent',
      value: recentlyTriggered,
      color: colors.secondary,
      icon: '🔔',
    },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Text style={styles.icon}>{stat.icon}</Text>
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      
      {geofenceStatus.isMonitoring && (
        <View style={styles.monitoringBadge}>
          <View style={styles.monitoringDot} />
          <Text style={styles.monitoringText}>
            Monitoring {geofenceStatus.activeGeofencesCount} location{geofenceStatus.activeGeofencesCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  statValue: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  monitoringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  monitoringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  monitoringText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
});

export default ReminderStats;
