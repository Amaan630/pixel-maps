import { ModeContext, ModeService } from '../types';
import { MINI_MAP_CONFIG } from './config';
import { sendMiniMapLocation, sendMiniMapMode, sendMiniMapZoom } from './webview';
import { startMiniMapTracking } from './tracking';

export type MiniMapOverlayProps = {
  heading: number | null;
  onPressIn: () => void;
  onPressOut: () => void;
};

// Called from MapScreen so the user can toggle mini map mode without touching MapScreen internals.
export function createMiniMapModeService(): ModeService & {
  getOverlayProps: (ctx: ModeContext) => MiniMapOverlayProps;
} {
  let isActive = false;
  let zoomedOut = false;
  let deviceHeading: number | null = null;
  let trackingStop: (() => void) | null = null;
  let lastPosition = {
    lat: 0,
    lon: 0,
    bearing: 0,
  };

  // Called from tracking updates so the user’s mini map stays centered on their latest position.
  const updateLastPosition = (lat: number, lon: number, bearing: number) => {
    lastPosition = { lat, lon, bearing };
  };

  // Called from heading tracking so the user’s compass follows the device’s direction.
  const setDeviceHeading = (heading: number | null) => {
    deviceHeading = heading;
  };

  // Called from tracking so the user’s bearing uses the latest device heading when available.
  const getDeviceHeading = () => deviceHeading;

  // Called during activation and sync so the user sees a reasonable map even before GPS updates.
  const ensureFallbackPosition = (ctx: ModeContext) => {
    if (lastPosition.lat !== 0 || lastPosition.lon !== 0) return;
    const location = ctx.getLocation();
    const initial = ctx.getInitialLocation();
    lastPosition = {
      lat: location?.coords.latitude ?? initial?.lat ?? 0,
      lon: location?.coords.longitude ?? initial?.lng ?? 0,
      bearing: ctx.getHeading() ?? 0,
    };
  };

  // Called after activation or permission changes so the user gets live mini map updates.
  const ensureTracking = async (ctx: ModeContext) => {
    if (!isActive || trackingStop || !ctx.getHasLocationPermission()) return;
    const handle = await startMiniMapTracking(ctx, {
      setDeviceHeading,
      getDeviceHeading,
      updateLastPosition,
    });
    trackingStop = handle.stop;
  };

  // Called when mini map is enabled so the user immediately sees the focused mini map view.
  const activate = (ctx: ModeContext) => {
    isActive = true;
    ensureFallbackPosition(ctx);
    sendMiniMapMode(ctx, true);
    sendMiniMapZoom(ctx, zoomedOut ? MINI_MAP_CONFIG.zoomOut : MINI_MAP_CONFIG.zoomIn, MINI_MAP_CONFIG.zoomDurationMs);
    sendMiniMapLocation(ctx, lastPosition.lat, lastPosition.lon, lastPosition.bearing);
    void ensureTracking(ctx);
  };

  // Called when mini map is disabled so the user returns to the normal interactive map.
  const deactivate = (ctx: ModeContext) => {
    isActive = false;
    zoomedOut = false;
    if (trackingStop) {
      trackingStop();
      trackingStop = null;
    }
    deviceHeading = null;
    ctx.setHeading(null);
    sendMiniMapMode(ctx, false);
  };

  // Called on theme change or WebView reload so the user keeps the same mini map state.
  const sync = (ctx: ModeContext) => {
    if (!isActive) return;
    ensureFallbackPosition(ctx);
    sendMiniMapMode(ctx, true);
    sendMiniMapZoom(ctx, zoomedOut ? MINI_MAP_CONFIG.zoomOut : MINI_MAP_CONFIG.zoomIn, MINI_MAP_CONFIG.zoomDurationMs);
    sendMiniMapLocation(ctx, lastPosition.lat, lastPosition.lon, lastPosition.bearing);
    void ensureTracking(ctx);
  };

  // Called when the user presses outside the cutout so they can zoom out for more context.
  const handlePressIn = (ctx: ModeContext) => {
    if (!isActive) return;
    zoomedOut = true;
    sendMiniMapZoom(ctx, MINI_MAP_CONFIG.zoomOut, MINI_MAP_CONFIG.zoomDurationMs);
  };

  // Called when the user releases the cutout so they return to the closer zoom.
  const handlePressOut = (ctx: ModeContext) => {
    if (!isActive) return;
    zoomedOut = false;
    sendMiniMapZoom(ctx, MINI_MAP_CONFIG.zoomIn, MINI_MAP_CONFIG.zoomDurationMs);
  };

  return {
    id: 'minimap',
    activate,
    deactivate,
    sync,
    // Called after theme change so the user sees the correct mini map after reload.
    onThemeChange: sync,
    // Called after WebView load so the user sees the correct mini map immediately.
    onWebViewLoad: sync,
    // Called from MapScreen render so the user can zoom with overlay presses.
    getOverlayProps: (ctx: ModeContext) => ({
      heading: ctx.getHeading(),
      onPressIn: () => handlePressIn(ctx),
      onPressOut: () => handlePressOut(ctx),
    }),
  };
}
