import { ModeContext } from '../types';
import { MAP_MESSAGE } from '../messages';

// Called from the mini map mode lifecycle so the user can enter or exit the focused mini map view.
export function sendMiniMapMode(ctx: ModeContext, enabled: boolean) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.minimap.setMode,
      enabled,
    })
  );
}

// Called after location or heading updates so the user sees the mini map oriented correctly.
export function sendMiniMapLocation(
  ctx: ModeContext,
  latitude: number,
  longitude: number,
  bearing: number
) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.minimap.updateLocation,
      latitude,
      longitude,
      bearing,
    })
  );
}

// Called when the user presses outside the cutout so the mini map can zoom out or back in.
export function sendMiniMapZoom(ctx: ModeContext, zoom: number, duration: number) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.minimap.setZoom,
      zoom,
      duration,
    })
  );
}
