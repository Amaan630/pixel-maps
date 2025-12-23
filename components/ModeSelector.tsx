import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TravelMode } from '../services/routing';

interface Props {
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
}

export function ModeSelector({ mode, onModeChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'walking' && styles.active]}
        onPress={() => onModeChange('walking')}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, mode === 'walking' && styles.activeText]}>
          Walking
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'driving' && styles.active]}
        onPress={() => onModeChange('driving')}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, mode === 'driving' && styles.activeText]}>
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
    backgroundColor: '#dec29b',
    borderWidth: 2,
    borderColor: '#40423d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 24,
  },
  active: {
    backgroundColor: '#40423d',
  },
  text: {
    color: '#40423d',
    fontFamily: 'ChineseRocks',
    fontSize: 14,
  },
  activeText: {
    color: '#dec29b',
  },
});
