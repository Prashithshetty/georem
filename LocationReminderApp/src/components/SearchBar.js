import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/styles';
import { geocodeAddress } from '../utils/locationUtils';

const SearchBar = ({ onLocationSelect, onClear, placeholder = 'Search location...' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  const searchTimeout = React.useRef(null);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Use real geocoding
      const result = await geocodeAddress(query);
      
      if (result) {
        // For now, we'll show single result. In future, we can enhance to show multiple
        const results = [{
          id: '1',
          name: query,
          address: result.address || query,
          latitude: result.latitude,
          longitude: result.longitude,
        }];
        
        setSearchResults(results);
        setShowResults(true);
      } else {
        // If geocoding fails, try with common location prefixes
        const enhancedQueries = [
          query,
          `${query} city`,
          `${query} town`,
          `${query} street`,
        ];
        
        let foundResult = null;
        for (const enhancedQuery of enhancedQueries) {
          const enhancedResult = await geocodeAddress(enhancedQuery);
          if (enhancedResult) {
            foundResult = enhancedResult;
            break;
          }
        }
        
        if (foundResult) {
          const results = [{
            id: '1',
            name: query,
            address: foundResult.address || query,
            latitude: foundResult.latitude,
            longitude: foundResult.longitude,
          }];
          
          setSearchResults(results);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
          // Don't show alert for every failed search, just log it
          console.log('No results found for:', query);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleTextChange = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      handleSearch(text);
    }, 800); // Increased delay for geocoding API
  };

  const handleResultPress = (result) => {
    setSearchQuery(result.name);
    setShowResults(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.address || result.name,
      });
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    
    if (onClear) {
      onClear();
    }
  };

  const handleSubmitEditing = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.resultIcon}>📍</Text>
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultText} numberOfLines={1}>
          {item.name}
        </Text>
        {item.address && item.address !== item.name && (
          <Text style={styles.resultSubtext} numberOfLines={1}>
            {item.address}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyResults = () => {
    if (!searchQuery.trim() || isSearching) return null;
    
    return (
      <View style={styles.emptyResultsContainer}>
        <Text style={styles.emptyResultsText}>
          No results found for "{searchQuery}"
        </Text>
        <Text style={styles.emptyResultsSubtext}>
          Try searching for a city, address, or landmark
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={handleSubmitEditing}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        {isSearching && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        )}
      </View>
      
      {showResults && (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            renderEmptyResults()
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.medium,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    maxHeight: 250,
    ...shadows.large,
  },
  resultsList: {
    borderRadius: borderRadius.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  resultSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyResultsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyResultsText: {
    ...typography.body2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyResultsSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SearchBar;
