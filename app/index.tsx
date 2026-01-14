import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { DirectionsPanel } from '../components/DirectionsPanel';
import { ModeSelector } from '../components/ModeSelector';
import { NavigationView } from '../components/NavigationView';
import { POISheet } from '../components/POISheet';
import { RecenterButton } from '../components/RecenterButton';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useLocationMarkerIcon } from '../hooks/useLocationMarkerIcon';
import { usePOIIcons } from '../hooks/usePOIIcons';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';
import { GeocodingResult } from '../services/geocoding';
import { fetchPOIs, MapBounds, POI } from '../services/poi';
import { getRoute, RouteResponse, TravelMode } from '../services/routing';

// Haversine formula to calculate distance between two coordinates
function haversineDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate perpendicular distance from a point to a line segment
function pointToSegmentDistance(
  point: [number, number],
  segStart: [number, number],
  segEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = segStart;
  const [x2, y2] = segEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const segLengthSquared = dx * dx + dy * dy;

  if (segLengthSquared === 0) {
    // Segment is a point
    return haversineDistance(point, segStart);
  }

  // Project point onto segment line, clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / segLengthSquared));
  const closestPoint: [number, number] = [x1 + t * dx, y1 + t * dy];

  return haversineDistance(point, closestPoint);
}

// Find the index in routeCoords closest to a given point
function findClosestCoordIndex(
  point: [number, number],
  routeCoords: [number, number][]
): number {
  let minDist = Infinity;
  let minIndex = 0;
  for (let i = 0; i < routeCoords.length; i++) {
    const dist = haversineDistance(point, routeCoords[i]);
    if (dist < minDist) {
      minDist = dist;
      minIndex = i;
    }
  }
  return minIndex;
}

// Check distance to the route segment the user SHOULD be on
// Based on current navigation step, not by searching the whole route
function distanceToExpectedRoute(
  userLocation: [number, number],
  routeCoords: [number, number][],
  prevManeuverLocation: [number, number] | null,
  currentManeuverLocation: [number, number]
): number {
  // Find geometry indices for the segment we should be on
  const startIndex = prevManeuverLocation
    ? findClosestCoordIndex(prevManeuverLocation, routeCoords)
    : 0;
  const endIndex = findClosestCoordIndex(currentManeuverLocation, routeCoords);

  // Add buffer of a few indices to account for GPS inaccuracy near turns
  const bufferStart = Math.max(0, startIndex - 5);
  const bufferEnd = Math.min(routeCoords.length - 1, endIndex + 5);

  // Check distance to segments between start and end
  let minDistance = Infinity;
  for (let i = bufferStart; i < bufferEnd; i++) {
    const dist = pointToSegmentDistance(userLocation, routeCoords[i], routeCoords[i + 1]);
    minDistance = Math.min(minDistance, dist);
  }

  return minDistance;
}

// Calculate bearing from point A to point B (in degrees)
function calculateBearing(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const x = Math.sin(dLon) * Math.cos(lat2Rad);
  const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const bearing = toDeg(Math.atan2(x, y));
  return (bearing + 360) % 360; // Normalize to 0-360
}

