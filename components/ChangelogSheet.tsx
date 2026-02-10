import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { CornerUpRight, MapPin, Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useUiFont } from "../contexts/ThemeContext";

const CURRENT_CHANGELOG_VERSION = "1.01";
const STORAGE_KEY = "pixel-maps-last-seen-changelog";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_PAGES = 2;

const MINIMAP_IMAGES = {
    western: require("../assets/images/modes/minimap/western-minimap-transparent.png"),
    "san-andreas": require("../assets/images/modes/minimap/san-andreas-minimap-transparent.png"),
    "los-angeles": require("../assets/images/modes/minimap/los-santos-minimap-transparent.png"),
    cyberpunk: require("../assets/images/modes/minimap/cyberpunk-minimap-transparent.png"),
} as const;

const LIVE_ACTIVITY_THEMES: Record<
    string,
    { bg: string; primary: string; secondary: string; accent: string }
> = {
    western: {
        bg: "#c8a878",
        primary: "#40423d",
        secondary: "#8a7a5a",
        accent: "#ee0400",
    },
    "los-angeles": {
        bg: "#2a2a2a",
        primary: "#e0e0e0",
        secondary: "#888888",
        accent: "#9552e9",
    },
    "san-andreas": {
        bg: "#7A8495",
        primary: "#1A1A2A",
        secondary: "#4a4a5a",
        accent: "#C54040",
    },
    cyberpunk: {
        bg: "#141c28",
        primary: "#00d4ff",
        secondary: "#4a6a7a",
        accent: "#fcee0a",
    },
};

