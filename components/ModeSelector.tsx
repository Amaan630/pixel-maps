import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TravelMode } from '../services/routing';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
}

export function ModeSelector({ mode, onModeChange }: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.parchment, borderColor: colors.charcoal },
          mode === 'walking' && { backgroundColor: colors.charcoal },
        ]}
        onPress={() => onModeChange('walking')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            { color: colors.charcoal, fontFamily: fonts.display },
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
        onPress={() => onModeChange('driving')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.text,
            { color: colors.charcoal, fontFamily: fonts.display },
            mode === 'driving' && { color: colors.parchment },
          ]}
        >
          Driving
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: 124,
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
  },
});
