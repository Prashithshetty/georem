import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';

const ChecklistItem = ({ 
  item, 
  index, 
  onTextChange, 
  onRemove, 
  canRemove = true,
  testID 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localText, setLocalText] = useState(item.text);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  // Auto-focus new empty items
  useEffect(() => {
    if (item.text === '' && index === 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [item.text, index]);

  const handleTextChange = (text) => {
    setLocalText(text);
    onTextChange(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnimation, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleRemove = () => {
    if (!canRemove) return;

    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove();
    });
  };

  const renderRemoveButton = () => {
    if (!canRemove) return null;

    return (
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        testID={`${testID}-remove`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnimation }],
          opacity: fadeAnimation,
        }
      ]}
      testID={testID}
    >
      <View style={[
        styles.itemContainer,
        isFocused && styles.focusedContainer
      ]}>
        <View style={styles.bulletContainer}>
          <View style={styles.bullet} />
        </View>
        
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            isFocused && styles.focusedInput
          ]}
          value={localText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={`Item ${index + 1}...`}
          placeholderTextColor={colors.textSecondary}
          maxLength={200}
          multiline
          testID={`${testID}-input`}
        />
        
        {renderRemoveButton()}
      </View>
      
      {localText.length > 150 && (
        <Text style={styles.characterCount}>
          {localText.length}/200
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.small,
  },
  focusedContainer: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  bulletContainer: {
    paddingTop: spacing.xs,
    paddingRight: spacing.sm,
    alignItems: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  textInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    minHeight: 20,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  focusedInput: {
    color: colors.text,
  },
  removeButton: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '10', // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.error,
    lineHeight: 18,
  },
  characterCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginRight: spacing.sm,
  },
});

export default ChecklistItem;
