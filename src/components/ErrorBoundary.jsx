import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
} from 'react-native-paper';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI and error reporting for production stability
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // In production, you might want to send error reports to a service
    // like Sentry, Bugsnag, or Firebase Crashlytics
    if (!__DEV__) {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRestart={this.handleRestart}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback Component
 * Fallback UI displayed when an error occurs
 */
const ErrorFallback = ({ error, errorInfo, onRestart }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface
        style={[
          styles.errorCard,
          { backgroundColor: theme.colors.errorContainer }
        ]}
        elevation={4}
      >
        <Text
          variant="displaySmall"
          style={[
            styles.errorIcon,
            { color: theme.colors.onErrorContainer }
          ]}
        >
          ⚠️
        </Text>
        
        <Text
          variant="headlineSmall"
          style={[
            styles.errorTitle,
            { color: theme.colors.onErrorContainer }
          ]}
        >
          Something went wrong
        </Text>
        
        <Text
          variant="bodyLarge"
          style={[
            styles.errorMessage,
            { color: theme.colors.onErrorContainer }
          ]}
        >
          The app encountered an unexpected error. Don't worry, your reminders are safe!
        </Text>

        {__DEV__ && error && (
          <Surface
            style={[
              styles.debugInfo,
              { backgroundColor: theme.colors.surface }
            ]}
            elevation={2}
          >
            <Text
              variant="titleSmall"
              style={[
                styles.debugTitle,
                { color: theme.colors.error }
              ]}
            >
              Debug Information:
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.debugText,
                { color: theme.colors.onSurface }
              ]}
            >
              {error.toString()}
            </Text>
            {errorInfo && (
              <Text
                variant="bodySmall"
                style={[
                  styles.debugText,
                  { color: theme.colors.onSurfaceVariant }
                ]}
              >
                {errorInfo.componentStack}
              </Text>
            )}
          </Surface>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={onRestart}
            style={[
              styles.restartButton,
              { backgroundColor: theme.colors.primary }
            ]}
            labelStyle={{ color: theme.colors.onPrimary }}
            icon="restart"
          >
            Restart App
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  debugInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  debugTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  actions: {
    width: '100%',
  },
  restartButton: {
    borderRadius: 12,
  },
});

export default ErrorBoundary;
