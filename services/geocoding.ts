// Nominatim (OpenStreetMap) geocoding service - completely free

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (query.length < 3) return [];

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    {
      headers: {
        'User-Agent': 'PixelMaps/1.0 (https://github.com/pixel-maps)',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  return response.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        'User-Agent': 'PixelMaps/1.0 (https://github.com/pixel-maps)',
      },
    }
  );

  if (!response.ok) return null;

  return response.json();
}
