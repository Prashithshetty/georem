import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  SectionList,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows, globalStyles } from '../styles/styles';
import {
  requestLocationPermission,
  getCurrentLocation,
  formatCoordinates,
} from '../utils/locationUtils';
import LocationHistoryService from '../services/LocationHistoryService';
import LocationHistoryItem from '../components/LocationHistoryItem';

const LocationSelectionScreenSearch = ({ navigation, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [frequentLocations, setFrequentLocations] = useState([]);
  const [showClearHistory, setShowClearHistory] = useState(false);

  useEffect(() => {
    initializeLocation();
    loadLocationHistory();
  }, []);

  const initializeLocation = async () => {
    try {
      const permissionGranted = await requestLocationPermission();
      setHasLocationPermission(permissionGranted);
    } catch (error) {
      console.error('Location initialization error:', error);
    }
  };

  const loadLocationHistory = async () => {
    try {
      const recent = await LocationHistoryService.getRecentLocations(5);
      const frequent = await LocationHistoryService.getFrequentLocations(3);
      setRecentLocations(recent);
      setFrequentLocations(frequent);
    } catch (error) {
      console.error('Error loading location history:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please grant location permission to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      
      // Try to get address for current location
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      setSelectedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        address: address || formatCoordinates(location.latitude, location.longitude),
      });
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using Nominatim API (OpenStreetMap) - no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'GeoRem/1.0', // Required by Nominatim
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedResults = data.map((item, index) => ({
          id: index.toString(),
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
          importance: item.importance,
        }));
        setSearchResults(formattedResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      performLocalSearch(query);
    } finally {
      setIsSearching(false);
    }
  };

  const performLocalSearch = (query) => {
    // Fallback local search for common places
    const localPlaces = [
      { name: 'New York City', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
      { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
      { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
      { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Paris', lat: 48.8566, lng: 2.3522 },
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    ];

    const filtered = localPlaces
      .filter(place => place.name.toLowerCase().includes(query.toLowerCase()))
      .map((place, index) => ({
        id: `local-${index}`,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        type: 'city',
      }));

    setSearchResults(filtered);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'GeoRem/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.display_name;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  };

  const handleLocationSelect = (location) => {
    const formattedLocation = {
      latitude: location.lat || location.latitude,
      longitude: location.lng || location.longitude,
      address: location.name || location.address,
    };
    
    setSelectedLocation(formattedLocation);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleHistoryItemRemove = async (locationId) => {
    try {
      await LocationHistoryService.removeFromHistory(locationId);
      loadLocationHistory();
    } catch (error) {
      console.error('Error removing location from history:', error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Location History',
      'Are you sure you want to clear all location history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await LocationHistoryService.clearAll();
              setRecentLocations([]);
              setFrequentLocations([]);
              setShowClearHistory(false);
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear location history');
            }
          }
        }
      ]
    );
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please select a location before confirming.');
      return;
    }

    const locationData = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: selectedLocation.address || formatCoordinates(selectedLocation.latitude, selectedLocation.longitude),
      timestamp: new Date().toISOString(),
    };

    if (onLocationSelect) {
      onLocationSelect(locationData);
    }

    navigation?.goBack?.();
  };

  const handleCancel = () => {
    navigation?.goBack?.();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Select Location</Text>
      <TouchableOpacity onPress={handleConfirmLocation} style={styles.headerButton}>
        <Text style={[styles.headerButtonText, styles.confirmButton]}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => searchLocation(searchQuery)}
          placeholder="Search for a place or address..."
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => searchLocation(searchQuery)}
        disabled={!searchQuery.trim() || isSearching}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Text style={styles.resultIcon}>📍</Text>
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name.split(',')[0]}
        </Text>
        <Text style={styles.resultAddress} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLocationHistorySections = () => {
    const sections = [];
    
    if (frequentLocations.length > 0) {
      sections.push({
        title: 'Frequently Used',
        data: frequentLocations,
        isFrequent: true,
      });
    }
    
    if (recentLocations.length > 0) {
      sections.push({
        title: 'Recent Locations',
        data: recentLocations,
        isFrequent: false,
      });
    }

    if (sections.length === 0) {
      return (
        <View style={styles.emptyHistoryContainer}>
          <Text style={styles.emptyHistoryText}>No location history yet</Text>
          <Text style={styles.emptyHistorySubtext}>
            Your recently used locations will appear here
          </Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id || `location-${index}`}
        renderItem={({ item, section }) => (
          <LocationHistoryItem
            location={item}
            onPress={handleLocationSelect}
            onRemove={showClearHistory ? handleHistoryItemRemove : null}
            showFrequency={section.isFrequent}
            isFrequent={section.isFrequent}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.title === 'Recent Locations' && recentLocations.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowClearHistory(!showClearHistory)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {showClearHistory ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        ListFooterComponent={() => showClearHistory && (
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={handleClearHistory}
          >
            <Text style={styles.clearHistoryText}>Clear All History</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.historyList}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting current location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderSearchBar()}

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={!hasLocationPermission}
        >
          <Text style={styles.currentLocationIcon}>📱</Text>
          <Text style={styles.currentLocationText}>
            {hasLocationPermission ? 'Use Current Location' : 'Location Permission Required'}
          </Text>
        </TouchableOpacity>

        {/* Search Results */}
        {isSearching ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResultsList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : searchQuery.length === 0 && (
          <View style={styles.recentSearchesContainer}>
            {renderLocationHistorySections()}
          </View>
        )}

        {/* Selected Location Display */}
        {selectedLocation && (
          <View style={styles.selectedLocationCard}>
            <Text style={styles.selectedLocationTitle}>Selected Location</Text>
            <Text style={styles.selectedLocationAddress} numberOfLines={2}>
              {selectedLocation.address}
            </Text>
            <Text style={styles.selectedLocationCoords}>
              {formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  confirmButton: {
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    fontSize: 18,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  searchButtonText: {
    ...typography.body2,
    color: colors.surface,
    fontWeight: '600',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  currentLocationIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  currentLocationText: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  searchingText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  searchResultsList: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  resultAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.xs,
  },
  recentSearchesContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  historyList: {
    paddingBottom: spacing.lg,
  },
  sectionSeparator: {
    height: spacing.md,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyHistoryText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyHistorySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  clearHistoryButton: {
    backgroundColor: colors.error + '10',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearHistoryText: {
    ...typography.body2,
    color: colors.error,
    fontWeight: '600',
  },
  selectedLocationCard: {
    backgroundColor: colors.secondary + '20',
    borderWidth: 1,
    borderColor: colors.secondary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectedLocationTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectedLocationAddress: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  selectedLocationCoords: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default LocationSelectionScreenSearch;
