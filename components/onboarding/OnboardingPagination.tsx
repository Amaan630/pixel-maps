import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface Props {
  totalPages: number;
  currentPage: number;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 28 : 8, SPRING_CONFIG),
    opacity: withSpring(isActive ? 1 : 0.4, SPRING_CONFIG),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function OnboardingPagination({ totalPages, currentPage }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <Dot key={index} isActive={index === currentPage} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
