import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  List,
  IconButton,
  Text,
  Surface,
  useTheme,
  Divider,
} from 'react-native-paper';

/**
 * ChecklistInput Component
 * Allows users to create and manage checklist items for reminders
 * Features Material 3 design with smooth animations
 */
const ChecklistInput = ({ checklist = [], onChecklistChange }) => {
  const [newItem, setNewItem] = useState('');
  const theme = useTheme();

  /**
   * Add a new item to the checklist
   */
  const addItem = () => {
    if (newItem.trim().length === 0) {
      Alert.alert('Empty Item', 'Please enter an item before adding.');
      return;
    }

    if (newItem.trim().length > 100) {
      Alert.alert('Item Too Long', 'Please keep items under 100 characters.');
      return;
    }

    const updatedChecklist = [...checklist, newItem.trim()];
    onChecklistChange(updatedChecklist);
    setNewItem('');
  };

  /**
   * Remove an item from the checklist
   * @param {number} index - Index of item to remove
   */
  const removeItem = (index) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedChecklist = checklist.filter((_, i) => i !== index);
            onChecklistChange(updatedChecklist);
          },
        },
      ]
    );
  };

  /**
   * Edit an existing item
   * @param {number} index - Index of item to edit
   * @param {string} currentItem - Current item text
   */
  const editItem = (index, currentItem) => {
    Alert.prompt(
      'Edit Item',
      'Update your checklist item:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: (text) => {
            if (text && text.trim().length > 0) {
              const updatedChecklist = [...checklist];
              updatedChecklist[index] = text.trim();
              onChecklistChange(updatedChecklist);
            }
          },
        },
      ],
      'plain-text',
      currentItem
    );
  };

  /**
   * Render individual checklist item
   */
  const renderChecklistItem = ({ item, index }) => (
    <Surface
      style={[
        styles.itemContainer,
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
      elevation={1}
    >
      <List.Item
        title={item}
        titleStyle={[
          styles.itemText,
          { color: theme.colors.onSurfaceVariant }
        ]}
        titleNumberOfLines={2}
        left={(props) => (
          <List.Icon
            {...props}
            icon="checkbox-blank-circle-outline"
            color={theme.colors.primary}
          />
        )}
        right={() => (
          <View style={styles.itemActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => editItem(index, item)}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => removeItem(index)}
              style={styles.actionButton}
            />
          </View>
        )}
        onPress={() => editItem(index, item)}
        style={styles.listItem}
      />
    </Surface>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text
        variant="titleMedium"
        style={[styles.header, { color: theme.colors.onSurface }]}
      >
        Checklist Items
      </Text>
      
      {/* Add new item input */}
      <Surface
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surface }
        ]}
        elevation={2}
      >
        <TextInput
          mode="outlined"
          label="Add checklist item"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
          returnKeyType="done"
          maxLength={100}
          multiline={false}
          style={styles.textInput}
          contentStyle={styles.inputContent}
          outlineStyle={styles.inputOutline}
          right={
            <TextInput.Icon
              icon="plus"
              onPress={addItem}
              disabled={newItem.trim().length === 0}
            />
          }
        />
        
        <Button
          mode="contained"
          onPress={addItem}
          disabled={newItem.trim().length === 0}
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
          labelStyle={styles.addButtonLabel}
        >
          Add Item
        </Button>
      </Surface>

      <Divider style={styles.divider} />

      {/* Checklist items */}
      {checklist.length > 0 ? (
        <View style={styles.listContainer}>
          <Text
            variant="bodyMedium"
            style={[
              styles.itemCount,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            {checklist.length} item{checklist.length !== 1 ? 's' : ''}
          </Text>
          
          <FlatList
            data={checklist}
            renderItem={renderChecklistItem}
            keyExtractor={(item, index) => `checklist-${index}`}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />
        </View>
      ) : (
        <Surface
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.colors.surfaceVariant }
          ]}
          elevation={1}
        >
          <List.Icon
            icon="format-list-checks"
            size={48}
            color={theme.colors.outline}
          />
          <Text
            variant="bodyLarge"
            style={[
              styles.emptyText,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            No items yet
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.emptySubtext,
              { color: theme.colors.outline }
            ]}
          >
            Add items to create your checklist
          </Text>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 12,
  },
  inputContent: {
    paddingHorizontal: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  addButton: {
    borderRadius: 12,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  listContainer: {
    flex: 1,
  },
  itemCount: {
    marginBottom: 12,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  itemSeparator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginTop: 16,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChecklistInput;
