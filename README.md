# GeoRem - Location Reminder App

A React Native Expo application for creating location-based reminders with geofencing capabilities.

## 📱 Features

- **Location-Based Reminders**: Create reminders that trigger when you arrive at or leave specific locations
- **Geofencing**: Background location monitoring with Expo Location services
- **Push Notifications**: Receive notifications even when the app is closed
- **Search Locations**: Search for places using the built-in location search
- **Current Location**: Use your current location to set reminders
- **Custom Radius**: Set custom radius for each reminder (100m - 5km)
- **Modern UI**: Clean, responsive design with smooth animations
- **Cross-Platform**: Works on both Android and iOS

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for building (`npm install -g eas-cli`)
- Expo Go app on your phone (for development)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd georem
```

2. **Navigate to the project directory:**
```bash
cd LocationReminderApp
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start the development server:**
```bash
npm start
```

5. **Run on your device:**
- Scan the QR code with Expo Go app (Android) or Camera app (iOS)
- Or press `a` for Android emulator, `i` for iOS simulator

## 📱 Building the App

### Building APK with EAS Build

1. **Login to Expo:**
```bash
eas login
```

2. **Configure EAS Build (first time only):**
```bash
eas build:configure
```

3. **Build APK for Android:**
```bash
# For testing (APK)
eas build --platform android --profile preview

# For production (AAB for Play Store)
eas build --platform android --profile production
```

4. **Download the build:**
- Once complete, you'll get a download link
- Or check builds: `eas build:list`

### Build Profiles

The app includes three build profiles in `eas.json`:
- **development**: Debug builds with dev tools
- **preview**: APK builds for testing
- **production**: AAB builds for app stores

## 🏗️ Project Structure

```
LocationReminderApp/
├── App.js                    # Main app entry point
├── app.json                  # Expo configuration
├── app.config.js            # Dynamic app configuration
├── package.json             # Dependencies
├── eas.json                 # EAS Build configuration
├── assets/                  # App icons and images
└── src/
    ├── components/          # Reusable UI components
    ├── screens/            # App screens
    ├── services/           # Business logic services
    ├── context/            # React Context for state
    ├── data/              # Mock data and constants
    ├── styles/            # Styling constants
    └── utils/             # Utility functions
```

## 🔧 Configuration

### App Permissions

The app requires the following permissions:
- **Location** (Always): For geofencing to work in background
- **Notifications**: For reminder alerts
- **Background Location**: For monitoring geofences

### Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and build service
- **Expo Location**: Geofencing and location services
- **Expo Notifications**: Push notifications
- **AsyncStorage**: Local data persistence
- **React Context**: State management

## 🎨 Features Overview

### Creating Reminders
1. Tap the floating action button (+)
2. Search for a location or use current location
3. Set reminder details (title, notes, radius)
4. Choose trigger type (arrive/leave)
5. Save the reminder

### Managing Reminders
- View all reminders on the main screen
- Toggle reminders on/off
- Delete reminders by swiping or long-press
- See geofence status indicators

### Location Search
- Search by place name, address, or coordinates
- View search results with addresses
- Select from suggestions
- Use current location option

## 🐛 Troubleshooting

### Common Issues

1. **Location permissions not working:**
   - Go to device settings
   - Find the app and grant "Allow all the time" permission
   - Ensure location services are enabled

2. **Notifications not showing:**
   - Check notification permissions in settings
   - Disable battery optimization for the app
   - Ensure Do Not Disturb is off

3. **Geofencing not triggering:**
   - Verify background location permission
   - Check that the reminder is enabled
   - Ensure you're outside the geofence before testing

4. **Build failures:**
   - Clear cache: `expo start --clear`
   - Delete node_modules and reinstall
   - Check EAS build logs for errors

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed error logs when reporting bugs

---

Built with ❤️ using React Native and Expo
