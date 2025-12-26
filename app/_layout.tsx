import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OnboardingCarousel } from '../components/onboarding/OnboardingCarousel';
import { PaywallScreen } from '../components/onboarding/PaywallScreen';
import { OnboardingProvider, useOnboarding } from '../contexts/OnboardingContext';
import { SubscriptionProvider, useSubscription } from '../contexts/SubscriptionContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { themes } from '../themes';

// Collect all font assets from all themes
const allFontAssets = Object.values(themes).reduce(
  (acc, theme) => ({ ...acc, ...theme.fontAssets }),
  {}
);

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, isLoading: themeLoading } = useTheme();
  const { hasSeenOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const { colors } = theme;

  if (themeLoading || onboardingLoading || subscriptionLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.parchment }]}>
        <ActivityIndicator size="large" color={colors.charcoal} />
      </View>
    );
  }

  // If subscribed, show main app
  if (isSubscribed) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar style={colors.parchment === '#1a1a1a' ? 'light' : 'dark'} />
      </>
    );
  }

  // Not subscribed - check if user has seen onboarding
  if (!hasSeenOnboarding) {
    // First time user - show onboarding (which will present paywall at the end)
    return (
      <>
        <OnboardingCarousel />
        <StatusBar style="light" />
      </>
    );
  }

  // Returning user without subscription - show paywall directly
  return (
    <>
      <PaywallScreen />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(allFontAssets);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <SubscriptionProvider>
          <OnboardingProvider>
            <RootLayoutContent />
          </OnboardingProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});
