import { DISCOVERY_CONFIG } from './config';
import { loadTile, saveTile, StoredTile } from './storage';

export type TileId = string;
export type TilePoint = { x: number; y: number; r: number };

export type TileRecord = {
  id: TileId;
  points: TilePoint[];
};

export type TileStore = {
  tiles: Map<TileId, TileRecord>;
  touch: (tileId: TileId) => void;
  evictIfNeeded: () => Promise<void>;
  getTile: (tileId: TileId) => TileRecord | null;
  setTile: (tileId: TileId, tile: TileRecord) => void;
  loadTile: (tileId: TileId) => Promise<TileRecord | null>;
  revealAt: (lat: number, lon: number) => Promise<{ tile: TileRecord; point: TilePoint }>;
  getNearbyTileIds: (lat: number, lon: number) => TileId[];
};

const { tileSizePx, tileZoom, maxTilesInMemory, revealRadiusMeters, maxTilesLoadRadius } =
  DISCOVERY_CONFIG;

// Called when converting GPS coordinates to tile indices so reveals align with the map.
function lngLatToTileXY(lon: number, lat: number, zoom: number) {
  const n = 2 ** zoom;
  const x = (lon + 180) / 360 * n;
  const latRad = lat * Math.PI / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  return { x, y };
}

// Called when converting GPS coordinates to a tile + pixel so reveals land in the right spot.
function lngLatToTilePixel(lon: number, lat: number, zoom: number, size: number) {
  const { x, y } = lngLatToTileXY(lon, lat, zoom);
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const pixelX = Math.floor((x - tileX) * size);
  const pixelY = Math.floor((y - tileY) * size);
  return { tileX, tileY, pixelX, pixelY };
}

// Called when computing reveal radius in pixels so the fog edge looks consistent at a given zoom.
function metersToPixels(lat: number, meters: number, zoom: number) {
  const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / 2 ** zoom;
  return meters / metersPerPixel;
}

// Called when identifying tiles so the store keys are consistent across the app.
function tileIdFor(tileX: number, tileY: number, zoom: number): TileId {
  return `${zoom}/${tileX}/${tileY}`;
}

// Called when revealing nearby tiles so the user sees previously explored areas.
function tilesAround(tileX: number, tileY: number, radius: number, zoom: number) {
  const ids: TileId[] = [];
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      ids.push(tileIdFor(tileX + dx, tileY + dy, zoom));
    }
  }
  return ids;
}

// Called from discovery mode so the user has a bounded-memory tile cache.
export function createTileStore(): TileStore {
  const tiles = new Map<TileId, TileRecord>();
  const pendingSaves = new Map<TileId, number>();

  // Called after tile changes so the user’s discovery progress is persisted without blocking.
  const scheduleSave = (tileId: TileId) => {
    if (pendingSaves.has(tileId)) return;
    const timeoutId = setTimeout(() => {
      pendingSaves.delete(tileId);
      const tile = tiles.get(tileId);
      if (tile) {
        void saveTile(tileId, { points: tile.points });
      }
    }, 750);
    pendingSaves.set(tileId, timeoutId as unknown as number);
  };

  // Called when a tile is accessed so the user’s most-relevant areas stay in memory.
  const touch = (tileId: TileId) => {
    const existing = tiles.get(tileId);
    if (!existing) return;
    tiles.delete(tileId);
    tiles.set(tileId, existing);
  };

  // Called after updates so the user’s device memory stays bounded.
  const evictIfNeeded = async () => {
    while (tiles.size > maxTilesInMemory) {
      const firstKey = tiles.keys().next().value as TileId | undefined;
      if (!firstKey) return;
      const tile = tiles.get(firstKey);
      tiles.delete(firstKey);
      if (tile) {
        await saveTile(firstKey, { points: tile.points });
      }
    }
  };

  // Called when rendering or syncing so the user sees already revealed areas.
  const getTile = (tileId: TileId) => tiles.get(tileId) ?? null;

  // Called when new tile data is created so the user can reveal new space.
  const setTile = (tileId: TileId, tile: TileRecord) => {
    tiles.set(tileId, tile);
    touch(tileId);
  };

  // Called during activation so the user’s previous discoveries are loaded.
  const loadTileFromStorage = async (tileId: TileId): Promise<TileRecord | null> => {
    const stored = await loadTile(tileId);
    if (!stored) return null;
    return { id: tileId, points: stored.points };
  };

  // Called on location updates so the user reveals fog where they are.
  const revealAt = async (lat: number, lon: number) => {
    const { tileX, tileY, pixelX, pixelY } = lngLatToTilePixel(lon, lat, tileZoom, tileSizePx);
    const tileId = tileIdFor(tileX, tileY, tileZoom);
    const radiusPx = metersToPixels(lat, revealRadiusMeters, tileZoom);

    let tile = tiles.get(tileId);
    if (!tile) {
      tile = (await loadTileFromStorage(tileId)) ?? { id: tileId, points: [] };
    }

    const point = { x: pixelX, y: pixelY, r: radiusPx };
    tile.points.push(point);
    setTile(tileId, tile);
    scheduleSave(tileId);
    await evictIfNeeded();

    return { tile, point };
  };

  // Called when loading nearby tiles so the user sees context around their location.
  const getNearbyTileIds = (lat: number, lon: number) => {
    const { tileX, tileY } = lngLatToTileXY(lon, lat, tileZoom);
    return tilesAround(Math.floor(tileX), Math.floor(tileY), maxTilesLoadRadius, tileZoom);
  };

  return {
    tiles,
    touch,
    evictIfNeeded,
    getTile,
    setTile,
    loadTile: loadTileFromStorage,
    revealAt,
    getNearbyTileIds,
  };
}
