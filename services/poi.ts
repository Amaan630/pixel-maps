// POI Service - Fetches points of interest from Overpass API

import { getCategoryFromOSMTags, osmTagMappings, POICategory } from '../config/poiIcons';

export interface POI {
  id: string;
  category: POICategory;
  name?: string;
  lat: number;
  lon: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Cache for POI responses
const poiCache = new Map<string, { pois: POI[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Generate cache key from bounds
function getBoundsKey(bounds: MapBounds): string {
  // Round to 3 decimal places (~100m precision) for cache key
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `${round(bounds.south)},${round(bounds.west)},${round(bounds.north)},${round(bounds.east)}`;
}

// Build Overpass query for all POI categories
function buildOverpassQuery(bounds: MapBounds): string {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;

  // Group queries by key to reduce query size
  const amenityValues: string[] = [];
  const shopValues: string[] = [];
  const leisureValues: string[] = [];
  const tourismValues: string[] = [];
  const aerowayValues: string[] = [];

  for (const mapping of osmTagMappings) {
    const values = Array.isArray(mapping.value) ? mapping.value : [mapping.value];
    switch (mapping.key) {
      case 'amenity':
        amenityValues.push(...values);
        break;
      case 'shop':
        shopValues.push(...values);
        break;
      case 'leisure':
        leisureValues.push(...values);
        break;
      case 'tourism':
        tourismValues.push(...values);
        break;
      case 'aeroway':
        aerowayValues.push(...values);
        break;
    }
  }

  // Build query with all categories
  const queries: string[] = [];

  if (amenityValues.length > 0) {
    queries.push(`node["amenity"~"^(${amenityValues.join('|')})$"](${bbox});`);
  }
  if (shopValues.length > 0) {
    queries.push(`node["shop"~"^(${shopValues.join('|')})$"](${bbox});`);
  }
  if (leisureValues.length > 0) {
    queries.push(`node["leisure"~"^(${leisureValues.join('|')})$"](${bbox});`);
  }
  if (tourismValues.length > 0) {
    queries.push(`node["tourism"~"^(${tourismValues.join('|')})$"](${bbox});`);
  }
  if (aerowayValues.length > 0) {
    queries.push(`node["aeroway"~"^(${aerowayValues.join('|')})$"](${bbox});`);
  }

  return `
    [out:json][timeout:10];
    (
      ${queries.join('\n      ')}
    );
    out body;
  `;
}

// Parse Overpass response into POI objects
function parseOverpassResponse(data: OverpassResponse): POI[] {
  const pois: POI[] = [];

  for (const element of data.elements) {
    if (element.type !== 'node') continue;

    const category = getCategoryFromOSMTags(element.tags || {});
    if (!category) continue;

    pois.push({
      id: `osm-${element.id}`,
      category,
      name: element.tags?.name,
      lat: element.lat,
      lon: element.lon,
    });
  }

  return pois;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// Fetch POIs from Overpass API
export async function fetchPOIs(bounds: MapBounds): Promise<POI[]> {
  // Check cache first
  const cacheKey = getBoundsKey(bounds);
  const cached = poiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.pois;
  }

  const query = buildOverpassQuery(bounds);
  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      // Silently fail on API errors (504s are common)
      return [];
    }

    const data: OverpassResponse = await response.json();
    const pois = parseOverpassResponse(data);

    // Cache the result
    poiCache.set(cacheKey, { pois, timestamp: Date.now() });

    return pois;
  } catch {
    // Silently fail on network errors
    return [];
  }
}

// Clear POI cache
export function clearPOICache(): void {
  poiCache.clear();
}

// Get POIs within bounds, with optional category filter
export async function getPOIsInBounds(
  bounds: MapBounds,
  categories?: POICategory[]
): Promise<POI[]> {
  const pois = await fetchPOIs(bounds);

  if (!categories || categories.length === 0) {
    return pois;
  }

  return pois.filter((poi) => categories.includes(poi.category));
}