export function ChangelogSheet() {
    const { theme, themeName } = useTheme();
    const { colors } = theme;
    const uiFont = useUiFont();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [activePage, setActivePage] = useState(0);

    useEffect(() => {
        // TEMP: clear stored version so sheet always shows for testing
        // AsyncStorage.removeItem(STORAGE_KEY);

        (async () => {
            const lastSeen = await AsyncStorage.getItem(STORAGE_KEY);
            if (lastSeen !== CURRENT_CHANGELOG_VERSION) {
                setVisible(true);
            }
        })();
    }, []);

    const handleDismiss = async () => {
        Haptics.selectionAsync();
        await AsyncStorage.setItem(STORAGE_KEY, CURRENT_CHANGELOG_VERSION);
        setVisible(false);
    };

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (page !== activePage) setActivePage(page);
    };

    const minimapImage =
        MINIMAP_IMAGES[themeName as keyof typeof MINIMAP_IMAGES];
    const laTheme =
        LIVE_ACTIVITY_THEMES[themeName] ?? LIVE_ACTIVITY_THEMES.western;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleDismiss}>
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.parchment },
                ]}>
                {/* Drag indicator */}
                <View style={styles.handleBar}>
                    <View
                        style={[
                            styles.handle,
                            { backgroundColor: colors.charcoal },
                        ]}
                    />
                </View>

                <Text
                    style={[
                        styles.sheetTitle,
                        { color: colors.charcoal, fontFamily: uiFont },
                    ]}>
                    {"What's New"}
                </Text>

                {/* Carousel */}
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    bounces={false}>
                    {/* Page 1: Minimap Mode */}
                    <ScrollView
                        style={styles.page}
                        contentContainerStyle={styles.pageContent}
                        showsVerticalScrollIndicator={false}
                        centerContent>
                        <View style={styles.visualArea}>
                            <View style={styles.minimapImageWrapper}>
                                <Image
                                    source={minimapImage}
                                    style={styles.minimapImageImg}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.pageTitle,
                                {
                                    color: colors.charcoal,
                                    fontFamily: uiFont,
                                },
                            ]}>
                            Minimap Mode
                        </Text>

                        <Text
                            style={[
                                styles.pageDescription,
                                {
                                    color: colors.charcoal,
                                    fontFamily: uiFont,
                                },
                            ]}>
                            Transforms your entire map into a game-style
                            minimap.
                        </Text>

                        <View
                            style={[
                                styles.howToCard,
                                { backgroundColor: colors.building },
                            ]}>
                            <View style={styles.step}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        {
                                            backgroundColor: colors.route,
                                        },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            {
                                                color: colors.textOnTextBackground,
                                            },
                                        ]}>
                                        1
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.stepText,
                                        { color: colors.charcoal },
                                    ]}>
                                    {"Tap "}
                                    <Settings
                                        size={13}
                                        color={colors.charcoal}
                                    />
                                    {" in the top right"}
                                </Text>
                            </View>

                            <View style={[styles.step, { marginBottom: 0 }]}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        {
                                            backgroundColor: colors.route,
                                        },
                                    ]}>
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            {
                                                color: colors.textOnTextBackground,
                                            },
                                        ]}>
                                        2
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.stepText,
                                        { color: colors.charcoal },
                                    ]}>
                                    {'Select "Minimap Mode"'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Page 2: Live Activities */}
                    <ScrollView
                        style={styles.page}
                        contentContainerStyle={styles.pageContent}
                        showsVerticalScrollIndicator={false}
                        centerContent>
                        <View style={styles.visualArea}>
                            {/* Mock Lock Screen Banner */}
                            <View
                                style={[
                                    styles.lockScreen,
                                    { backgroundColor: laTheme.bg },
                                ]}>
                                <View style={styles.lockScreenTop}>
                                    <View
                                        style={[
                                            styles.arrowArea,
                                            {
                                                backgroundColor: `${laTheme.accent}20`,
                                            },
                                        ]}>
                                        <CornerUpRight
                                            size={20}
                                            color={laTheme.accent}
                                        />
                                    </View>
                                    <View style={styles.lockScreenTextCol}>
                                        <Text
                                            style={[
                                                styles.lockScreenSmall,
                                                {
                                                    color: laTheme.secondary,
                                                },
                                            ]}>
                                            200 m
                                        </Text>
                                        <Text
                                            style={[
                                                styles.lockScreenMain,
                                                {
                                                    color: laTheme.primary,
                                                },
                                            ]}>
                                            Turn right onto Main St
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.divider,
                                        {
                                            backgroundColor: `${laTheme.secondary}4D`,
                                        },
                                    ]}
                                />

                                <View style={styles.lockScreenBottom}>
                                    <View style={styles.lockScreenRow}>
                                        <MapPin
                                            size={11}
                                            color={laTheme.secondary}
                                        />
                                        <Text
                                            style={[
                                                styles.lockScreenCaption,
                                                {
                                                    color: laTheme.secondary,
                                                },
                                            ]}>
                                            Downtown
                                        </Text>
                                    </View>
                                    <View style={styles.lockScreenRow}>
                                        <Text
                                            style={[
                                                styles.lockScreenCaptionBold,
                                                {
                                                    color: laTheme.primary,
                                                },
                                            ]}>
                                            1.2 km
                                        </Text>
                                        <Text
                                            style={[
                                                styles.lockScreenCaption,
                                                {
                                                    color: laTheme.secondary,
                                                },
                                            ]}>
                                            {"  ETA"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Mock Dynamic Island Pill */}
                            <View style={styles.diPill}>
                                <CornerUpRight
                                    size={14}
                                    color={laTheme.accent}
                                />
                                <Text
                                    style={[
                                        styles.diText,
                                        { color: laTheme.accent },
                                    ]}>
                                    200m
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.pageTitle,
                                {
                                    color: colors.charcoal,
                                    fontFamily: uiFont,
                                },
                            ]}>
                            Live Activities
                        </Text>

                        <Text
                            style={[
                                styles.pageDescription,
                                {
                                    color: colors.charcoal,
                                    fontFamily: uiFont,
                                },
                            ]}>
                            Turn-by-turn directions on your Lock Screen and
                            Dynamic Island. Starts automatically when you
                            navigate.
                        </Text>
                    </ScrollView>
                </ScrollView>

                {/* Bottom area */}
                <View
                    style={[
                        styles.bottomArea,
                        { paddingBottom: insets.bottom + 16 },
                    ]}>
                    <View style={styles.pagination}>
                        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: colors.charcoal,
                                        opacity: i === activePage ? 1 : 0.2,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.dismissButton,
                            { backgroundColor: colors.route },
                        ]}
                        onPress={handleDismiss}
                        activeOpacity={0.8}>
                        <Text
                            style={[
                                styles.dismissText,
                                {
                                    color: colors.textOnTextBackground,
                                    fontFamily: uiFont,
                                },
                            ]}>
                            Got it
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    handleBar: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 4,
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        opacity: 0.3,
    },
    sheetTitle: {
        fontSize: 26,
        fontWeight: "500",
        letterSpacing: -0.5,
        textAlign: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    page: {
        width: SCREEN_WIDTH,
    },
    pageContent: {
        paddingHorizontal: 32,
        paddingTop: 8,
        alignItems: "center",
    },
    visualArea: {
        alignItems: "center",
        marginBottom: 24,
        width: "100%",
    },
    minimapImageWrapper: {
        width: "60%",
        overflow: "hidden",
    },
    minimapImageImg: {
        width: "100%",
        height: undefined,
        aspectRatio: 1,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "500",
        letterSpacing: -0.5,
        textAlign: "center",
        marginBottom: 8,
    },
    pageDescription: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        opacity: 0.6,
        marginBottom: 20,
    },
    howToCard: {
        borderRadius: 12,
        padding: 14,
        width: "100%",
    },
    step: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 6,
    },
    stepCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumber: {
        fontSize: 11,
        fontWeight: "700",
    },
    stepText: {
        fontSize: 14,
        fontWeight: "400",
        flex: 1,
    },
    lockScreen: {
        borderRadius: 16,
        padding: 14,
        width: "85%",
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    lockScreenTop: {
        flexDirection: "row",
        gap: 12,
    },
    arrowArea: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    lockScreenTextCol: {
        flex: 1,
        justifyContent: "center",
    },
    lockScreenSmall: {
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 1,
    },
    lockScreenMain: {
        fontSize: 15,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        marginVertical: 10,
    },
    lockScreenBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    lockScreenRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    lockScreenCaption: {
        fontSize: 11,
    },
    lockScreenCaptionBold: {
        fontSize: 11,
        fontWeight: "700",
    },
    diPill: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    diText: {
        fontSize: 11,
        fontWeight: "700",
    },
    bottomArea: {
        paddingHorizontal: 32,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginBottom: 16,
    },
    dismissButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    dismissText: {
        fontSize: 17,
        fontWeight: "600",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
