import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { getActiveReminders } from '../data/mockData';
import ReminderItem from '../components/ReminderItem';
import FloatingActionButton from '../components/FloatingActionButton';
import EmptyState from '../components/EmptyState';
import { colors, globalStyles, spacing } from '../styles/styles';

const MainScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load reminders on component mount
  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const activeReminders = getActiveReminders();
      setReminders(activeReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReminders();
    setIsRefreshing(false);
  };

  const handleReminderPress = (reminder) => {
    // Navigate to reminder details or edit screen
    Alert.alert(
      'Reminder Details',
      `Title: ${reminder.title}\nLocation: ${reminder.location}`,
      [{ text: 'OK' }]
    );
  };

  const handleAddReminder = () => {
    // Navigate to add reminder screen
    Alert.alert(
      'Add Reminder',
      'This would navigate to the Add Reminder screen',
      [{ text: 'OK' }]
    );
    // In a real app, you would use:
    // navigation.navigate('AddReminder');
  };

  const renderReminderItem = ({ item, index }) => (
    <ReminderItem
      reminder={item}
      onPress={handleReminderPress}
      testID={`reminder-item-${index}`}
    />
  );

  const renderEmptyComponent = () => (
    <EmptyState
      title="No Active Reminders"
      message="Create your first location-based reminder to get started. You'll be notified when you arrive at or leave your chosen locations."
    />
  );

  const renderHeader = () => (
    <View style={globalStyles.header}>
      <Text style={globalStyles.headerTitle}>My Reminders</Text>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      
      {renderHeader()}
      
      <View style={globalStyles.container}>
        <FlatList
          data={reminders}
          renderItem={renderReminderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            globalStyles.listContainer,
            reminders.length === 0 && { flex: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyComponent : null}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          testID="reminders-list"
        />
        
        <FloatingActionButton
          onPress={handleAddReminder}
          icon="+"
          testID="add-reminder-fab"
        />
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
