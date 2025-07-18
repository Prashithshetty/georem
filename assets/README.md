# Assets Directory

This directory contains the app's visual assets.

## Required Assets

You'll need to add the following image files to this directory:

### App Icons
- `icon.png` (1024x1024) - Main app icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon foreground
- `favicon.png` (48x48) - Web favicon

### Splash Screen
- `splash.png` (1284x2778) - App splash screen image

### Notifications
- `notification-icon.png` (96x96) - Notification icon (white/transparent)

## Icon Guidelines

### App Icon (`icon.png`)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Design: Should represent location/reminder concept
- Colors: Use Material 3 color palette
- Style: Modern, minimal, recognizable

### Adaptive Icon (`adaptive-icon.png`)
- Size: 1024x1024 pixels
- Safe area: 432x432 pixels (center)
- Background: Transparent or solid color
- Design: Foreground element only

### Notification Icon (`notification-icon.png`)
- Size: 96x96 pixels (24dp at xxxhdpi)
- Colors: White silhouette on transparent background
- Style: Simple, recognizable at small sizes
- Design: Location pin or reminder symbol

## Generating Icons

You can use tools like:
- [App Icon Generator](https://appicon.co/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [Figma](https://figma.com) with Material 3 design kit

## Placeholder Assets

For development, you can create simple placeholder assets:

```bash
# Create placeholder icon (requires ImageMagick)
convert -size 1024x1024 xc:'#6750A4' -gravity center -pointsize 200 -fill white -annotate +0+0 '📍' icon.png

# Or use online generators for quick prototypes
```

## Material 3 Colors

Use these colors for consistency with the app theme:
- Primary: `#6750A4`
- Primary Container: `#EADDFF`
- Secondary: `#625B71`
- Surface: `#FFFBFE`
- Background: `#FFFBFE`
