import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_WIDTH - 48 - 16) / 2; // 2 columns with padding and gap
const PREVIEW_SIZE = TILE_SIZE;
const PANEL_HEIGHT = PREVIEW_SIZE + 120;
const DEVICE_CORNER_RADIUS = Platform.OS === 'ios' ? 44 : 32;
const MINIMAP_IMAGES = {
  western: require('../assets/images/minimaps/western-minimap.jpeg'),
  'san-andreas': require('../assets/images/minimaps/san-andreas-minimap.jpeg'),
  'los-angeles': require('../assets/images/minimaps/los-santos-minimap.jpeg'),
  cyberpunk: require('../assets/images/minimaps/cyberpunk-minimap.jpeg'),
} as const;

interface SettingsRevealProps {
  children: React.ReactNode;
}

export function SettingsReveal({ children }: SettingsRevealProps) {
  const { settingsVisible, setSettingsVisible, miniMapMode, setMiniMapMode } = useSettings();
  const { theme, themeName } = useTheme();
  const { colors } = theme;
  const minimapImage = MINIMAP_IMAGES[themeName];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(settingsVisible ? -PANEL_HEIGHT : 0, {
            duration: 250,
            easing: Easing.bezier(0.165, 0.84, 0.44, 1),
          }),
        },
      ],
    };
  });

  const handleToggleMiniMap = () => {
    Haptics.selectionAsync();
    setMiniMapMode(!miniMapMode);
  };

  const handleDismiss = () => {
    setSettingsVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Settings panel (revealed underneath) */}
      <View style={[styles.settingsPanel, { height: PANEL_HEIGHT }]}>
        <View style={styles.grid}>
          <Pressable style={styles.minimapTile} onPress={handleToggleMiniMap}>
            <Image source={minimapImage} style={styles.previewImage} resizeMode="contain" />
            <Text style={[styles.textButtonLabel, { color: colors.route }]}>
              {miniMapMode ? 'Exit minimap mode' : 'Enter minimap mode'}
            </Text>
          </Pressable>

          <View style={styles.placeholderTile}>
            <Text style={styles.placeholderText}>More soon...</Text>
          </View>
        </View>
      </View>

      {/* Main content (slides up) */}
      <Animated.View style={[styles.mainContent, animatedStyle]}>
        {children}
        {/* Tap overlay to dismiss when settings visible */}
        {settingsVisible && (
          <Pressable style={styles.dismissOverlay} onPress={handleDismiss} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  minimapTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#000000',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '75%',
  },
  textButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: DEVICE_CORNER_RADIUS,
    overflow: 'hidden',
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
