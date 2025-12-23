import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeName, themeNames, themes } from '../themes';

export function ThemeToggle() {
  const { theme, themeName, setTheme } = useTheme();
  const { colors } = theme;

  // Cycle to next theme
  const handlePress = () => {
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  };

  // Get display name of current theme
  const displayName = themes[themeName].displayName;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.parchment, borderColor: colors.charcoal },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { color: colors.charcoal }]}>🎨</Text>
      <Text style={[styles.text, { color: colors.charcoal }]}>{displayName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 160,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    zIndex: 100,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
