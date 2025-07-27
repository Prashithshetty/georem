import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';

const RadiusSelector = ({ radius, onRadiusChange, minRadius = 50, maxRadius = 1000 }) => {
  const presetRadii = [50, 100, 200, 500, 1000];

  const handlePresetPress = (value) => {
    if (onRadiusChange) {
      onRadiusChange(value);
    }
  };

  const formatRadius = (value) => {
    if (value < 1000) {
      return `${value}m`;
    }
    return `${(value / 1000).toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Geofence Radius</Text>
        <Text style={styles.currentValue}>{formatRadius(radius)}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{formatRadius(minRadius)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={minRadius}
          maximumValue={maxRadius}
          value={radius}
          onValueChange={onRadiusChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          step={10}
        />
        <Text style={styles.sliderLabel}>{formatRadius(maxRadius)}</Text>
      </View>

      <View style={styles.presetsContainer}>
        <Text style={styles.presetsLabel}>Quick select:</Text>
        <View style={styles.presetButtons}>
          {presetRadii.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                radius === preset && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetPress(preset)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  radius === preset && styles.presetButtonTextActive,
                ]}
              >
                {formatRadius(preset)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          You'll receive a notification when you enter within {formatRadius(radius)} of this location
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
  },
  currentValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: spacing.sm,
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'center',
  },
  presetsContainer: {
    marginBottom: spacing.md,
  },
  presetsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: colors.surface,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
});

export default RadiusSelector;
