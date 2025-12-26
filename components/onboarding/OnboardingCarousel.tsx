import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, Linking, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { OnboardingBackButton } from './OnboardingBackButton';
import { OnboardingButton } from './OnboardingButton';
import { OnboardingPage1 } from './OnboardingPage1';
import { OnboardingPage2 } from './OnboardingPage2';
import { OnboardingPage3 } from './OnboardingPage3';
import { OnboardingPagination } from './OnboardingPagination';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOTAL_PAGES = 3;
const LOCATION_PAGE = 2; // Page index where we request location permission (last page)

const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

export function OnboardingCarousel() {
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const { markOnboardingSeen } = useOnboarding();
  const { presentPaywall } = useSubscription();

  // Use shared value for the current page index (for gesture handler)
  const currentPageShared = useSharedValue(0);
  const translateX = useSharedValue(0);

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const clampedPage = Math.max(0, Math.min(page, TOTAL_PAGES - 1));
      currentPageShared.value = clampedPage;
      translateX.value = withTiming(-clampedPage * SCREEN_WIDTH, TIMING_CONFIG);
      updateCurrentPage(clampedPage);
    },
    [translateX, currentPageShared, updateCurrentPage]
  );

  const checkAndRequestLocationPermission = useCallback(async (): Promise<boolean> => {
    // First check current status
    const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

    if (currentStatus === 'granted') {
      return true;
    }

    // Request permission
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

    if (newStatus === 'granted') {
      return true;
    }

    // Permission denied - show alert
    Alert.alert(
      'Location Permission Required',
      'Game Maps IRL needs location access to work. Please enable location permissions in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );

    return false;
  }, []);

  const goToNextPage = useCallback(async () => {
    // If we're on the last page (location page), check permission and present paywall
    if (currentPage === LOCATION_PAGE) {
      const hasPermission = await checkAndRequestLocationPermission();
      if (!hasPermission) return;

      // Mark onboarding as seen and present paywall
      await markOnboardingSeen();
      presentPaywall();
      return;
    }

    if (currentPage >= TOTAL_PAGES - 1) return;
    goToPage(currentPage + 1);
  }, [currentPage, goToPage, checkAndRequestLocationPermission, markOnboardingSeen, presentPaywall]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Handle swipe gesture trying to go forward from location page (last page)
  const handleSwipeEnd = useCallback(async () => {
    // User is trying to swipe forward from the last page - check permission and present paywall
    const hasPermission = await checkAndRequestLocationPermission();
    if (!hasPermission) {
      // Snap back to location page
      translateX.value = withTiming(-LOCATION_PAGE * SCREEN_WIDTH, TIMING_CONFIG);
      return;
    }

    // Mark onboarding as seen and present paywall
    await markOnboardingSeen();
    presentPaywall();
  }, [translateX, checkAndRequestLocationPermission, markOnboardingSeen, presentPaywall]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const baseTranslate = -currentPageShared.value * SCREEN_WIDTH;
      const newTranslateX = baseTranslate + event.translationX;

      // Clamp within bounds (can't go before page 0 or past last page)
      const minTranslate = -(TOTAL_PAGES - 1) * SCREEN_WIDTH;
      translateX.value = Math.max(minTranslate, Math.min(0, newTranslateX));
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;

      let newPage = currentPageShared.value;

      if (Math.abs(velocity) > 500) {
        if (velocity > 0 && currentPageShared.value > 0) {
          newPage = currentPageShared.value - 1;
        } else if (velocity < 0 && currentPageShared.value < TOTAL_PAGES - 1) {
          newPage = currentPageShared.value + 1;
        }
      } else if (Math.abs(translation) > SCREEN_WIDTH * 0.3) {
        if (translation > 0 && currentPageShared.value > 0) {
          newPage = currentPageShared.value - 1;
        } else if (translation < 0 && currentPageShared.value < TOTAL_PAGES - 1) {
          newPage = currentPageShared.value + 1;
        }
      }

      // If on the last page and trying to swipe forward, check permission and present paywall
      if (currentPageShared.value === LOCATION_PAGE && translation < -SCREEN_WIDTH * 0.3) {
        runOnJS(handleSwipeEnd)();
      } else {
        currentPageShared.value = newPage;
        translateX.value = withTiming(-newPage * SCREEN_WIDTH, TIMING_CONFIG);
        runOnJS(updateCurrentPage)(newPage);
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Show controls on all pages (3 pages total now)
  const showBackButton = currentPage > 0;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.pagesContainer,
            { width: SCREEN_WIDTH * TOTAL_PAGES },
            animatedContainerStyle,
          ]}
        >
          <View style={styles.page}>
            <OnboardingPage1 />
          </View>
          <View style={styles.page}>
            <OnboardingPage2 />
          </View>
          <View style={styles.page}>
            <OnboardingPage3 />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 24 }]}>
        <OnboardingPagination totalPages={TOTAL_PAGES} currentPage={currentPage} />

        <View style={styles.buttonRow}>
          {showBackButton && <OnboardingBackButton onPress={goToPreviousPage} />}
          <View style={showBackButton ? styles.continueButtonWithBack : styles.continueButton}>
            <OnboardingButton onPress={goToNextPage} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pagesContainer: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continueButton: {
    flex: 1,
  },
  continueButtonWithBack: {
    flex: 1,
  },
});
