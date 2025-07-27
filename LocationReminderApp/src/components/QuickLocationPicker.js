import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';
import LocationHistoryService from '../services/LocationHistoryService';

const QuickLocationPicker = ({ onLocationSelect, selectedLocation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const animatedHeight = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const loadSuggestions = async () => {
    try {
      const locationSuggestions = await LocationHistoryService.getLocationSuggestions();
      setSuggestions(locationSuggestions);
    } catch (error) {
      console.error('Error loading location suggestions:', error);
    }
  };

  const handleLocationPress = (location) => {
    if (onLocationSelect) {
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    }
  };

  const isLocationSelected = (location) => {
    if (!selectedLocation) return false;
    return (
      Math.abs(selectedLocation.latitude - location.latitude) < 0.0001 &&
      Math.abs(selectedLocation.longitude - location.longitude) < 0.0001
    );
  };

  if (suggestions.length === 0) {
    return null;
  }

  const maxHeight = suggestions.length * 50 + 40; // Approximate height calculation

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>Quick Location Selection</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      <Animated.View
        style={[
          styles.suggestionsContainer,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight],
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {suggestions.map((location, index) => (
            <TouchableOpacity
              key={location.id || index}
              style={[
                styles.suggestionItem,
                isLocationSelected(location) && styles.selectedItem,
              ]}
              onPress={() => handleLocationPress(location)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionIcon}>
                {location.frequency ? '⭐' : '📍'}
              </Text>
              <Text
                style={[
                  styles.suggestionText,
                  isLocationSelected(location) && styles.selectedText,
                ]}
                numberOfLines={1}
              >
                {location.address?.split(',')[0] || 'Unknown Location'}
              </Text>
              {location.frequency && (
                <View style={styles.frequencyBadge}>
                  <Text style={styles.frequencyText}>{location.frequency}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  headerText: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
  },
  expandIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  suggestionsContainer: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: spacing.xs,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  selectedItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.text,
    maxWidth: 120,
  },
  selectedText: {
    color: colors.surface,
    fontWeight: '600',
  },
  frequencyBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  frequencyText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default QuickLocationPicker;
