import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';

const LocationHistoryItem = ({ 
  location, 
  onPress, 
  onRemove,
  showFrequency = false,
  isFrequent = false,
  testID 
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const fadeValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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

  const handleRemove = () => {
    Animated.timing(fadeValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onRemove) {
        onRemove(location.id);
      }
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getIcon = () => {
    if (isFrequent) return '⭐';
    if (location.type === 'current') return '📱';
    return '📍';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [{ scale: scaleValue }],
          opacity: fadeValue,
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.touchable,
          isFrequent && styles.frequentItem
        ]}
        onPress={() => onPress && onPress(location)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        testID={testID}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{getIcon()}</Text>
          
          <View style={styles.textContainer}>
            <Text style={styles.address} numberOfLines={1}>
              {location.address || 'Unknown Location'}
            </Text>
            
            <View style={styles.metaContainer}>
              {showFrequency && location.frequency ? (
                <Text style={styles.frequency}>
                  Used {location.frequency} time{location.frequency > 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.timestamp}>
                  {formatTimestamp(location.timestamp || location.lastUsed)}
                </Text>
              )}
              
              {location.radius && (
                <Text style={styles.radius}>
                  • {location.radius}m
                </Text>
              )}
            </View>
          </View>

          {onRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs / 2,
  },
  touchable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.small,
  },
  frequentItem: {
    borderColor: colors.primary + '30',
    backgroundColor: colors.primary + '08',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  address: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  frequency: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  radius: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  removeButton: {
    padding: spacing.xs,
  },
  removeIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LocationHistoryItem;
