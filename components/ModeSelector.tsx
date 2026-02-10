import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme, useUiFont } from '../contexts/ThemeContext';
import { TravelMode } from '../services/routing';

interface Props {
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
}

export function ModeSelector({ mode, onModeChange }: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const uiFont = useUiFont();

  const handleModeChange = (newMode: TravelMode) => {
    if (newMode !== mode) {
      Haptics.selectionAsync();
      onModeChange(newMode);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.parchment, borderColor: colors.charcoal },
          mode === 'walking' && { backgroundColor: colors.charcoal },
        ]}
        onPress={() => handleModeChange('walking')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            { color: colors.charcoal, fontFamily: uiFont },
            mode === 'walking' && { color: colors.parchment },
          ]}
        >
          Walking
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.parchment, borderColor: colors.charcoal },
          mode === 'driving' && { backgroundColor: colors.charcoal },
        ]}
        onPress={() => handleModeChange('driving')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            { color: colors.charcoal, fontFamily: uiFont },
            mode === 'driving' && { color: colors.parchment },
          ]}
        >
          Driving
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: 160,
    left: 16,
    zIndex: 99,
  },
  button: {
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 24,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
