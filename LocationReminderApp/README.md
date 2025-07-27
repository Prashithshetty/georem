# LocationReminderApp

This is the main application folder for the GeoRem location reminder app.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device:
- Use Expo Go app to scan the QR code
- Or press `a` for Android, `i` for iOS

## Building

For detailed build instructions, see the main README.md in the parent directory.

Quick build command:
```bash
eas build --platform android --profile preview
```

## Project Structure

```
src/
├── components/     # UI components
├── screens/        # App screens
├── services/       # Core services (geofencing, notifications)
├── context/        # State management
├── data/          # Mock data
├── styles/        # Styling
└── utils/         # Utilities
