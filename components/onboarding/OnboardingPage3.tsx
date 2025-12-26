import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ICON_SIZE = SCREEN_WIDTH * 0.5;

export function OnboardingPage3() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/app-icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Allow Location Access for Game Maps IRL</Text>
        <Text style={styles.subtitle}>
          Game Maps IRL uses your location to provide you with the best experience. Please allow
          location access to continue.
        </Text>
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
    paddingBottom: 180,
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: 48,
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
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
});
