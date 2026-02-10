import AsyncStorage from '@react-native-async-storage/async-storage';

const TILE_KEY_PREFIX = 'discovery-tile:';

export type StoredTile = {
  points: { x: number; y: number; r: number }[];
};

// Called when tiles are evicted so the user keeps discovery progress across sessions.
export async function saveTile(tileId: string, tile: StoredTile) {
  await AsyncStorage.setItem(`${TILE_KEY_PREFIX}${tileId}`, JSON.stringify(tile));
}

// Called when the mode activates so the user sees previously revealed areas.
export async function loadTile(tileId: string): Promise<StoredTile | null> {
  const raw = await AsyncStorage.getItem(`${TILE_KEY_PREFIX}${tileId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTile;
  } catch {
    return null;
  }
}
