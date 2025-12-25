import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { XIcon } from 'lucide-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { RouteStep } from '../services/routing';

interface Props {
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
  onClose: () => void;
  onStartNavigation: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}

export function DirectionsPanel({
  steps,
  totalDistance,
  totalDuration,
  onClose,
  onStartNavigation,
}: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: 40% (compact), 70% (default), 95% (expanded)
  const snapPoints = useMemo(() => ['40%', '70%', '95%'], []);

  // Handle sheet close
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Filter out empty/arrival steps for cleaner display
  const displaySteps = steps.filter((step) => step.instruction && step.distance > 0);

  const handleStartNavigation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStartNavigation();
  };

  // Sticky footer component
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View
          style={[
            styles.buttonContainer,
            {
              backgroundColor: colors.parchment,
              borderTopColor: colors.building,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.route, borderColor: colors.charcoal }]}
            onPress={handleStartNavigation}
          >
            <Text style={[styles.startButtonText, { fontFamily: fonts.display }]}>
              START NAVIGATION
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [colors, fonts, handleStartNavigation, insets.bottom]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose
      style={styles.sheetShadow}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.parchment }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.charcoal }]}
      footerComponent={renderFooter}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.building }]}>
        <View style={styles.summaryContainer}>
          <Text style={[styles.duration, { color: colors.charcoal, fontFamily: fonts.display }]}>
            {formatDuration(totalDuration)}
          </Text>
          <Text style={[styles.distance, { color: colors.darkerBrown, fontFamily: fonts.display }]}>
            {formatDistance(totalDistance)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.charcoal }]}
          onPress={onClose}
        >
          <XIcon width={24} height={24} strokeWidth={2} stroke={colors.parchment} />
        </TouchableOpacity>
      </View>

      {/* Scrollable steps list */}
      <BottomSheetScrollView
        style={styles.stepsList}
        contentContainerStyle={styles.stepsListContent}
        showsVerticalScrollIndicator={false}
      >
        {displaySteps.map((step, index) => (
          <View key={index} style={[styles.step, { borderBottomColor: colors.building }]}>
            <View style={[styles.stepNumber, { backgroundColor: colors.charcoal }]}>
              <Text style={[styles.stepNumberText, { color: colors.parchment }]}>{index + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepInstruction,
                  { color: colors.charcoal, fontFamily: fonts.display },
                ]}
              >
                {step.instruction}
              </Text>
              <Text style={[styles.stepMeta, { color: colors.mutedBrown }]}>
                {formatDistance(step.distance)} · {formatDuration(step.duration)}
              </Text>
            </View>
          </View>
        ))}

        {/* Final arrival step */}
        <View style={[styles.step, { borderBottomWidth: 0 }]}>
          <View style={[styles.stepNumber, { backgroundColor: colors.route }]}>
            <Text style={[styles.stepNumberText, { color: colors.parchment }]}>!</Text>
          </View>
          <View style={styles.stepContent}>
            <Text
              style={[
                styles.stepInstruction,
                { color: colors.charcoal, fontFamily: fonts.display },
              ]}
            >
              Arrive at your waypoint
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  summaryContainer: {
    flex: 1,
  },
  duration: {
    fontSize: 24,
  },
  distance: {
    fontSize: 20,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepsListContent: {
    paddingBottom: 100, // Space for sticky footer
  },
  step: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontWeight: '700',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInstruction: {
    fontSize: 15,
    lineHeight: 20,
  },
  stepMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 1,
  },
});
