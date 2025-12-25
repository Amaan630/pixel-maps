import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { DirectionsPanel } from '../components/DirectionsPanel';
import { ModeSelector } from '../components/ModeSelector';
import { NavigationView } from '../components/NavigationView';
import { RecenterButton } from '../components/RecenterButton';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { GeocodingResult } from '../services/geocoding';
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

// Generate map HTML with theme colors
function getMapHTML(
  latitude: number,
  longitude: number,
  mapStyleJSON: string,
  colors: { userLocation: string; route: string; charcoal: string }
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
      width: 20px;
      height: 20px;
      background: ${colors.userLocation};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
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
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const mapStyle = ${mapStyleJSON};

    const map = new maplibregl.Map({
      container: 'map',
      style: mapStyle,
      center: [${longitude}, ${latitude}],
      zoom: 15,
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

    // Handle messages from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'updateLocation') {
          currentUserLocation = [data.longitude, data.latitude];
          userMarker.setLngLat(currentUserLocation);
          if (data.follow) {
            map.flyTo({ center: currentUserLocation });
          }
        }

        if (data.type === 'recenter') {
          map.flyTo({ center: currentUserLocation, zoom: 16 });
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
  const [error, setError] = useState<string | null>(null);
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
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

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
    })();
  }, []);

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
    if (location) {
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
    }
    setRouteLoading(false);
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

    // Start watching location for navigation
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10, // Update every 10 meters
        timeInterval: 1000, // Or every second
      },
      (newLocation) => {
        // Update user marker on map
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: 'updateLocation',
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            follow: true,
          })
        );

        // Update location state
        setLocation(newLocation);
      }
    );
  }, [route, location]);

  // Update step advancement when location changes during navigation
  useEffect(() => {
    if (!isNavigating || !route || !location) return;

    const currentStep = route.steps[currentStepIndex];
    if (!currentStep?.maneuver?.location) return;

    const distToManeuver = haversineDistance(
      [location.coords.longitude, location.coords.latitude],
      currentStep.maneuver.location
    );

    setDistanceToNextManeuver(distToManeuver);

    // If within 30 meters, advance to next step
    if (distToManeuver < 30 && currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isNavigating, route, location, currentStepIndex]);

  // End active navigation
  const handleEndNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setDistanceToNextManeuver(0);

    // Stop watching location
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
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
          Getting your location...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.parchment }]}>
        <Text style={[styles.errorText, { color: colors.charcoal }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* WebView with key to force reload on theme change */}
      <WebView
        key={themeName}
        ref={webViewRef}
        source={{
          html: getMapHTML(
            initialLocation.current?.lat ?? 37.78825,
            initialLocation.current?.lng ?? -122.4324,
            theme.mapStyleJSON,
            colors
          ),
        }}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
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

      {/* Recenter button (hidden during navigation and when route panel is shown) */}
      {!isNavigating && !route && <RecenterButton onPress={handleRecenter} />}

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
          distanceToNextManeuver={distanceToNextManeuver}
          totalDistance={remainingDistance}
          totalDuration={remainingDuration}
          onEndNavigation={handleEndNavigation}
        />
      )}

      {/* Loading overlay */}
      {routeLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: `${colors.parchment}cc` }]}>
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
        </View>
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
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
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
