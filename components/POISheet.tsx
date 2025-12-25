import * as Haptics from 'expo-haptics';
import { MapPin, Navigation, X } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { POICategory } from '../config/poiIcons';
import { useTheme } from '../contexts/ThemeContext';

const SHEET_HEIGHT = 220; // Approximate sheet height

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

// Format category name for display
function formatCategory(category: POICategory): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function POISheet({ poi, onClose, onSetWaypoint }: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;
  const insets = useSafeAreaInsets();

  // Animation for slide-up effect
  const translateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (poi) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [poi]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSetWaypoint = useCallback(() => {
    if (!poi) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSetWaypoint(poi);
    onClose();
  }, [poi, onSetWaypoint, onClose]);

  if (!poi) return null;

  const displayName = poi.name || formatCategory(poi.category);
  const displayCategory = formatCategory(poi.category);

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.parchment, paddingBottom: insets.bottom + 16 }, animatedSheetStyle]}>
          {/* Touch interceptor to prevent closing when tapping sheet */}
          <Pressable>
            {/* Handle indicator */}
            {/* <View style={[styles.handleIndicator, { backgroundColor: colors.charcoal }]} /> */}

            {/* Close button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.building }]}
              onPress={onClose}
            >
              <X size={20} color={colors.charcoal} />
            </TouchableOpacity>

            {/* POI Info */}
            <View style={styles.infoSection}>
              <View style={styles.iconContainer}>
                <MapPin size={24} color={colors.route} />
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.poiName, { color: colors.charcoal, fontFamily: fonts.display }]}
                  numberOfLines={2}
                >
                  {displayName}
                </Text>
                <Text style={[styles.poiCategory, { color: colors.mutedBrown }]}>
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
                style={[styles.waypointButtonText, { color: colors.parchment, fontFamily: fonts.display }]}
              >
                Set Waypoint
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 40,
  },
  poiName: {
    fontSize: 20,
    marginBottom: 4,
  },
  poiCategory: {
    fontSize: 14,
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
  },
});
