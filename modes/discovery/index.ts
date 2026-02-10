import { ModeContext, ModeService } from '../types';
import * as Location from 'expo-location';
import { createTileStore } from './tiles';
import { sendDiscoveryClear, sendDiscoveryMode, sendDiscoveryReveal, sendDiscoveryTiles } from './webview';
import { startDiscoveryTracking } from './tracking';

export type DiscoveryOverlayProps = Record<string, never>;

// Called from MapScreen so the user can enable discovery mode without extra wiring.
export function createDiscoveryModeService(): ModeService & {
  getOverlayProps: () => DiscoveryOverlayProps;
} {
  let isActive = false;
  let trackingStop: (() => void) | null = null;
  const tileStore = createTileStore();

  // Called on activation and sync so the user sees previously revealed nearby tiles.
  const loadNearbyTiles = async (ctx: ModeContext) => {
    const location = ctx.getLocation();
    const initial = ctx.getInitialLocation();
    const lat = location?.coords.latitude ?? initial?.lat ?? 0;
    const lon = location?.coords.longitude ?? initial?.lng ?? 0;
    const ids = tileStore.getNearbyTileIds(lat, lon);
    const tiles = await Promise.all(
      ids.map(async (id) => {
        const inMemory = tileStore.getTile(id);
        if (inMemory) return inMemory;
        const loaded = await tileStore.loadTile(id);
        if (loaded) {
          tileStore.setTile(id, loaded);
        }
        return loaded;
      })
    );
    const existing = tiles.filter((tile): tile is NonNullable<typeof tile> => !!tile);
    if (existing.length > 0) {
      sendDiscoveryTiles(ctx, existing);
    }
  };

  // Called on movement so the user reveals fog around their current position.
  const handleLocationUpdate = async (ctx: ModeContext, location: Location.LocationObject) => {
    const { tile, point } = await tileStore.revealAt(
      location.coords.latitude,
      location.coords.longitude
    );
    sendDiscoveryReveal(ctx, tile.id, point);
  };

  // Called on activation and sync so the user immediately sees their current location revealed.
  const revealCurrentLocation = async (ctx: ModeContext) => {
    const current = ctx.getLocation();
    if (current) {
      await handleLocationUpdate(ctx, current);
      return;
    }
    if (!ctx.getHasLocationPermission()) return;
    try {
      const fresh = await Location.getCurrentPositionAsync({});
      await handleLocationUpdate(ctx, fresh);
    } catch {
      // Ignore location fetch errors; tracking will reveal when it can.
    }
  };

  // Called when discovery mode is enabled so the user immediately sees fog behavior.
  const activate = (ctx: ModeContext) => {
    isActive = true;
    sendDiscoveryMode(ctx, true);
    void loadNearbyTiles(ctx);
    void revealCurrentLocation(ctx);
    void startDiscoveryTracking(ctx, (location) => {
      void handleLocationUpdate(ctx, location);
    }).then((handle) => {
      trackingStop = handle.stop;
    });
  };

  // Called when discovery mode is disabled so the user returns to a normal map.
  const deactivate = (ctx: ModeContext) => {
    isActive = false;
    if (trackingStop) {
      trackingStop();
      trackingStop = null;
    }
    sendDiscoveryClear(ctx);
    sendDiscoveryMode(ctx, false);
  };

  // Called after theme change or reload so the user keeps their discovered areas.
  const sync = (ctx: ModeContext) => {
    if (!isActive) return;
    sendDiscoveryMode(ctx, true);
    void loadNearbyTiles(ctx);
    void revealCurrentLocation(ctx);
  };

  return {
    id: 'discovery',
    activate,
    deactivate,
    sync,
    // Called after theme change so the fog layer is re-applied for the user.
    onThemeChange: sync,
    // Called after WebView load so discovery rehydrates immediately.
    onWebViewLoad: sync,
    // Called by MapScreen so the user can render any discovery-specific overlay later.
    getOverlayProps: () => ({}),
  };
}
