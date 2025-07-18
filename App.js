import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReminderInputScreen from './src/screens/ReminderInputScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';

// Components
import ErrorBoundary from './src/components/ErrorBoundary';

// Material 3 Theme
import { MD3LightTheme } from 'react-native-paper';

// Configuration
import { validateConfiguration, isDevelopment } from './src/config/environment';

const Stack = createStackNavigator();

// Custom Material 3 theme with expressive colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    primaryContainer: '#EADDFF',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    tertiary: '#7D5260',
    tertiaryContainer: '#FFD8E4',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    background: '#FFFBFE',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#21005D',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1D192B',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#31111D',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#6750A4',
  },
  roundness: 16, // Material 3 expressive rounded corners
};

export default function App() {
  // Validate configuration on app start
  React.useEffect(() => {
    const validation = validateConfiguration();
    if (!validation.isValid && isDevelopment()) {
      console.warn('⚠️ App Configuration Issues:', validation.errors);
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.surface,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 22,
                },
                cardStyle: {
                  backgroundColor: theme.colors.background,
                },
              }}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                  title: 'Location Reminders',
                  headerStyle: {
                    backgroundColor: theme.colors.surface,
                    elevation: 2,
                  },
                }}
              />
              <Stack.Screen 
                name="ReminderInput" 
                component={ReminderInputScreen}
                options={{
                  title: 'Create Reminder',
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen 
                name="LocationPicker" 
                component={LocationPickerScreen}
                options={{
                  title: 'Choose Location',
                  headerBackTitleVisible: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
