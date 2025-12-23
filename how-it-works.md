# How It Works: Pixel Maps

A free, fully-styled GPS navigation app built with React Native, Expo, and MapLibre GL JS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native (Expo)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  SearchBar  │  │ModeSelector │  │ DirectionsPanel /   │  │
│  │             │  │             │  │ NavigationView      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    postMessage()                             │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     WebView                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              MapLibre GL JS                      │  │  │
│  │  │  • Custom "New Western" style                    │  │  │
│  │  │  • OpenFreeMap vector tiles                      │  │  │
│  │  │  • Route GeoJSON layer                           │  │  │
│  │  │  • User location marker                          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
              External APIs (all FREE)
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────────┐
   │OpenFreeMap│    │ Nominatim│     │    OSRM      │
   │  (tiles)  │    │(geocoding)│    │  (routing)   │
   └──────────┘     └──────────┘     └──────────────┘
```

---

## Tech Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Framework | React Native + Expo | Free |
| Map Rendering | MapLibre GL JS (in WebView) | Free |
| Map Tiles | OpenFreeMap | Free, unlimited |
| Geocoding | Nominatim (OpenStreetMap) | Free |
| Routing | OSRM Demo Server | Free |
| Fonts | ChineseRocks.ttf (custom) | - |

---

## Why WebView?

MapLibre has a native React Native library (`@maplibre/maplibre-react-native`), but it requires native modules, which means:
- Can't use Expo Go
- Need to run `expo prebuild` and build native code

By using **MapLibre GL JS inside a WebView**, we get:
- Full MapLibre styling capabilities
- Works in Expo Go (no native build required)
- Same visual quality (WebGL rendering)
- Trade-off: Slightly less smooth than native, but very usable

---

## File Structure

```
pixel-maps/
├── app/
│   ├── _layout.tsx          # Root layout, font loading
│   └── index.tsx            # Main map screen (WebView + UI)
├── components/
│   ├── SearchBar.tsx        # Address search with autocomplete
│   ├── ModeSelector.tsx     # Walking/Driving toggle
│   ├── DirectionsPanel.tsx  # Route overview + Start button
│   └── NavigationView.tsx   # Active GPS navigation UI
├── services/
│   ├── geocoding.ts         # Nominatim API wrapper
│   └── routing.ts           # OSRM routing API wrapper
├── assets/
│   └── fonts/
│       └── ChineseRocks.ttf # Custom display font
└── how-it-works.md          # This file
```

---

## Core Components Explained

### 1. Map Rendering (`app/index.tsx`)

The map is rendered using **MapLibre GL JS** inside a React Native WebView. The entire map configuration is in an HTML string template:

```typescript
const getMapHTML = (latitude: number, longitude: number) => `
<!DOCTYPE html>
<html>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  ...
  <script>
    const map = new maplibregl.Map({
      container: 'map',
      style: newWesternStyle,  // Custom style object
      center: [longitude, latitude],
      zoom: 15
    });
  </script>
</html>
`;
```

#### Custom "New Western" Style

The map uses a vintage parchment aesthetic inspired by old western maps:

| Element | Color | Hex |
|---------|-------|-----|
| Land/Background | Parchment tan | `#dec29b` |
| Water | Grayish brown | `#9e9985` |
| Roads | Dark charcoal | `hsl(84, 4%, 25%)` |
| Buildings | Lighter tan | `#c8b28d` |
| Route line | Red | `#ee0400` |

The style is defined as a [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/) JSON object with layers for:
- Background
- Water (fill + outline)
- Parks/forests
- Buildings (fill + outline)
- Roads (by class: motorway, primary, secondary, etc.)
- Railways
- Borders
- Labels (cities, roads, water)

#### Tile Source

```javascript
sources: {
  openmaptiles: {
    type: "vector",
    url: "https://tiles.openfreemap.org/planet"
  }
}
```

OpenFreeMap provides free vector tiles using the OpenMapTiles schema. No API key required.

---

### 2. React Native ↔ WebView Communication

Since the map is in a WebView, we communicate via `postMessage`:

**React Native → WebView:**
```typescript
webViewRef.current?.postMessage(JSON.stringify({
  type: 'setRoute',
  geometry: routeData.geometry
}));
```

**WebView (JavaScript) receives:**
```javascript
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'setRoute') {
    map.getSource('route').setData({
      type: 'Feature',
      geometry: data.geometry
    });
  }
});
```

**Message Types:**
| Type | Direction | Purpose |
|------|-----------|---------|
| `updateLocation` | RN → WebView | Move user marker, optionally follow |
| `setDestination` | RN → WebView | Add destination pin |
| `setRoute` | RN → WebView | Draw route line |
| `clearRoute` | RN → WebView | Remove route + destination |

---

### 3. Geocoding (`services/geocoding.ts`)

