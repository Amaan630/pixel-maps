// Routing service - OSRM (primary) with OpenRouteService fallback

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number]; // [lng, lat]
  };
}

export interface RouteResponse {
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

export type TravelMode = 'walking' | 'driving';

// Format OSRM maneuver into readable instruction
function formatOSRMInstruction(step: any): string {
  const maneuver = step.maneuver;
  const name = step.name || 'the road';

  switch (maneuver.type) {
    case 'depart':
      return `Head ${maneuver.modifier || 'forward'} on ${name}`;
    case 'arrive':
      return 'Arrive at your waypoint';
    case 'turn':
      return `Turn ${maneuver.modifier || ''} onto ${name}`.trim();
    case 'new name':
      return `Continue onto ${name}`;
    case 'merge':
      return `Merge ${maneuver.modifier || ''} onto ${name}`.trim();
    case 'fork':
      return `Take the ${maneuver.modifier || ''} fork onto ${name}`.trim();
    case 'roundabout':
      return `Enter roundabout and take exit onto ${name}`;
    default:
      return `Continue on ${name}`;
  }
}

// OSRM Demo Server (primary - free, no limits)
async function getRouteFromOSRM(
  origin: [number, number],
  destination: [number, number],
  mode: TravelMode
): Promise<RouteResponse> {
  const profile = mode === 'walking' ? 'foot' : 'car';
  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`
  );

  if (!response.ok) {
    throw new Error(`OSRM request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 'Ok') {
    throw new Error(data.message || 'OSRM routing failed');
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
    steps: leg.steps.map((step: any) => ({
      instruction: formatOSRMInstruction(step),
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        location: step.maneuver.location,
      },
    })),
  };
}

// OpenRouteService (fallback - 2000 req/day free)
// Note: Requires API key from https://openrouteservice.org
const ORS_API_KEY = ''; // User can add their key here for fallback

async function getRouteFromORS(
  origin: [number, number],
  destination: [number, number],
  mode: TravelMode
): Promise<RouteResponse> {
  if (!ORS_API_KEY) {
    throw new Error('OpenRouteService API key not configured');
  }

  const profile = mode === 'walking' ? 'foot-walking' : 'driving-car';

  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({
        coordinates: [origin, destination],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ORS request failed: ${response.status}`);
  }

  const data = await response.json();
  const feature = data.features[0];
  const segment = feature.properties.segments[0];

  return {
    geometry: feature.geometry,
    distance: feature.properties.summary.distance,
    duration: feature.properties.summary.duration,
    steps: segment.steps.map((step: any) => ({
      instruction: step.instruction,
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.type.toString(),
        location: feature.geometry.coordinates[step.way_points[0]],
      },
    })),
  };
}

// Main routing function with fallback
export async function getRoute(
  origin: [number, number], // [lng, lat]
  destination: [number, number], // [lng, lat]
  mode: TravelMode
): Promise<RouteResponse> {
  try {
    // Try OSRM first (primary)
    return await getRouteFromOSRM(origin, destination, mode);
  } catch (osrmError) {
    console.warn('OSRM failed, trying OpenRouteService:', osrmError);

    // Try OpenRouteService as fallback
    if (ORS_API_KEY) {
      return await getRouteFromORS(origin, destination, mode);
    }

    // If no fallback available, throw the original error
    throw osrmError;
  }
}
