// Hook to load location marker icon as base64 for WebView use

import { Asset } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { ThemeName } from '../themes';

// Location marker icons per theme
const locationMarkerIcons: Record<ThemeName, number> = {
  'san-andreas': require('../assets/minimap-icons/gta-san-andreas/radar_centre.png'),
  'los-angeles': require('../assets/minimap-icons/gta-v/gtav_player_marker.png'),
  western: require('../assets/minimap-icons/rdr2/radar-center.png'),
  cyberpunk: require('../assets/minimap-icons/cyberpunk/radar-center.png'),
};

// Cache loaded icons per theme
const markerCache = new Map<ThemeName, string>();

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
    console.error('Failed to load location marker icon:', error);
    return null;
  }
}

export function useLocationMarkerIcon(themeName: ThemeName): {
  markerIcon: string | null;
  loading: boolean;
} {
  const [markerIcon, setMarkerIcon] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadIcon() {
      // Check cache first
      const cached = markerCache.get(themeName);
      if (cached) {
        setMarkerIcon(cached);
        setLoading(false);
        return;
      }

      setLoading(true);

      const assetModule = locationMarkerIcons[themeName];
      const base64 = await loadIconAsBase64(assetModule);

      if (cancelled) return;

      if (base64) {
        markerCache.set(themeName, base64);
        setMarkerIcon(base64);
      }
      setLoading(false);
    }

    loadIcon();

    return () => {
      cancelled = true;
    };
  }, [themeName]);

  return { markerIcon, loading };
}