// Generate map HTML with theme colors
function getMapHTML(
  latitude: number,
  longitude: number,
  mapStyleJSON: string,
  colors: { userLocation: string; route: string; charcoal: string },
  locationMarkerIcon: string | null,
  is3D: boolean
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .user-location {
      width: 32px;
      height: 32px;
      background-image: url('${locationMarkerIcon || ''}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }
    .destination-marker {
      width: 32px;
      height: 32px;
      background: ${colors.route};
      border: 3px solid ${colors.charcoal};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .poi-marker {
      width: 32px;
      height: 32px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
      pointer-events: auto;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const mapStyle = ${mapStyleJSON};
    const is3DTheme = ${is3D};
    const defaultPitch = is3DTheme ? 45 : 0;
    const navigationPitch = is3DTheme ? 60 : 0;

    const map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: [${longitude}, ${latitude}],
      zoom: 15,
      pitch: defaultPitch,
      attributionControl: false
    });

    map.on('error', (e) => {
      console.error('Map error:', e.error);
      document.body.innerHTML += '<div style="position:absolute;top:0;left:0;background:red;color:white;padding:10px;z-index:9999;">Error: ' + e.error.message + '</div>';
    });

    // Add user location marker
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'user-location';
    const userMarker = new maplibregl.Marker({ element: userMarkerEl })
      .setLngLat([${longitude}, ${latitude}])
      .addTo(map);

    // Store current user location for recentering
    let currentUserLocation = [${longitude}, ${latitude}];

    // Add route source and layers when map loads
    map.on('load', () => {
      // Route source (initially empty)
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Route line border (for contrast)
      map.addLayer({
        id: 'route-line-border',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '${colors.charcoal}',
          'line-width': 10,
          'line-opacity': 0.6
        }
      });

      // Route line (red)
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '${colors.route}',
          'line-width': 6,
          'line-opacity': 0.9
        }
      });
    });

    // Destination marker reference
    let destinationMarker = null;

    // POI markers storage
    const poiMarkers = new Map();

    // Send bounds to React Native when map moves
    let boundsDebounceTimer = null;
    function sendBoundsUpdate() {
      if (boundsDebounceTimer) clearTimeout(boundsDebounceTimer);
      boundsDebounceTimer = setTimeout(() => {
        const bounds = map.getBounds();
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'boundsChanged',
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }));
      }, 500);
    }

    map.on('moveend', sendBoundsUpdate);
    map.on('zoomend', sendBoundsUpdate);

    // Long-press to set destination
    let longPressTimer = null;
    let longPressCoords = null;

    map.on('mousedown', (e) => {
      longPressCoords = e.lngLat;
      longPressTimer = setTimeout(() => {
        if (longPressCoords) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'mapLongPress',
            longitude: longPressCoords.lng,
            latitude: longPressCoords.lat
          }));
        }
      }, 500);
    });

    map.on('mouseup', () => {
      clearTimeout(longPressTimer);
      longPressCoords = null;
    });

    map.on('mousemove', () => {
      clearTimeout(longPressTimer);
      longPressCoords = null;
    });

    // Touch events for mobile
    map.on('touchstart', (e) => {
      if (e.originalEvent.touches.length === 1) {
        longPressCoords = e.lngLat;
        longPressTimer = setTimeout(() => {
          if (longPressCoords) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'mapLongPress',
              longitude: longPressCoords.lng,
              latitude: longPressCoords.lat
            }));
          }
        }, 500);
      }
    });

    map.on('touchend', () => {
      clearTimeout(longPressTimer);
      longPressCoords = null;
    });

    map.on('touchmove', () => {
      clearTimeout(longPressTimer);
      longPressCoords = null;
    });

    // Send initial bounds after map loads
    map.on('load', () => {
      setTimeout(sendBoundsUpdate, 100);
    });

    // Navigation mode state
    let isNavigationMode = false;

    // Handle messages from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'updateLocation') {
          currentUserLocation = [data.longitude, data.latitude];
          userMarker.setLngLat(currentUserLocation);

          if (isNavigationMode && data.bearing !== undefined && data.bearing !== null) {
            // Navigation mode: tilted view facing the direction of travel
            map.easeTo({
              center: currentUserLocation,
              bearing: data.bearing,
              pitch: navigationPitch,
              zoom: 17.5,
              duration: 500
            });
          } else if (data.follow) {
            map.flyTo({ center: currentUserLocation });
          }
        }

        if (data.type === 'setNavigationMode') {
          isNavigationMode = data.enabled;
          if (data.enabled) {
            // Enter navigation mode with tilted camera
            map.easeTo({
              center: currentUserLocation,
              pitch: navigationPitch,
              zoom: 17.5,
              duration: 500
            });
          } else {
            // Exit navigation mode - reset to theme default view
            map.easeTo({
              pitch: defaultPitch,
              zoom: 15,
              duration: 500
            });
          }
        }

        if (data.type === 'recenter') {
          if (isNavigationMode) {
            map.easeTo({ center: currentUserLocation, pitch: navigationPitch, zoom: 17.5, duration: 300 });
          } else {
            map.flyTo({ center: currentUserLocation, pitch: defaultPitch, zoom: 16 });
          }
        }

        if (data.type === 'setDestination') {
          // Remove existing destination marker
          if (destinationMarker) {
            destinationMarker.remove();
          }
          // Create new destination marker
          const el = document.createElement('div');
          el.className = 'destination-marker';
          destinationMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([data.longitude, data.latitude])
            .addTo(map);
        }

        if (data.type === 'setRoute') {
          // Update route geometry
          const source = map.getSource('route');
          if (source) {
            source.setData({
              type: 'Feature',
              properties: {},
              geometry: data.geometry
            });

            // Fit map to route bounds
            const coords = data.geometry.coordinates;
            const bounds = coords.reduce((bounds, coord) => {
              return bounds.extend(coord);
            }, new maplibregl.LngLatBounds(coords[0], coords[0]));

            map.fitBounds(bounds, { padding: 80, duration: 500 });
          }
        }

        if (data.type === 'clearRoute') {
          // Clear route line
          const source = map.getSource('route');
          if (source) {
            source.setData({ type: 'FeatureCollection', features: [] });
          }
          // Remove destination marker
          if (destinationMarker) {
            destinationMarker.remove();
            destinationMarker = null;
          }
        }

        if (data.type === 'setPOIs') {
          // data.pois = [{ id, category, lat, lon, icon }]
          // data.icons = { category: base64DataUrl }
          const currentIds = new Set(data.pois.map(p => p.id));

          // Remove markers that are no longer in the list
          for (const [id, marker] of poiMarkers) {
            if (!currentIds.has(id)) {
              marker.remove();
              poiMarkers.delete(id);
            }
          }

          // Add or update markers
          for (const poi of data.pois) {
            if (poiMarkers.has(poi.id)) continue; // Already exists

            const iconUrl = data.icons[poi.category];
            if (!iconUrl) continue; // No icon for this category

            const el = document.createElement('div');
            el.className = 'poi-marker';
            el.style.backgroundImage = 'url(' + iconUrl + ')';

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([poi.lon, poi.lat])
              .addTo(map);

            // Add click/touch handler to marker element
            const markerEl = marker.getElement();
            const poiData = JSON.parse(JSON.stringify(poi)); // Clone to avoid closure issues

            markerEl.addEventListener('click', function(e) {
              e.stopPropagation();
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'poiClicked',
                poi: poiData
              }));
            });

            markerEl.addEventListener('touchend', function(e) {
              e.stopPropagation();
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'poiClicked',
                poi: poiData
              }));
            });

            poiMarkers.set(poi.id, marker);
          }
        }

        if (data.type === 'clearPOIs') {
          for (const [id, marker] of poiMarkers) {
            marker.remove();
          }
          poiMarkers.clear();
        }
      } catch (e) {
        console.error('Message handling error:', e);
      }
    });
  </script>
