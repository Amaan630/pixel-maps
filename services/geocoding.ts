// Photon geocoding service (OpenStreetMap-based, optimized for autocomplete)
// API: https://photon.komoot.io/

// Haversine formula to calculate distance between two coordinates (in meters)
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Our unified result interface (compatible with previous Nominatim format)
export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

// Photon API response types
interface PhotonFeature {
  properties: {
    osm_id: number;
    osm_type: string;
    osm_key: string;
    osm_value: string;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

// Build a display name from Photon properties
function buildDisplayName(props: PhotonFeature['properties']): string {
  const parts: string[] = [];

  if (props.name) parts.push(props.name);
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    parts.push(props.street);
  }
  if (props.city) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);

  return parts.join(', ') || 'Unknown location';
}

export async function searchAddress(
  query: string,
  userLocation?: { lat: number; lon: number }
): Promise<GeocodingResult[]> {
  if (query.length < 2) return [];

  // Build URL with location bias if available
  let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
  if (userLocation) {
    url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  const data: PhotonResponse = await response.json();

  // Convert Photon features to our GeocodingResult format
  const results: GeocodingResult[] = data.features.map((feature, index) => ({
    place_id: feature.properties.osm_id || index,
    display_name: buildDisplayName(feature.properties),
    lat: feature.geometry.coordinates[1].toString(),
    lon: feature.geometry.coordinates[0].toString(),
    type: feature.properties.osm_value || feature.properties.osm_key || 'place',
    importance: 1 - index * 0.1, // Approximate importance from order
  }));

  // Sort by distance from user location (closest first)
  if (userLocation && results.length > 0) {
    results.sort((a, b) => {
      const distA = haversineDistance(
        userLocation.lat,
        userLocation.lon,
        parseFloat(a.lat),
        parseFloat(a.lon)
      );
      const distB = haversineDistance(
        userLocation.lat,
        userLocation.lon,
        parseFloat(b.lat),
        parseFloat(b.lon)
      );
      return distA - distB;
    });
  }

  return results;
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  const response = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&limit=1`
  );

  if (!response.ok) return null;

  const data: PhotonResponse = await response.json();

  if (data.features.length === 0) return null;

  const feature = data.features[0];
  return {
    place_id: feature.properties.osm_id || 0,
    display_name: buildDisplayName(feature.properties),
    lat: feature.geometry.coordinates[1].toString(),
    lon: feature.geometry.coordinates[0].toString(),
    type: feature.properties.osm_value || feature.properties.osm_key || 'place',
    importance: 1,
  };
}
