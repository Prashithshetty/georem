# Build Instructions for GeoRem App with UI Updates

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for building (`npm install -g eas-cli`)

## Steps to Build the App

### 1. Navigate to the Project Directory
```bash
cd LocationReminderApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App Locally (Development)
```bash
# Start the development server
npx expo start

# For Android
npx expo start --android

# For iOS
npx expo start --ios

# For Web
npx expo start --web
```

### 4. Build for Production

#### Option A: Using EAS Build (Recommended)
```bash
# Login to your Expo account
eas login

# Configure the build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

#### Option B: Local Build
```bash
# For Android APK
npx expo build:android -t apk

# For Android App Bundle
npx expo build:android -t app-bundle

# For iOS
npx expo build:ios
```

## Important Notes

1. **Directory Name**: Make sure you're in the `LocationReminderApp` directory when running build commands.

2. **API Keys**: The app uses Google Maps API. Make sure to add your API key in:
   - `app.json` or `app.config.js` for the Google Maps configuration

3. **Permissions**: The app requires the following permissions:
   - Location (Always/When In Use)
   - Notifications
   - Background Location (for geofencing)

## Testing the New Features

After building and installing the app:

1. **Location History**:
   - Create a few reminders with different locations
   - Go back to create a new reminder
   - You should see "Frequently Used" and "Recent Locations" sections

2. **Quick Location Picker**:
   - In the create reminder screen, look for the quick location selection above the location button
   - Tap on any suggested location for one-tap selection

3. **Statistics Dashboard**:
   - On the main screen, view the statistics showing active, total, and recent reminders
   - Toggle the stats view with the 📊 button

4. **Filters**:
   - Use the filter buttons (All, Active, Inactive) to filter reminders

## Troubleshooting

### Build Fails with "package.json not found"
- Ensure you're in the correct directory: `LocationReminderApp`
- The package.json file should be in the root of this directory

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

### Expo CLI Issues
```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Clear Expo cache
expo doctor --fix-dependencies
```

## Development Tips

1. **Hot Reload**: The app supports hot reload. Make changes to see them instantly.

2. **Debug Mode**: Use React Native Debugger or Chrome DevTools for debugging.

3. **Testing Location History**: 
   - You can manually test by creating multiple reminders
   - Location history persists across app restarts

4. **Clearing Data**: To reset the app data including location history:
   - Uninstall and reinstall the app
   - Or clear app data from device settings

## Contact
If you encounter any issues, check the error logs and ensure all dependencies are properly installed.
