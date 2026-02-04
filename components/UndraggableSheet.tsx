import { X } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UndraggableSheet({ visible, onClose, children }: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal visible={true} transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Overlay with fade */}
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
          onPress={onClose}
        />

        {/* Sheet with slide + fade */}
        <Animated.View
          entering={SlideInDown.duration(250).damping(20).stiffness(200)}
          exiting={SlideOutDown.duration(150)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.parchment,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Touch interceptor to prevent closing when tapping sheet */}
          <Pressable>
            {/* Close button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.building }]}
              onPress={onClose}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <X size={20} color={colors.charcoal} />
            </TouchableOpacity>

            {children}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
