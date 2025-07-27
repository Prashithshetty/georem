import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';

const TypeToggle = ({ selectedType, onTypeChange, testID }) => {
  const slideAnimation = React.useRef(new Animated.Value(selectedType === 'sentence' ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: selectedType === 'sentence' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selectedType, slideAnimation]);

  const handleTypeSelect = (type) => {
    if (type !== selectedType) {
      onTypeChange(type);
    }
  };

  const slideInterpolation = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.toggleContainer}>
        <Animated.View 
          style={[
            styles.slider,
            {
              left: slideInterpolation,
            }
          ]} 
        />
        
        <TouchableOpacity
          style={[styles.option, selectedType === 'sentence' && styles.selectedOption]}
          onPress={() => handleTypeSelect('sentence')}
          testID={`${testID}-sentence`}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>📝</Text>
            <Text style={[
              styles.optionText,
              selectedType === 'sentence' && styles.selectedOptionText
            ]}>
              Single Note
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.option, selectedType === 'checklist' && styles.selectedOption]}
          onPress={() => handleTypeSelect('checklist')}
          testID={`${testID}-checklist`}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>✅</Text>
            <Text style={[
              styles.optionText,
              selectedType === 'checklist' && styles.selectedOptionText
            ]}>
              Checklist
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>
        {selectedType === 'sentence' 
          ? 'Create a simple text reminder with a single description'
          : 'Create a checklist with multiple items you can check off'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    position: 'relative',
    ...shadows.small,
  },
  slider: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    width: '50%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedOption: {
    // Styling handled by slider background
  },
  optionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  optionText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
  },
});

export default TypeToggle;
