# Development Setup Guide

This guide will help you set up the GeoRem location-based reminder app for development.

## 📋 Prerequisites

### Required Software
- **Node.js** (16.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Expo CLI** - `npm install -g @expo/cli`
- **Android Studio** - For Android development and device testing
- **Git** - Version control

### Android Development Setup
1. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 21 or higher)
   - Set up Android Virtual Device (AVD) or connect physical device

2. **Enable Developer Options on Android Device**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Enable "USB Debugging" in Developer Options

## 🚀 Quick Start

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd georem-location-reminder

# Install dependencies
npm install

# Start Expo development server
npm start
```

### 2. Configure Google Places API
```bash
# Get API key from Google Cloud Console
# Enable Places API and Maps SDK for Android
# Replace YOUR_GOOGLE_PLACES_API_KEY in:
# src/components/LocationPickerMap.jsx (line 185)
```

### 3. Run on Device
```bash
# For Android
npm run android

# Or scan QR code with Expo Go app
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
GOOGLE_PLACES_API_KEY=your_api_key_here
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Google Cloud Console Setup
1. Create a new project or select existing one
2. Enable the following APIs:
   - Places API
   - Maps SDK for Android
   - Geocoding API (optional)
3. Create credentials (API Key)
4. Restrict API key to Android apps (optional but recommended)

### Android Permissions
The app requires these permissions (already configured in `app.json`):
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `VIBRATE`
- `RECEIVE_BOOT_COMPLETED`
- `WAKE_LOCK`

## 🧪 Testing Setup

### Physical Device Testing (Recommended)
Geofencing requires a physical device for proper testing:

1. **Enable Developer Mode**
   - Settings > About Phone > Tap Build Number 7 times
   - Enable USB Debugging in Developer Options

2. **Install via USB**
   ```bash
   npm run android
   ```

3. **Test Geofencing**
   - Create a reminder at your current location
   - Walk away and return to test notifications
   - Use small radius (100-200m) for easier testing

### Emulator Testing (Limited)
Android emulator has limited location simulation:
```bash
# Start emulator with Google Play Services
emulator -avd <your_avd_name> -google-apis
```

### Debug Tools
- **React Native Debugger** - For component inspection
- **Flipper** - For network and storage debugging
- **ADB Logcat** - For native Android logs

## 📱 Build Configuration

### Development Build
```bash
# Create development build
expo build:android --type apk

# Or using EAS Build (recommended)
npm install -g @expo/eas-cli
eas build --platform android --profile development
```

### Production Build
```bash
# Configure app signing in app.json
# Build production APK
eas build --platform android --profile production
```

## 🔍 Debugging

### Common Debug Commands
```bash
# View logs
npx react-native log-android

# Clear cache
npm start --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

### Geofencing Debug
Enable debug mode in `src/utils/GeofenceSetupUtil.js`:
```javascript
debug: true, // Set to true for development
logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
```

### Storage Debug
Check AsyncStorage contents:
```javascript
// Add to any component for debugging
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const stores = await AsyncStorage.multiGet(keys);
  console.log('Storage contents:', stores);
};
```

## 📊 Performance Monitoring

### Battery Usage
Monitor battery usage during development:
- Use Android's Battery Optimization settings
- Test with different geofence radii
- Monitor background location frequency

### Memory Usage
```bash
# Monitor memory usage
adb shell dumpsys meminfo com.georem.locationreminder
```

## 🚨 Troubleshooting

### Location Issues
- **Permissions**: Ensure all location permissions are granted
- **GPS**: Test with GPS enabled and good signal
- **Battery**: Disable battery optimization for the app

### Build Issues
```bash
# Clean build
cd android && ./gradlew clean && cd ..
npm start --clear

# Reset node modules
rm -rf node_modules package-lock.json
npm install
```

### Notification Issues
- Test notification permissions
- Check Do Not Disturb settings
- Verify notification channels (Android 8+)

## 📚 Development Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [React Navigation](https://reactnavigation.org/)
- [Background Geolocation](https://github.com/transistorsoft/react-native-background-geolocation)

### Design Resources
- [Material 3 Design Kit](https://www.figma.com/community/file/1035203688168086460)
- [Material Design Guidelines](https://m3.material.io/)
- [Android Design Patterns](https://developer.android.com/design)

### Testing Tools
- [Expo Go](https://expo.dev/client) - For quick testing
- [Android Studio Emulator](https://developer.android.com/studio/run/emulator)
- [Genymotion](https://www.genymotion.com/) - Alternative emulator

## 🔄 Development Workflow

### Recommended Workflow
1. **Feature Development**
   - Create feature branch
   - Develop with hot reload
   - Test on physical device

2. **Testing**
   - Unit tests for utilities
   - Integration tests for geofencing
   - Manual testing on various devices

3. **Code Review**
   - Check performance impact
   - Verify Material 3 compliance
   - Test accessibility features

4. **Deployment**
   - Build development APK
   - Test on multiple devices
   - Create production build

### Git Hooks (Optional)
```bash
# Install husky for pre-commit hooks
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## 📞 Support

If you encounter issues:
1. Check this setup guide
2. Review the main README.md
3. Check existing GitHub issues
4. Create a new issue with:
   - Device information
   - Android version
   - Error logs
   - Steps to reproduce

---

Happy coding! 🚀
