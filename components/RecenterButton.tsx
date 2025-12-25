import { MousePointer2Icon } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onPress: () => void;
}

export function RecenterButton({ onPress }: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.parchment, borderColor: colors.charcoal },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MousePointer2Icon width={24} height={24} strokeWidth={2} stroke={colors.charcoal} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  icon: {
    fontSize: 24,
    marginBottom: -1,
    marginRight: -1,
  },
});
