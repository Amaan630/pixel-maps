import { ModeContext } from '../types';
import { MAP_MESSAGE } from '../messages';
import { TileRecord, TilePoint } from './tiles';

// Called when the user enables discovery mode so the fog layer appears.
export function sendDiscoveryMode(ctx: ModeContext, enabled: boolean) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.discovery.setMode,
      enabled,
    })
  );
}

// Called when the user reveals a new location so the fog updates immediately.
export function sendDiscoveryReveal(ctx: ModeContext, tileId: string, point: TilePoint) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.discovery.reveal,
      tileId,
      point,
    })
  );
}

// Called after reloads so the user sees prior discoveries without waiting to move.
export function sendDiscoveryTiles(ctx: ModeContext, tiles: TileRecord[]) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.discovery.loadTiles,
      tiles,
    })
  );
}

// Called when the user exits discovery mode so the map returns to normal.
export function sendDiscoveryClear(ctx: ModeContext) {
  ctx.webViewRef.current?.postMessage(
    JSON.stringify({
      type: MAP_MESSAGE.discovery.clear,
    })
  );
}
