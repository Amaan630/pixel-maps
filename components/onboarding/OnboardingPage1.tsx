import * as WebBrowser from 'expo-web-browser';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREENSHOT_WIDTH = SCREEN_WIDTH * 0.55;
const SCREENSHOT_HEIGHT = SCREENSHOT_WIDTH * 1.8;

const PRIVACY_URL = 'https://syntak.co/pixel-maps/privacy-policy';
const TERMS_URL = 'https://syntak.co/pixel-maps/terms-and-conditions';

export function OnboardingPage1() {
  return (
    <View style={styles.container}>
      <View style={styles.screenshotsContainer}>
        {/* Left screenshot (rotated left) */}
        <Image
          source={require('../../assets/onboarding/screenshots/IMG_0228.png')}
          style={[styles.screenshot, styles.screenshotLeft]}
          resizeMode="cover"
        />

        {/* Center screenshot (on top) */}
        <Image
          source={require('../../assets/onboarding/screenshots/IMG_0229.png')}
          style={[styles.screenshot, styles.screenshotCenter]}
          resizeMode="cover"
        />

        {/* Right screenshot (rotated right) */}
        <Image
          source={require('../../assets/onboarding/screenshots/IMG_0227.png')}
          style={[styles.screenshot, styles.screenshotRight]}
          resizeMode="cover"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Favorite Game Maps in Real Life</Text>
        <Text style={styles.subtitle}>
          Find your favorite game and quickly apply to your real life map!
        </Text>
      </View>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.linkSeparator}>|</Text>
        <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
          <Text style={styles.link}>Terms & Conditions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 180, // Space for bottom controls
  },
  screenshotsContainer: {
    width: SCREEN_WIDTH,
    height: SCREENSHOT_HEIGHT + 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  screenshot: {
    position: 'absolute',
    width: SCREENSHOT_WIDTH,
    height: SCREENSHOT_HEIGHT,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  screenshotLeft: {
    transform: [{ rotate: '-8deg' }, { translateX: -60 }],
    zIndex: 1,
  },
  screenshotCenter: {
    zIndex: 3,
  },
  screenshotRight: {
    transform: [{ rotate: '8deg' }, { translateX: 60 }],
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  link: {
    fontSize: 13,
    color: '#999999',
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 13,
    color: '#999999',
    marginHorizontal: 12,
  },
});
