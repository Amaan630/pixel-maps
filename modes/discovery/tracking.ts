import * as Location from 'expo-location';
import { ModeContext } from '../types';
import { DISCOVERY_CONFIG } from './config';

export type DiscoveryTrackingHandle = {
  stop: () => void;
};

// Called from discovery mode activation so the fog reveals as the user moves.
export async function startDiscoveryTracking(
  ctx: ModeContext,
  onLocation: (location: Location.LocationObject) => void
): Promise<DiscoveryTrackingHandle> {
  if (!ctx.getHasLocationPermission()) {
    return { stop: () => {} };
  }

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: DISCOVERY_CONFIG.moveThresholdMeters,
      timeInterval: 1000,
    },
    (location) => {
      onLocation(location);
    }
  );

  return {
    // Called when discovery mode deactivates so the user stops paying battery cost.
    stop: () => {
      sub.remove();
    },
  };
}
