import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Slider,
  Button,
  IconButton,
} from 'react-native-paper';

/**
 * RadiusSelectorSlider Component
 * Allows users to select geofence radius with visual feedback
 * Features Material 3 design with smooth slider interaction
 */
const RadiusSelectorSlider = ({ 
  initialRadius = 200, 
  onRadiusChange,
  minRadius = 100,
  maxRadius = 1000,
  step = 50,
}) => {
  const [radius, setRadius] = useState(initialRadius);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const theme = useTheme();

  // Update parent when radius changes
  useEffect(() => {
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
  }, [radius, onRadiusChange]);

  /**
   * Handle slider value change
   * @param {number} value - New radius value
   */
  const handleSliderChange = (value) => {
    setRadius(Math.round(value));
  };

  /**
   * Handle slider interaction start
   */
  const handleSlidingStart = () => {
    setIsAdjusting(true);
  };

  /**
   * Handle slider interaction complete
   */
  const handleSlidingComplete = (value) => {
    setIsAdjusting(false);
    setRadius(Math.round(value));
  };

  /**
   * Decrease radius by step
   */
  const decreaseRadius = () => {
    const newRadius = Math.max(minRadius, radius - step);
    setRadius(newRadius);
  };

  /**
   * Increase radius by step
   */
  const increaseRadius = () => {
    const newRadius = Math.min(maxRadius, radius + step);
    setRadius(newRadius);
  };

  /**
   * Set radius to preset value
   * @param {number} value - Preset radius value
   */
  const setPresetRadius = (value) => {
    setRadius(value);
  };

  /**
   * Format radius for display
   * @param {number} value - Radius value in meters
   * @returns {string} Formatted radius string
   */
  const formatRadius = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`;
    }
    return `${value}m`;
  };

  /**
   * Get radius description based on value
   * @param {number} value - Radius value
   * @returns {string} Description text
   */
  const getRadiusDescription = (value) => {
    if (value <= 150) return 'Very precise - for specific spots';
    if (value <= 300) return 'Precise - for buildings or small areas';
    if (value <= 500) return 'Moderate - for neighborhoods';
    if (value <= 750) return 'Wide - for larger areas';
    return 'Very wide - for districts or zones';
  };

  // Preset radius values
  const presetRadii = [100, 200, 300, 500, 1000];

  return (
    <Surface
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface }
      ]}
      elevation={2}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="titleMedium"
          style={[
            styles.title,
            { color: theme.colors.onSurface }
          ]}
        >
          Reminder Radius
        </Text>
        <Text
          variant="headlineMedium"
          style={[
            styles.radiusValue,
            { 
              color: isAdjusting ? theme.colors.primary : theme.colors.onSurface,
            }
          ]}
        >
          {formatRadius(radius)}
        </Text>
      </View>

      {/* Description */}
      <Text
        variant="bodyMedium"
        style={[
          styles.description,
          { color: theme.colors.onSurfaceVariant }
        ]}
      >
        {getRadiusDescription(radius)}
      </Text>

      {/* Slider Controls */}
      <View style={styles.sliderContainer}>
        <IconButton
          icon="minus"
          size={24}
          iconColor={theme.colors.primary}
          onPress={decreaseRadius}
          disabled={radius <= minRadius}
          style={[
            styles.sliderButton,
            { backgroundColor: theme.colors.primaryContainer }
          ]}
        />

        <View style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={minRadius}
            maximumValue={maxRadius}
            value={radius}
            onValueChange={handleSliderChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
            step={step}
            thumbStyle={[
              styles.sliderThumb,
              { backgroundColor: theme.colors.primary }
            ]}
            trackStyle={[
              styles.sliderTrack,
              { backgroundColor: theme.colors.outline }
            ]}
            minimumTrackStyle={[
              styles.sliderMinTrack,
              { backgroundColor: theme.colors.primary }
            ]}
          />
          
          {/* Range labels */}
          <View style={styles.rangeLabels}>
            <Text
              variant="bodySmall"
              style={[
                styles.rangeLabel,
                { color: theme.colors.outline }
              ]}
            >
              {formatRadius(minRadius)}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.rangeLabel,
                { color: theme.colors.outline }
              ]}
            >
              {formatRadius(maxRadius)}
            </Text>
          </View>
        </View>

        <IconButton
          icon="plus"
          size={24}
          iconColor={theme.colors.primary}
          onPress={increaseRadius}
          disabled={radius >= maxRadius}
          style={[
            styles.sliderButton,
            { backgroundColor: theme.colors.primaryContainer }
          ]}
        />
      </View>

      {/* Preset Buttons */}
      <View style={styles.presetsContainer}>
        <Text
          variant="bodySmall"
          style={[
            styles.presetsLabel,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          Quick select:
        </Text>
        <View style={styles.presetButtons}>
          {presetRadii.map((preset) => (
            <Button
              key={preset}
              mode={radius === preset ? 'contained' : 'outlined'}
              compact
              onPress={() => setPresetRadius(preset)}
              style={[
                styles.presetButton,
                radius === preset && {
                  backgroundColor: theme.colors.primaryContainer,
                }
              ]}
              labelStyle={[
                styles.presetButtonLabel,
                {
                  color: radius === preset 
                    ? theme.colors.onPrimaryContainer 
                    : theme.colors.primary
                }
              ]}
            >
              {formatRadius(preset)}
            </Button>
          ))}
        </View>
      </View>

      {/* Visual indicator */}
      <View style={styles.visualIndicator}>
        <View
          style={[
            styles.indicatorCircle,
            {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
            }
          ]}
        >
          <Text
            variant="bodySmall"
            style={[
              styles.indicatorText,
              { color: theme.colors.onPrimaryContainer }
            ]}
          >
            📍
          </Text>
        </View>
        <Text
          variant="bodySmall"
          style={[
            styles.indicatorLabel,
            { color: theme.colors.onSurfaceVariant }
          ]}
        >
          You'll be notified when you enter this area
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  radiusValue: {
    fontWeight: '700',
    fontSize: 32,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderButton: {
    margin: 0,
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },
  slider: {
    height: 40,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderMinTrack: {
    height: 4,
    borderRadius: 2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 12,
  },
  presetsContainer: {
    marginBottom: 20,
  },
  presetsLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    borderRadius: 20,
    minWidth: 60,
  },
  presetButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  visualIndicator: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  indicatorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 16,
  },
  indicatorLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default RadiusSelectorSlider;