Converts addresses to coordinates using **Nominatim** (OpenStreetMap's geocoder).

```typescript
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    {
      headers: {
        'User-Agent': 'PixelMaps/1.0',  // Required by Nominatim
      },
    }
  );
  return response.json();
}
```

**Rate Limits:** 1 request/second (handled via debounce in SearchBar)

**Response:**
```json
[{
  "place_id": 123456,
  "lat": "37.7749",
  "lon": "-122.4194",
  "display_name": "San Francisco, CA, USA"
}]
```

---

### 4. Routing (`services/routing.ts`)

Gets turn-by-turn directions using **OSRM** (Open Source Routing Machine).

```typescript
export async function getRoute(
  origin: [number, number],      // [lng, lat]
  destination: [number, number],
  mode: 'walking' | 'driving'
): Promise<RouteResponse> {
  const profile = mode === 'walking' ? 'foot' : 'car';
  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`
  );
  // ...
}
```

**Response includes:**
- `geometry`: GeoJSON LineString of the route
- `distance`: Total distance in meters
- `duration`: Total time in seconds
- `steps`: Array of turn-by-turn instructions

**Fallback:** If OSRM fails, the code attempts OpenRouteService (requires API key setup).

---

### 5. Search UI (`components/SearchBar.tsx`)

- Debounced input (500ms) to avoid hammering Nominatim
- Shows autocomplete dropdown as results come in
- Styled with parchment colors + ChineseRocks font

```typescript
const debouncedSearch = useCallback(
  debounce(async (text: string) => {
    const data = await searchAddress(text);
    setResults(data);
  }, 500),
  []
);
```

---

### 6. Directions Panel (`components/DirectionsPanel.tsx`)

Shows route overview before navigation:
- Total time and distance
- Scrollable list of turn-by-turn steps
- **START NAVIGATION** button

---

### 7. Active Navigation (`components/NavigationView.tsx`)

When navigation is active:
- Large current instruction at top
- Distance to next maneuver
- Remaining time/distance
- Next instruction preview
- **END NAVIGATION** button

---

## Navigation Flow

### State Machine

```
[No Route]
    │
    │ User searches & selects destination
    ▼
[Route Calculated] ←──────────────────┐
    │                                  │
    │ User taps "START NAVIGATION"     │ User taps "END NAVIGATION"
    ▼                                  │
[Navigating] ──────────────────────────┘
    │
    │ Location updates → check distance to waypoint
    │ If < 30m → advance to next step
    │
    └── Repeat until destination reached
```

### Location Tracking

During navigation, we use `expo-location` to watch position:

```typescript
locationSubscription.current = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 10,  // Update every 10 meters
    timeInterval: 1000,    // Or every second
  },
  (newLocation) => {
    // Update map marker via postMessage
    // Check distance to next maneuver
  }
);
```

### Step Advancement Logic

```typescript
// Calculate distance to current step's maneuver point
const distToManeuver = haversineDistance(
  [currentLng, currentLat],
  currentStep.maneuver.location
);

// If within 30 meters, advance to next step
if (distToManeuver < 30 && currentStepIndex < route.steps.length - 1) {
  setCurrentStepIndex(prev => prev + 1);
}
```

The **Haversine formula** calculates great-circle distance between two lat/lng points:

```typescript
function haversineDistance([lon1, lat1], [lon2, lat2]): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)² + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)²;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

---

## WebView Stability Trick

**Problem:** When `location` state updates during navigation, the WebView's `source.html` would change, causing the map to re-render and lose the route.

**Solution:** Store the initial location in a `useRef` and use that for the WebView HTML:

```typescript
const initialLocation = useRef<{ lat: number; lng: number } | null>(null);

// Set once on load
initialLocation.current = { lat, lng };

// WebView uses stable ref, not changing state
<WebView
  source={{
    html: getMapHTML(
      initialLocation.current?.lat ?? 37.78825,
      initialLocation.current?.lng ?? -122.4324
    )
  }}
/>
```

Location updates during navigation are sent via `postMessage`, not by re-rendering.

---

## Font Loading

Custom font loaded in `app/_layout.tsx`:

```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  ChineseRocks: require('../assets/fonts/ChineseRocks.ttf'),
});
```

Used in components via `fontFamily: 'ChineseRocks'`.

**Note:** The custom font only works for React Native UI components. Map labels use MapLibre's glyph fonts (Noto Sans) because MapLibre requires fonts in PBF format, not TTF.

---

## API Summary

| API | Endpoint | Purpose |
|-----|----------|---------|
| OpenFreeMap | `tiles.openfreemap.org/planet` | Vector map tiles |
| OpenFreeMap | `tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf` | Map label fonts |
| Nominatim | `nominatim.openstreetmap.org/search` | Address → coordinates |
| OSRM | `router.project-osrm.org/route/v1/{profile}/...` | Route calculation |

All APIs are **free with no API keys required**.

---

## Color Palette

| Use | Color | Hex |
|-----|-------|-----|
| Background/Parchment | Tan | `#dec29b` |
| Text/Roads/UI borders | Dark charcoal | `#40423d` |
| Water | Grayish brown | `#9e9985` |
| Buildings/Secondary tan | Lighter tan | `#c8b28d` |
| Parks/Forests | Darker tan | `#d4b78a` |
| Route line | Red | `#ee0400` |
| User location dot | Blue | `#4285f4` |

---

## Running the App

```bash
# Install dependencies
npm install

# Start Expo
npx expo start

# Scan QR code with Expo Go app
```

Works on iOS and Android via Expo Go - no native build required!

---

## Limitations

1. **OSRM Demo Server**: No uptime guarantee (fine for personal use)
2. **Nominatim**: 1 req/sec rate limit
3. **No offline support**: Requires internet for tiles, geocoding, routing
4. **WebView performance**: Slightly less smooth than native MapLibre
5. **Map fonts**: Can't use custom TTF fonts for map labels (would need PBF conversion)

---

## Future Enhancements

- [ ] Voice turn-by-turn announcements
- [ ] Off-route detection and automatic re-routing
- [ ] Save favorite locations
- [ ] Recent searches history
- [ ] Offline tile caching
- [ ] Multiple waypoints / stops
- [ ] Traffic-aware routing (would need different API)
