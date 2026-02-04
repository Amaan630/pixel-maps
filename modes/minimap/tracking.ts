import * as Location from 'expo-location';
import { MINI_MAP_CONFIG } from './config';
import { ModeContext } from '../types';
import { sendMiniMapLocation } from './webview';

export type MiniMapTrackingState = {
  setDeviceHeading: (heading: number | null) => void;
  getDeviceHeading: () => number | null;
  updateLastPosition: (lat: number, lon: number, bearing: number) => void;
};

export type MiniMapTrackingHandle = {
  stop: () => void;
};

// Called when mini map mode activates so the user sees live heading and location updates.
export async function startMiniMapTracking(
  ctx: ModeContext,
  state: MiniMapTrackingState
): Promise<MiniMapTrackingHandle> {
  if (!ctx.getHasLocationPermission()) {
    return { stop: () => {} };
  }

  let locationSub: Location.LocationSubscription | null = null;
  let headingSub: Location.LocationHeadingSubscription | null = null;

  locationSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: MINI_MAP_CONFIG.locationDistanceMeters,
      timeInterval: MINI_MAP_CONFIG.headingUpdateMs,
    },
    (newLocation) => {
      const bearing = state.getDeviceHeading() ?? newLocation.coords.heading ?? 0;
      ctx.setHeading(bearing);
      state.updateLastPosition(
        newLocation.coords.latitude,
        newLocation.coords.longitude,
        bearing
      );
      sendMiniMapLocation(
        ctx,
        newLocation.coords.latitude,
        newLocation.coords.longitude,
        bearing
      );
    }
  );

  headingSub = await Location.watchHeadingAsync((heading) => {
    const deviceHeading = heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
    state.setDeviceHeading(deviceHeading);
    ctx.setHeading(deviceHeading);

    const location = ctx.getLocation();
    const initial = ctx.getInitialLocation();
    const latitude = location?.coords.latitude ?? initial?.lat ?? 0;
    const longitude = location?.coords.longitude ?? initial?.lng ?? 0;
    const bearing = deviceHeading ?? 0;

    state.updateLastPosition(latitude, longitude, bearing);
    sendMiniMapLocation(ctx, latitude, longitude, bearing);
  });

  return {
    // Called when mini map mode deactivates so the user stops paying sensor and battery costs.
    stop: () => {
      if (locationSub) {
        locationSub.remove();
        locationSub = null;
      }
      if (headingSub) {
        headingSub.remove();
        headingSub = null;
      }
    },
  };
}
