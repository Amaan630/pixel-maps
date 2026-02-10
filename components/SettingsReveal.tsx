import * as Haptics from "expo-haptics";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSettings } from "../contexts/SettingsContext";
import { useTheme } from "../contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TILE_SIZE = (SCREEN_WIDTH - 48 - 16) / 2; // 2 columns with padding and gap
const PREVIEW_SIZE = TILE_SIZE;
const PANEL_HEIGHT = PREVIEW_SIZE + 120;
const DEVICE_CORNER_RADIUS = Platform.OS === "ios" ? 44 : 32;
const PANEL_BG = "#f4f1ea";
const PANEL_TEXT = "#1a1a1a";
const PANEL_BORDER = "#c62828";
const MINIMAP_IMAGES = {
    western: require("../assets/images/modes/minimap/western-minimap-transparent.png"),
    "san-andreas": require("../assets/images/modes/minimap/san-andreas-minimap-transparent.png"),
    "los-angeles": require("../assets/images/modes/minimap/los-santos-minimap-transparent.png"),
    cyberpunk: require("../assets/images/modes/minimap/cyberpunk-minimap-transparent.png"),
} as const;

const DISCOVERY_IMAGES = {
    western: require("../assets/images/modes/discovery/western-discovery.jpeg"),
    "san-andreas": require("../assets/images/modes/discovery/san-andreas-discovery.jpeg"),
    "los-angeles": require("../assets/images/modes/discovery/los-santos-discovery.jpeg"),
    cyberpunk: require("../assets/images/modes/discovery/cyberpunk-discovery.jpeg"),
} as const;

interface SettingsRevealProps {
    children: React.ReactNode;
}

export function SettingsReveal({ children }: SettingsRevealProps) {
    const { settingsVisible, setSettingsVisible, activeMode, setActiveMode } =
        useSettings();
    const { themeName } = useTheme();
    const minimapImage = MINIMAP_IMAGES[themeName];
    const discoveryImage = DISCOVERY_IMAGES[themeName];

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withTiming(
                        settingsVisible ? -PANEL_HEIGHT : 0,
                        {
                            duration: 250,
                            easing: Easing.bezier(0.165, 0.84, 0.44, 1),
                        },
                    ),
                },
            ],
        };
    });

    const handleToggleMiniMap = () => {
        Haptics.selectionAsync();
        setActiveMode(activeMode === "minimap" ? null : "minimap");
        setSettingsVisible(false);
    };

    const handleToggleDiscovery = () => {
        Haptics.selectionAsync();
        setActiveMode(activeMode === "discovery" ? null : "discovery");
        setSettingsVisible(false);
    };

    const handleDismiss = () => {
        setSettingsVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Settings panel (revealed underneath) */}
            <View style={[styles.settingsPanel, { height: PANEL_HEIGHT }]}>
                <View style={styles.grid}>
                    <Pressable
                        style={[
                            styles.minimapTile,
                            activeMode === "minimap" && styles.activeTile,
                        ]}
                        onPress={handleToggleMiniMap}>
                        <View style={styles.previewImageWrapper}>
                            <Image
                                source={minimapImage}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.textButtonLabel}>
                            {activeMode === "minimap"
                                ? "Exit minimap"
                                : "Enter minimap"}
                            {"\n"}
                            mode
                        </Text>
                    </Pressable>

                    {/* 
          <Pressable
            style={[
              styles.minimapTile,
              activeMode === 'discovery' && styles.activeTile,
            ]}
            onPress={handleToggleDiscovery}
          >
            <View style={styles.previewImageWrapper}>
              <Image source={discoveryImage} style={styles.previewImage} resizeMode="contain" />
            </View>
            <Text style={styles.textButtonLabel}>
              {activeMode === 'discovery' ? 'Exit discovery' : 'Enter discovery'}
              {'\n'}
              mode
            </Text>
          </Pressable>
          */}
                </View>
            </View>

            {/* Main content (slides up) */}
            <Animated.View style={[styles.mainContentWrapper, animatedStyle]}>
                <View style={styles.mainContent}>
                    {children}
                    {/* Tap overlay to dismiss when settings visible */}
                    {settingsVisible && (
                        <Pressable
                            style={styles.dismissOverlay}
                            onPress={handleDismiss}
                        />
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PANEL_BG,
    },
    settingsPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: PANEL_BG,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        zIndex: 0,
    },
    panelShadow: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 28,
        zIndex: 4,
        borderTopLeftRadius: DEVICE_CORNER_RADIUS,
        borderTopRightRadius: DEVICE_CORNER_RADIUS,
        overflow: "hidden",
    },
    grid: {
        flexDirection: "row",
        gap: 16,
        zIndex: 2,
    },
    minimapTile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: "transparent",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTile: {
        borderWidth: 2,
        borderColor: PANEL_BORDER,
        borderRadius: 12,
    },
    previewImageWrapper: {
        width: "75%",
        aspectRatio: 1,
        overflow: "hidden",
        marginBottom: 10,
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    textButtonLabel: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        color: PANEL_TEXT,
    },
    mainContentWrapper: {
        flex: 1,
        borderRadius: DEVICE_CORNER_RADIUS,
        backgroundColor: PANEL_BG,
        zIndex: 2,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.62,
        shadowRadius: 12,
        elevation: 12,
    },
    mainContent: {
        flex: 1,
        backgroundColor: PANEL_BG,
        borderRadius: DEVICE_CORNER_RADIUS,
        overflow: "hidden",
    },
    dismissOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
});
