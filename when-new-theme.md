# Adding a New Theme

This guide explains how to create a new map theme for the app.

## 1. Create Theme Folder

Create a new folder under `themes/` with your theme name (use kebab-case):

```
themes/
└── your-theme-name/
    ├── index.ts
    ├── colors.ts
    ├── fonts.ts
    └── mapStyle.ts
```

## 2. Create Theme Files

### `colors.ts`

Export a `colors` object with these required properties:

```ts
export const colors = {
  // UI colors
  parchment: '#...',      // Main background color
  charcoal: '#...',       // Primary text/borders
  water: '#...',          // Water areas on map
  building: '#...',       // Building fills
  park: '#...',           // Parks/green areas
  route: '#...',          // Route line color
  userLocation: '#...',   // User location dot
  mutedBrown: '#...',     // Placeholder/muted text
  darkerBrown: '#...',    // Secondary labels

  // Map-specific colors
  roadHsl: '#...',              // Road color
  charcoalTranslucent: '...',   // Semi-transparent text
  charcoalShadow: '...',        // Shadow color
};
```

### `fonts.ts`

Export `fonts` and `fontAssets`:

```ts
export const fonts = {
  display: 'YourFontName',  // Font family name
};

// If using a custom font, add it to assets/fonts/ and reference here
export const fontAssets = {
  YourFontName: require('../../assets/fonts/YourFont.ttf'),
};

// If using system font, leave fontAssets empty:
// export const fontAssets = {};
```

### `mapStyle.ts`

Export `mapStyle` object and `mapStyleJSON` string:

```ts
import { colors } from './colors';

export const mapStyle = {
  version: 8,
  name: 'Your Theme Name',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    // Define your map layers here
    // See existing themes for examples
  ],
};

export const mapStyleJSON = JSON.stringify(mapStyle);
```

### `index.ts`

Re-export everything:

```ts
export { colors } from './colors';
export { fonts, fontAssets } from './fonts';
export { mapStyle, mapStyleJSON } from './mapStyle';
```

## 3. Register Theme

Update `themes/index.ts`:

### Add import

```ts
import * as yourTheme from './your-theme-name';
```

### Add to ThemeName type

```ts
export type ThemeName = 'western' | 'los-angeles' | 'toy-carpet' | 'your-theme-name';
```

### Add to themes object

```ts
export const themes: Record<ThemeName, Theme> = {
  // ... existing themes
  'your-theme-name': {
    name: 'your-theme-name',
    displayName: 'Your Theme Name',  // Shown in UI
    colors: yourTheme.colors,
    fonts: yourTheme.fonts,
    fontAssets: yourTheme.fontAssets,
    mapStyleJSON: yourTheme.mapStyleJSON,
  },
};
```

## 4. Add Custom Font (if needed)

1. Add font file to `assets/fonts/`
2. Reference in your theme's `fonts.ts` fontAssets
3. The app automatically loads all fonts from all themes at startup

## Checklist

- [ ] Created `themes/your-theme-name/` folder
- [ ] Created `colors.ts` with all required color properties
- [ ] Created `fonts.ts` with fonts and fontAssets
- [ ] Created `mapStyle.ts` with MapLibre style
- [ ] Created `index.ts` to export everything
- [ ] Added import to `themes/index.ts`
- [ ] Added theme name to `ThemeName` type
- [ ] Added theme to `themes` object
- [ ] Added font file to `assets/fonts/` (if custom font)
- [ ] Tested theme switching in app

## Tips

- Copy an existing theme folder as a starting point
- Use the MapLibre style spec for layer definitions: https://maplibre.org/maplibre-style-spec/
- Test your theme with different map zoom levels
- Make sure colors have good contrast for readability
