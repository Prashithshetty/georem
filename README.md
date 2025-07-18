# GeoRem - Location-Based Reminder App

A modern, Android-only, offline location-based reminder app built with React Native + Expo. Features Material You (Material 3) design and native geofencing capabilities.

## 🚀 Features

### ✨ Core Functionality
- **Offline-First**: No cloud backend required - all data stored locally
- **Native Geofencing**: Uses device-native geofencing APIs for battery-efficient location monitoring
- **Material 3 Design**: Modern, expressive UI following Material You design guidelines
- **Dual Reminder Types**: Support for both simple notes and interactive checklists
- **Smart Notifications**: Location-triggered notifications with vibration and sound

### 📱 User Interface
- **Intuitive Creation Flow**: Easy-to-use reminder creation with location picker
- **Interactive Maps**: Google Places autocomplete with draggable pins
- **Flexible Radius Selection**: Customizable geofence radius (100m - 1km)
- **Visual Feedback**: Real-time map visualization of geofence areas
- **Responsive Design**: Optimized for various Android screen sizes

### 🔧 Technical Features
- **Background Processing**: Geofences work even when app is closed
- **Permission Management**: Proper handling of location and notification permissions
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimized**: Efficient storage and minimal battery drain

## 📋 Requirements

- **Platform**: Android only
- **Node.js**: 16.x or higher
- **Expo CLI**: Latest version
- **Android Studio**: For device testing
- **Google Places API Key**: For location search functionality

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd georem-location-reminder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Places API**
   - Get a Google Places API key from Google Cloud Console
   - Replace `YOUR_GOOGLE_PLACES_API_KEY` in `src/components/LocationPickerMap.jsx`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on Android device**
   ```bash
   npm run android
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ChecklistInput.jsx          # Checklist management component
│   ├── LocationPickerMap.jsx       # Interactive map with autocomplete
│   └── RadiusSelectorSlider.jsx    # Radius selection slider
├── screens/
│   ├── HomeScreen.jsx              # Main screen showing all reminders
│   ├── ReminderInputScreen.jsx     # Reminder creation form
│   └── LocationPickerScreen.jsx    # Location and radius selection
├── hooks/
│   └── useGeofenceTrigger.js       # Geofence event handling hook
├── utils/
│   └── GeofenceSetupUtil.js        # Native geofencing utilities
└── store/
    └── storage.js                  # Local data persistence
```

## 🎨 Design System

The app follows Material 3 (Material You) design principles:

- **Color System**: Dynamic color theming with primary, secondary, and tertiary colors
- **Typography**: Material 3 type scale with appropriate font weights
- **Elevation**: Proper surface elevation and shadow system
- **Motion**: Smooth transitions and micro-interactions
- **Accessibility**: High contrast ratios and touch target sizes

## 🔐 Permissions

The app requires the following Android permissions:

- `ACCESS_FINE_LOCATION` - For precise location access
- `ACCESS_COARSE_LOCATION` - For general location access
- `ACCESS_BACKGROUND_LOCATION` - For background geofencing
- `VIBRATE` - For notification vibration
- `RECEIVE_BOOT_COMPLETED` - For geofence persistence after reboot
- `WAKE_LOCK` - For background processing

## 📊 Data Storage

All data is stored locally using AsyncStorage:

```javascript
// Reminder object structure
{
  id: "reminder_timestamp_randomId",
  title: "Reminder title",
  type: "single" | "checklist",
  checklist: ["item1", "item2"], // Only for checklist type
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: "Optional address string"
  },
  radius: 200, // Radius in meters
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔔 Notification System

The app uses Expo Notifications for local notifications:

- **Trigger**: Geofence entry events
- **Content**: Reminder title and checklist preview
- **Sound**: Default notification sound
- **Vibration**: Custom vibration pattern
- **Priority**: High priority for immediate display

## 🧪 Testing

### Manual Testing Checklist

1. **Reminder Creation**
   - [ ] Create single note reminder
   - [ ] Create checklist reminder
   - [ ] Select location via map
   - [ ] Adjust geofence radius
   - [ ] Save reminder successfully

2. **Location Features**
   - [ ] Search places via autocomplete
   - [ ] Drag pin to adjust location
   - [ ] Current location detection
   - [ ] Map zoom and pan

3. **Geofencing**
   - [ ] Geofence setup after reminder creation
   - [ ] Background location monitoring
   - [ ] Notification trigger on location entry
   - [ ] Geofence removal on reminder deletion

4. **Data Persistence**
   - [ ] Reminders persist after app restart
   - [ ] Geofences restore after device reboot
   - [ ] Data integrity maintained

### Device Testing

Test on various Android devices:
- Different screen sizes (phone, tablet)
- Different Android versions (API 21+)
- Different manufacturers (Samsung, Google, etc.)

## 🚨 Troubleshooting

### Common Issues

1. **Geofencing not working**
   - Ensure location permissions are granted
   - Check if battery optimization is disabled for the app
   - Verify background app refresh is enabled

2. **Google Places not working**
   - Verify API key is correctly configured
   - Check API key has Places API enabled
   - Ensure billing is set up for Google Cloud project

3. **Notifications not appearing**
   - Check notification permissions
   - Verify Do Not Disturb settings
   - Test with `testNotification` function

### Debug Mode

Enable debug mode by setting `debug: true` in `GeofenceSetupUtil.js` to see detailed logs.

## 🔄 Future Enhancements

- **Export/Import**: Backup and restore reminders
- **Categories**: Organize reminders by categories
- **Recurring Reminders**: Time-based recurring location reminders
- **Statistics**: Usage analytics and insights
- **Widgets**: Home screen widgets for quick access
- **Voice Input**: Voice-to-text for reminder creation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ using React Native + Expo**
