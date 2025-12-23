import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const getMapHTML = (latitude: number, longitude: number) => `
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
      background: #ffffff;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const newWesternStyle = {
      version: 8,
      name: "New Western",
      sources: {
        openmaptiles: {
          type: "vector",
          url: "https://tiles.openfreemap.org/planet"
        }
      },
      glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      layers: [
        // Land - parchment tan background
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#dec29b" }
        },
        // Water fill
        {
          id: "water",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "water",
          paint: {
            "fill-color": "#9e9985",
            "fill-outline-color": "hsla(0, 0%, 0%, 0)"
          }
        },
        // Water line (outline)
        {
          id: "water-line",
          type: "line",
          source: "openmaptiles",
          "source-layer": "water",
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 15, 1, 22, 36],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1]
          }
        },
        // Landuse - parks, forests
        {
          id: "landuse-park",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landuse",
          filter: ["in", "class", "park", "grass", "cemetery"],
          paint: { "fill-color": "#d4b78a" }
        },
        {
          id: "landuse-forest",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landcover",
          filter: ["==", "class", "wood"],
          paint: { "fill-color": "#d4b78a", "fill-opacity": 0.6 }
        },
        // Buildings fill
        {
          id: "building-fill",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "building",
          paint: {
            "fill-color": "#c8b28d",
            "fill-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.5, 1]
          }
        },
        // Buildings outline
        {
          id: "building-line",
          type: "line",
          source: "openmaptiles",
          "source-layer": "building",
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 15, 0.5, 22, 12],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.5, 1]
          }
        },
        // Border shadow
        {
          id: "border-shadow",
          type: "line",
          source: "openmaptiles",
          "source-layer": "boundary",
          filter: ["==", "admin_level", 2],
          paint: {
            "line-color": "hsla(84, 4%, 25%, 0.15)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 6, 1, 22, 288],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0, 3.5, 1]
          }
        },
        // Border
        {
          id: "border",
          type: "line",
          source: "openmaptiles",
          "source-layer": "boundary",
          filter: ["==", "admin_level", 2],
          layout: { "line-join": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 6, 0.5, 22, 72],
            "line-dasharray": [10, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0, 3.5, 1]
          }
        },
        // Paths
        {
          id: "paths",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "path"],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 15, 0.5, 22, 12],
            "line-dasharray": [3, 4],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 14.5, 1]
          }
        },
        // Minor roads
        {
          id: "road-minor",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["in", "class", "minor", "service", "track"],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 14, 0.5, 22, 24],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1]
          }
        },
        // Tertiary roads
        {
          id: "road-tertiary",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "tertiary"],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 10, 0, 22, 36],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 12, 1]
          }
        },
        // Secondary roads
        {
          id: "road-secondary",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "secondary"],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0, 22, 42],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0, 10, 1]
          }
        },
        // Primary roads
        {
          id: "road-primary",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "primary"],
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 0, 22, 48],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 7.5, 1]
          }
        },
        // Trunk roads
        {
          id: "road-trunk",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "trunk"],
          layout: { "line-join": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 5, 0.5, 22, 60],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 5.5, 1]
          }
        },
        // Motorways
        {
          id: "road-motorway",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "motorway"],
          layout: { "line-join": "round" },
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 4, 0.5, 22, 72],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 5, 1]
          }
        },
        // Railway
        {
          id: "railway",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["==", "class", "rail"],
          paint: {
            "line-color": "hsl(84, 4%, 25%)",
            "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 13, 1, 22, 36],
            "line-dasharray": [10, 1],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 11.5, 1]
          }
        },
        // Water labels
        {
          id: "water-label",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "water_name",
          filter: ["==", "$type", "Point"],
          layout: {
            "text-field": "{name}",
            "text-font": ["Noto Sans Italic"],
            "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 8, 10, 22, 48],
            "text-letter-spacing": 0.1
          },
          paint: {
            "text-color": "#40423d",
            "text-halo-color": "#9e9985",
            "text-halo-width": 1
          }
        },
        // Place labels - cities/towns
        {
          id: "place-city",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "place",
          filter: ["in", "class", "city", "town"],
          layout: {
            "text-field": "{name}",
            "text-font": ["Noto Sans Bold"],
            "text-transform": "uppercase",
            "text-letter-spacing": 0.2,
            "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 6, 10, 14, 24, 22, 72]
          },
          paint: {
            "text-color": "hsla(84, 4%, 25%, 0.9)",
            "text-halo-color": "#dec29b",
            "text-halo-width": 2
          }
        },
        // Place labels - villages
        {
          id: "place-village",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "place",
          filter: ["==", "class", "village"],
          layout: {
            "text-field": "{name}",
            "text-font": ["Noto Sans Bold"],
            "text-transform": "uppercase",
            "text-letter-spacing": 0.15,
            "text-size": ["interpolate", ["exponential", 1.2], ["zoom"], 10, 8, 22, 36]
          },
          paint: {
            "text-color": "hsla(84, 4%, 25%, 0.9)",
            "text-halo-color": "#dec29b",
            "text-halo-width": 1.5
          }
        },
        // Road labels
        {
          id: "road-label",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "transportation_name",
          filter: ["in", "class", "primary", "secondary", "tertiary", "trunk", "motorway"],
          layout: {
            "text-field": "{name}",
            "text-font": ["Noto Sans Regular"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 10, 8, 18, 14],
            "symbol-placement": "line",
            "text-rotation-alignment": "map"
          },
          paint: {
            "text-color": "#40423d",
            "text-halo-color": "#dec29b",
            "text-halo-width": 2
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: 'map',
      style: newWesternStyle,
      center: [${longitude}, ${latitude}],
      zoom: 15
    });

    map.on('error', (e) => {
      console.error('Map error:', e.error);
      document.body.innerHTML += '<div style="position:absolute;top:0;left:0;background:red;color:white;padding:10px;z-index:9999;">Error: ' + e.error.message + '</div>';
    });

    // Add user location marker
    const userMarker = document.createElement('div');
    userMarker.className = 'user-location';
    new maplibregl.Marker({ element: userMarker })
      .setLngLat([${longitude}, ${latitude}])
      .addTo(map);

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Enable location tracking via message from React Native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'updateLocation') {
          userMarker.setLngLat([data.longitude, data.latitude]);
          if (data.follow) {
            map.flyTo({ center: [data.longitude, data.latitude] });
          }
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
`;

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

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
      setLoading(false);
    })();
  }, []);


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#40423d" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getMapHTML(
          location?.coords.latitude ?? 37.78825,
          location?.coords.longitude ?? -122.4324
        )}}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />
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
    backgroundColor: '#dec29b',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#40423d',
  },
  errorText: {
    fontSize: 18,
    color: '#40423d',
    textAlign: 'center',
    padding: 20,
  },
});
