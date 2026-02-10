import * as Haptics from 'expo-haptics';
import { MapPin, Navigation } from 'lucide-react-native';
import { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { POICategory } from '../config/poiIcons';
import { useTheme, useUiFont } from '../contexts/ThemeContext';
import { usePOIIcons } from '../hooks/usePOIIcons';
import { UndraggableSheet } from './UndraggableSheet';

interface POIData {
  id: string;
  category: POICategory;
  name?: string;
  lat: number;
  lon: number;
}

interface Props {
  poi: POIData | null;
  onClose: () => void;
  onSetWaypoint: (poi: POIData) => void;
}

function formatCategory(category: POICategory): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function POISheet({ poi, onClose, onSetWaypoint }: Props) {
  const { theme, themeName } = useTheme();
  const { colors } = theme;
  const uiFont = useUiFont();
  const { icons } = usePOIIcons(themeName);

  const handleSetWaypoint = useCallback(() => {
    if (!poi) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSetWaypoint(poi);
    onClose();
  }, [poi, onSetWaypoint, onClose]);

  if (!poi) return null;

  const displayName = poi.name || formatCategory(poi.category);
  const displayCategory = formatCategory(poi.category);
  const iconUri = icons[poi.category];

  return (
    <UndraggableSheet visible={!!poi} onClose={onClose}>
      {/* POI Info */}
      <View style={styles.infoSection}>
        <View style={[styles.iconContainer, { backgroundColor: colors.building }]}>
          {iconUri ? (
            <Image source={{ uri: iconUri }} style={styles.poiIcon} resizeMode="contain" />
          ) : (
            <MapPin size={24} color={colors.route} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.poiName, { color: colors.charcoal, fontFamily: uiFont }]}
            numberOfLines={2}
          >
            {displayName}
          </Text>
          <Text style={[styles.poiCategory, { color: colors.mutedBrown, fontFamily: uiFont }]}>
            {displayCategory}
          </Text>
        </View>
      </View>

      {/* Set Waypoint Button */}
      <TouchableOpacity
        style={[styles.waypointButton, { backgroundColor: colors.route }]}
        onPress={handleSetWaypoint}
      >
        <Navigation size={20} color={colors.parchment} />
        <Text
          style={[
            styles.waypointButtonText,
            { color: colors.textOnTextBackground, fontFamily: uiFont },
          ]}
        >
          Set Waypoint
        </Text>
      </TouchableOpacity>
    </UndraggableSheet>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  poiIcon: {
    width: 32,
    height: 32,
  },
  textContainer: {
    flex: 1,
    paddingRight: 40,
  },
  poiName: {
    fontSize: 20,
    marginBottom: 4,
    fontWeight: '600',
  },
  poiCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  waypointButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  waypointButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