</body>
</html>
`;
}

export default function MapScreen() {
  const { theme, themeName } = useTheme();
  const { colors } = theme;

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Store initial location for WebView (prevents re-render when location updates)
  const initialLocation = useRef<{ lat: number; lng: number } | null>(null);

  // Navigation state
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [destination, setDestination] = useState<GeocodingResult | null>(null);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Active navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distanceToNextManeuver, setDistanceToNextManeuver] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const continuousLocationSubscription = useRef<Location.LocationSubscription | null>(null);
  const handleSelectLocationRef = useRef<((result: GeocodingResult) => void) | null>(null);
  const lastRerouteTime = useRef<number>(0);
  const isRerouting = useRef<boolean>(false);

  // Voice navigation
  useVoiceNavigation({
    isNavigating,
    currentStepIndex,
    currentStep: route?.steps[currentStepIndex] ?? null,
    distanceToNextManeuver,
    isMuted: voiceMuted,
  });

  // POI state
  const { icons: poiIcons, loading: poiIconsLoading } = usePOIIcons(themeName);
  const { markerIcon: locationMarkerIcon } = useLocationMarkerIcon(themeName);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // Fetch POIs when bounds change (accumulate pattern - keep old POIs)
  const MAX_POIS = 500;
  useEffect(() => {
    if (!mapBounds || poiIconsLoading) return;

    let cancelled = false;

    (async () => {
      const fetchedPois = await fetchPOIs(mapBounds);
      if (cancelled) return;

      // Merge new POIs with existing ones (dedupe by ID, cap at MAX_POIS)
      if (fetchedPois.length > 0) {
        setPois((existing) => {
          const existingIds = new Set(existing.map((p) => p.id));
          const newPois = fetchedPois.filter((p) => !existingIds.has(p.id));
          const merged = [...existing, ...newPois];
          // Keep most recent POIs if over cap (new ones are at the end)
          return merged.length > MAX_POIS ? merged.slice(-MAX_POIS) : merged;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapBounds, poiIconsLoading]);

  // Send POIs to WebView when POIs or icons change
  useEffect(() => {
    if (pois.length === 0 || Object.keys(poiIcons).length === 0) return;

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'setPOIs',
        pois: pois.map((p) => ({ id: p.id, category: p.category, name: p.name, lat: p.lat, lon: p.lon })),
        icons: poiIcons,
      })
    );
  }, [pois, poiIcons]);

  // Handle WebView messages (mapLongPress handled via ref to avoid circular deps)
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'boundsChanged') {
        setMapBounds({
          north: data.north,
          south: data.south,
          east: data.east,
          west: data.west,
        });
      }
      if (data.type === 'poiClicked') {
        setSelectedPOI(data.poi);
      }
      if (data.type === 'mapLongPress') {
        // Create a GeocodingResult from coordinates and trigger destination selection
        const result: GeocodingResult = {
          place_id: Date.now(),
          lat: String(data.latitude),
          lon: String(data.longitude),
          display_name: `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`,
          type: 'coordinates',
          importance: 1,
        };
        // Use setTimeout to break out of the callback and call handleSelectLocation
        setTimeout(() => {
          handleSelectLocationRef.current?.(result);
        }, 0);
      }
    } catch {
      // Silently ignore malformed messages
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // No location permission - app still works, just without location features
        setHasLocationPermission(false);
        setLoading(false);
        return;
      }

      setHasLocationPermission(true);

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Store initial location for WebView (only set once)
      if (!initialLocation.current) {
        initialLocation.current = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
      }

      setLoading(false);

      // Start continuous location tracking for the blue dot
      continuousLocationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 2000, // Or every 2 seconds
        },
        (newLocation) => {
          setLocation(newLocation);
          // Update user marker on map (non-navigation mode - no follow)
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: 'updateLocation',
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              heading: newLocation.coords.heading,
              follow: false,
            })
          );
        }
      );

    })();

    // Cleanup on unmount
    return () => {
      if (continuousLocationSubscription.current) {
        continuousLocationSubscription.current.remove();
      }
    };
  }, []);

  // Re-check location permission when app returns to foreground (e.g., after Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && !hasLocationPermission) {
        // Check if permission was granted while away
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasLocationPermission(true);
          // Get current location now that we have permission
          try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            if (!initialLocation.current) {
              initialLocation.current = {
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
              };
            }
            // Start continuous location tracking
            continuousLocationSubscription.current = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                distanceInterval: 5,
                timeInterval: 2000,
              },
              (newLocation) => {
                setLocation(newLocation);
                webViewRef.current?.postMessage(
                  JSON.stringify({
                    type: 'updateLocation',
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    heading: newLocation.coords.heading,
                    follow: false,
                  })
                );
              }
            );
          } catch (e) {
            console.error('Error getting location:', e);
          }
        }
      }
    });

    return () => subscription.remove();
  }, [hasLocationPermission]);

  // Handle destination selection from search
  const handleSelectLocation = async (result: GeocodingResult) => {
    setDestination(result);
    setRouteLoading(true);

    // Send destination marker to WebView
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'setDestination',
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      })
    );

    // Get route from current location to destination
    if (!location || !hasLocationPermission) {
      // No location - can't calculate route
      setRouteLoading(false);
      setDestination(null);
      webViewRef.current?.postMessage(JSON.stringify({ type: 'clearRoute' }));
      Alert.alert(
        'Location Required',
        'Navigation requires location access to calculate a route from your current position. Please enable location services in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    try {
      const routeData = await getRoute(
        [location.coords.longitude, location.coords.latitude],
        [parseFloat(result.lon), parseFloat(result.lat)],
        travelMode
      );
      setRoute(routeData);

      // Send route to WebView
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'setRoute',
          geometry: routeData.geometry,
        })
      );
    } catch (e) {
      console.error('Routing error:', e);
      setRoute(null);
    }
    setRouteLoading(false);
  };

  // Keep ref updated for use in WebView message handler
  handleSelectLocationRef.current = handleSelectLocation;

  // Handle setting waypoint from POI
  const handleSetWaypointFromPOI = (poi: POI) => {
    // Convert POI to GeocodingResult format
    const result: GeocodingResult = {
      place_id: parseInt(poi.id.replace('osm-', ''), 10) || 0,
      lat: String(poi.lat),
      lon: String(poi.lon),
      display_name: poi.name || poi.category.replace(/_/g, ' '),
      type: poi.category,
      importance: 1,
    };
    handleSelectLocation(result);
  };

  // Handle travel mode change
  const handleModeChange = async (mode: TravelMode) => {
    setTravelMode(mode);

    // Recalculate route with new mode if we have a destination
    if (destination && location) {
      setRouteLoading(true);
      try {
        const routeData = await getRoute(
          [location.coords.longitude, location.coords.latitude],
          [parseFloat(destination.lon), parseFloat(destination.lat)],
          mode
        );
        setRoute(routeData);

        webViewRef.current?.postMessage(
          JSON.stringify({
            type: 'setRoute',
            geometry: routeData.geometry,
          })
        );
      } catch (e) {
        console.error('Routing error:', e);
      }
      setRouteLoading(false);
    }
  };

  // Clear route and destination
  const handleClearRoute = () => {
    handleEndNavigation();
    setRoute(null);
    setDestination(null);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'clearRoute' }));
  };

  // Recenter map on user location
  const handleRecenter = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'recenter' }));
  };

  // Start active navigation
  const handleStartNavigation = useCallback(async () => {
    if (!route || route.steps.length === 0) return;

    // Check if we have location permission
    if (!hasLocationPermission || !location) {
      Alert.alert(
        'Location Required',
        'Turn-by-turn navigation requires location access. Please enable location services in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    setIsNavigating(true);
    setCurrentStepIndex(0);

    // Calculate initial distance to first maneuver
    if (location && route.steps[0]?.maneuver?.location) {
      const dist = haversineDistance(
        [location.coords.longitude, location.coords.latitude],
        route.steps[0].maneuver.location
      );
      setDistanceToNextManeuver(dist);
    }

    // Stop continuous tracking (we'll use navigation-specific tracking)
    if (continuousLocationSubscription.current) {
      continuousLocationSubscription.current.remove();
      continuousLocationSubscription.current = null;
    }

    // Enable navigation mode in WebView (tilted camera)
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'setNavigationMode',
        enabled: true,
      })
    );

    // Start watching location for navigation with highest accuracy
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 5, // Update every 5 meters
        timeInterval: 500, // Or every half second
      },
      (newLocation) => {
        // Update location state first so we have latest step index
        setLocation(newLocation);
      }
    );
  }, [route, location, hasLocationPermission]);

  // Update step advancement and map when location changes during navigation
  useEffect(() => {
    if (!isNavigating || !route || !location) return;

    const currentStep = route.steps[currentStepIndex];
    if (!currentStep?.maneuver?.location) return;

    const userLocation: [number, number] = [location.coords.longitude, location.coords.latitude];
    const maneuverLocation = currentStep.maneuver.location;

    const distToManeuver = haversineDistance(userLocation, maneuverLocation);
    setDistanceToNextManeuver(distToManeuver);

    // Calculate bearing from current location to the maneuver point
    const bearing = calculateBearing(userLocation, maneuverLocation);

    // Send location update with bearing to WebView
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'updateLocation',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        bearing: bearing,
        follow: true,
      })
    );

    // If within 30 meters, advance to next step
    if (distToManeuver < 30 && currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }

    // Auto-reroute: Check if user has deviated from the EXPECTED route segment
    // (based on current step, not any random part of the route)
    const routeCoords = route.geometry.coordinates as [number, number][];
    const prevStep = currentStepIndex > 0 ? route.steps[currentStepIndex - 1] : null;
    const distFromRoute = distanceToExpectedRoute(
      userLocation,
      routeCoords,
      prevStep?.maneuver.location ?? null,
      currentStep.maneuver.location
    );

    // Log for debugging (can remove later)
    if (distFromRoute > 30) {
      console.log(`[Reroute] Distance from expected route segment: ${distFromRoute.toFixed(0)}m (step ${currentStepIndex})`);
    }

    // If more than 50 meters off the expected route segment, trigger reroute
    // Debounce: only reroute if more than 5 seconds since last reroute
    const now = Date.now();
    if (
      distFromRoute > 50 &&
      !isRerouting.current &&
      now - lastRerouteTime.current > 5000 &&
      destination
    ) {
      console.log(`[Reroute] Triggering reroute - ${distFromRoute.toFixed(0)}m off expected path`);
      isRerouting.current = true;
      lastRerouteTime.current = now;

      // Reroute from current location to destination
      (async () => {
        try {
          const newRoute = await getRoute(
            userLocation,
            [parseFloat(destination.lon), parseFloat(destination.lat)],
            travelMode
          );
          console.log('[Reroute] New route received');
          setRoute(newRoute);
          setCurrentStepIndex(0);

          // Send new route to WebView
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: 'setRoute',
              geometry: newRoute.geometry,
            })
          );
        } catch (e) {
          console.error('[Reroute] Error:', e);
        } finally {
          isRerouting.current = false;
        }
      })();
    }
  }, [isNavigating, route, location, currentStepIndex, destination, travelMode]);

  // End active navigation
  const handleEndNavigation = useCallback(async () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setDistanceToNextManeuver(0);

    // Stop navigation location tracking
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Disable navigation mode in WebView (reset to flat view)
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'setNavigationMode',
        enabled: false,
      })
    );

    // Restart continuous location tracking
    continuousLocationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 2000,
      },
      (newLocation) => {
        setLocation(newLocation);
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: 'updateLocation',
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            follow: false,
          })
        );
      }
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (continuousLocationSubscription.current) {
        continuousLocationSubscription.current.remove();
      }
    };
  }, []);

  // Calculate remaining distance and duration from current step
  const remainingDistance = route
    ? route.steps.slice(currentStepIndex).reduce((sum, step) => sum + step.distance, 0)
    : 0;
  const remainingDuration = route
    ? route.steps.slice(currentStepIndex).reduce((sum, step) => sum + step.duration, 0)
    : 0;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.parchment }]}>
        <ActivityIndicator size="large" color={colors.charcoal} />
        <Text style={[styles.loadingText, { color: colors.charcoal }]}>
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* WebView with key to force reload on theme change or marker icon load */}
      <WebView
        key={`${themeName}-${locationMarkerIcon ? 'icon' : 'loading'}`}
        ref={webViewRef}
        source={{
          html: getMapHTML(
            initialLocation.current?.lat ?? 37.78825,
            initialLocation.current?.lng ?? -122.4324,
            theme.mapStyleJSON,
            colors,
            locationMarkerIcon,
            theme.is3D
          ),
        }}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        originWhitelist={['*']}
      />

      {/* Theme toggle (always visible, top-right below nav controls) */}
      {!isNavigating && <ThemeToggle />}

      {/* Search bar overlay (hidden during active navigation) */}
      {!isNavigating && (
        <SearchBar
          onSelectLocation={handleSelectLocation}
          onClear={handleClearRoute}
          userLocation={
            location ? { lat: location.coords.latitude, lon: location.coords.longitude } : null
          }
        />
      )}

      {/* Recenter button (hidden during navigation, when route panel is shown, or when no location) */}
      {!isNavigating && !route && hasLocationPermission && (
        <RecenterButton onPress={handleRecenter} />
      )}

      {/* Mode selector (shown when destination is selected, not during navigation) */}
      {destination && !route && !isNavigating && (
        <ModeSelector mode={travelMode} onModeChange={handleModeChange} />
      )}

      {/* Directions panel (shown when route is calculated, before navigation starts) */}
      {route && !isNavigating && (
        <>
          <ModeSelector mode={travelMode} onModeChange={handleModeChange} />
          <DirectionsPanel
            steps={route.steps}
            totalDistance={route.distance}
            totalDuration={route.duration}
            onClose={handleClearRoute}
            onStartNavigation={handleStartNavigation}
          />
        </>
      )}

      {/* Active navigation view */}
      {route && isNavigating && route.steps[currentStepIndex] && (
        <NavigationView
          currentStep={route.steps[currentStepIndex]}
          nextStep={route.steps[currentStepIndex + 1] || null}
          remainingSteps={route.steps.slice(currentStepIndex)}
          distanceToNextManeuver={distanceToNextManeuver}
          totalDistance={remainingDistance}
          totalDuration={remainingDuration}
          onEndNavigation={handleEndNavigation}
          voiceMuted={voiceMuted}
          onToggleVoice={() => setVoiceMuted((m) => !m)}
        />
      )}

      {/* POI Detail Sheet */}
      <POISheet
        poi={selectedPOI}
        onClose={() => setSelectedPOI(null)}
        onSetWaypoint={handleSetWaypointFromPOI}
      />

      {/* Loading overlay */}
      {routeLoading && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[styles.loadingOverlay, { backgroundColor: `${colors.parchment}cc` }]}
        >
          <View
            style={[
              styles.loadingBox,
              { backgroundColor: colors.parchment, borderColor: colors.charcoal },
            ]}
          >
            <ActivityIndicator size="large" color={colors.charcoal} />
            <Text style={[styles.loadingRouteText, { color: colors.charcoal }]}>
              Calculating route...
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  loadingBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingRouteText: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
  },
});
