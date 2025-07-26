# Location-Based Reminder App - Main Screen

A React Native application for managing location-based reminders with a clean, modern UI design.

## 📱 Features

- **Main Screen**: Displays all active reminders in a scrollable list
- **Reminder Items**: Each item shows the reminder title and assigned location
- **Floating Action Button**: Persistent "Add Reminder" button positioned at bottom-right
- **Empty State**: User-friendly message when no reminders exist
- **Pull-to-Refresh**: Refresh reminders by pulling down the list
- **Responsive Design**: Optimized for different screen sizes
- **Smooth Animations**: Interactive feedback with scale animations

## 🏗️ Component Structure

```
App
└── MainScreen
    ├── Header (App title)
    ├── FlatList (Reminder list)
    │   ├── ReminderItem (Individual reminder)
    │   └── EmptyState (When no reminders)
    └── FloatingActionButton (Add reminder)
```

## 📁 Project Structure

```
├── App.js                          # Main app component
├── index.js                        # App entry point
├── package.json                    # Dependencies and scripts
├── src/
│   ├── components/
│   │   ├── EmptyState.js           # Empty state component
│   │   ├── FloatingActionButton.js # FAB component
│   │   └── ReminderItem.js         # Individual reminder item
│   ├── data/
│   │   └── mockData.js             # Sample reminder data
│   ├── screens/
│   │   └── MainScreen.js           # Main screen component
│   └── styles/
│       └── styles.js               # Centralized styling
```

## 🎨 Design System

### Colors
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #10B981 (Emerald)
- **Background**: #F8FAFC (Slate)
- **Surface**: #FFFFFF (White)
- **Text**: #1F2937 (Gray-800)

### Typography
- **Headers**: 24-28px, Semi-bold/Bold
- **Body**: 16px, Regular
- **Secondary**: 14px, Regular
- **Caption**: 12px, Regular

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

3. Run the application:

For Android:
```bash
npm run android
```

For iOS:
```bash
npm run ios
```

## 📱 Component Details

### MainScreen
- Manages the main application state
- Handles reminder loading and refreshing
- Implements pull-to-refresh functionality
- Manages navigation to add reminder screen

### ReminderItem
- Displays individual reminder information
- Shows title and location with proper typography
- Includes interactive animations
- Displays creation date and status indicator

### FloatingActionButton
- Persistent button positioned at bottom-right
- Smooth scale animations on press
- Material Design inspired styling
- Accessible with proper test IDs

### EmptyState
- User-friendly empty state design
- Clear call-to-action messaging
- Consistent with app's visual design
- Includes location icon for context

## 🔧 Customization

### Adding New Reminders
The app currently uses mock data. To integrate with a real backend:

1. Replace `mockData.js` with API calls
2. Update the `loadReminders` function in `MainScreen.js`
3. Implement proper error handling and loading states

### Styling
All styles are centralized in `src/styles/styles.js`:
- Modify colors in the `colors` object
- Update typography in the `typography` object
- Adjust spacing using the `spacing` object

### Navigation
To add navigation functionality:
1. Install React Navigation
2. Set up navigation container
3. Update the `handleAddReminder` function to navigate to add screen

## 🧪 Testing

The components include test IDs for automated testing:
- `reminders-list`: Main FlatList component
- `reminder-item-{index}`: Individual reminder items
- `add-reminder-fab`: Floating action button
- `empty-state`: Empty state component

## 📝 Future Enhancements

- [ ] Add React Navigation for screen transitions
- [ ] Implement real API integration
- [ ] Add swipe actions (edit/delete)
- [ ] Include location services integration
- [ ] Add push notifications
- [ ] Implement reminder categories
- [ ] Add search and filter functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
