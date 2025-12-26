import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

const ICON_SIZE = 56;

const icons: ImageSourcePropType[] = [
  // Row 1
  require('../../assets/minimap-icons/gta-san-andreas/radar_gym.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_barbers.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_CJ.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_cash.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_hostpital.png'),
  // Row 2
  require('../../assets/minimap-icons/gta-san-andreas/radar_impound.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_saveGame.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_runway.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_race.png'),
  require('../../assets/minimap-icons/gta-san-andreas/radar_police.png'),
];

function IconBubble({ source }: { source: ImageSourcePropType }) {
  return (
    <View style={styles.iconBubble}>
      <Image source={source} style={styles.icon} resizeMode="contain" />
    </View>
  );
}

export function OnboardingPage2() {
  return (
    <View style={styles.container}>
      <View style={styles.iconsGrid}>
        {icons.map((icon, index) => (
          <IconBubble key={index} source={icon} />
        ))}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Map Icons of Your Favorite Game</Text>
        <Text style={styles.subtitle}>
          Apply to your real life map with the icons of your favorite game!
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
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
    maxWidth: (ICON_SIZE + 16) * 5,
  },
  iconBubble: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    width: '100%',
    height: '100%',
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
