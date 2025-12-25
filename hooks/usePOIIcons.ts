// Hook to load POI icons as base64 for WebView use

import { Asset } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { getIconSetForTheme, POI_CATEGORIES, POICategory } from '../config/poiIcons';
import { ThemeName } from '../themes';

export type POIIconsMap = Partial<Record<POICategory, string>>;

// Cache loaded icons per theme
const iconCache = new Map<ThemeName, POIIconsMap>();

async function loadIconAsBase64(assetModule: number): Promise<string | null> {
  try {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();

    if (!asset.localUri) {
      console.warn('Asset has no local URI');
      return null;
    }

    const base64 = await readAsStringAsync(asset.localUri, {
      encoding: 'base64',
    });

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Failed to load icon:', error);
    return null;
  }
}

export function usePOIIcons(themeName: ThemeName): {
  icons: POIIconsMap;
  loading: boolean;
} {
  const [icons, setIcons] = useState<POIIconsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadIcons() {
      // Check cache first
      const cached = iconCache.get(themeName);
      if (cached) {
        setIcons(cached);
        setLoading(false);
        return;
      }

      setLoading(true);

      const iconSet = getIconSetForTheme(themeName);
      const loadedIcons: POIIconsMap = {};

      // Load all icons in parallel
      const loadPromises = POI_CATEGORIES.map(async (category) => {
        const assetModule = iconSet.icons[category];
        if (!assetModule) return;

        const base64 = await loadIconAsBase64(assetModule);
        if (base64) {
          loadedIcons[category] = base64;
        }
      });

      await Promise.all(loadPromises);

      if (cancelled) return;

      // Cache the loaded icons
      iconCache.set(themeName, loadedIcons);
      setIcons(loadedIcons);
      setLoading(false);
    }

    loadIcons();

    return () => {
      cancelled = true;
    };
  }, [themeName]);

  return { icons, loading };
}

// Preload icons for a theme (call early to warm cache)
export async function preloadPOIIcons(themeName: ThemeName): Promise<POIIconsMap> {
  // Check cache first
  const cached = iconCache.get(themeName);
  if (cached) {
    return cached;
  }

  const iconSet = getIconSetForTheme(themeName);
  const loadedIcons: POIIconsMap = {};

  const loadPromises = POI_CATEGORIES.map(async (category) => {
    const assetModule = iconSet.icons[category];
    if (!assetModule) return;

    const base64 = await loadIconAsBase64(assetModule);
    if (base64) {
      loadedIcons[category] = base64;
    }
  });

  await Promise.all(loadPromises);

  // Cache the loaded icons
  iconCache.set(themeName, loadedIcons);
  return loadedIcons;
}

// Clear icon cache (useful if memory is a concern)
export function clearPOIIconCache(): void {
  iconCache.clear();
}
