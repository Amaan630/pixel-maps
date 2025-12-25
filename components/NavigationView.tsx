import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { RouteStep } from '../services/routing';

interface Props {
  currentStep: RouteStep;
  nextStep: RouteStep | null;
  remainingSteps: RouteStep[];
  distanceToNextManeuver: number;
  totalDistance: number;
  totalDuration: number;
  onEndNavigation: () => void;
  voiceMuted: boolean;
  onToggleVoice: () => void;
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

export function NavigationView({
  currentStep,
  nextStep,
  remainingSteps,
  distanceToNextManeuver,
  totalDistance,
  totalDuration,
  onEndNavigation,
  voiceMuted,
  onToggleVoice,
}: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: collapsed (summary + next), expanded (full remaining route)
  const snapPoints = useMemo(() => ['28%', '70%'], []);

  // Filter display steps (skip first since it's current)
  const displaySteps = remainingSteps.filter((step) => step.instruction && step.distance > 0);

  const handleEndNavigation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEndNavigation();
  }, [onEndNavigation]);

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
            style={[
              styles.endButton,
              { backgroundColor: colors.charcoal, borderColor: colors.route },
            ]}
            onPress={handleEndNavigation}
          >
            <Text
              style={[styles.endButtonText, { color: colors.parchment, fontFamily: fonts.display }]}
            >
              END NAVIGATION
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [colors, fonts, handleEndNavigation, insets.bottom]
  );

  return (
    <View style={styles.container}>
      {/* Current instruction - top banner */}
      <Animated.View
        entering={SlideInDown.duration(300).springify()}
        style={[styles.currentInstructionContainer, { paddingTop: insets.top + 10 }]}
      >
        <View
          style={[
            styles.currentInstruction,
            { backgroundColor: colors.charcoal, borderColor: colors.route },
          ]}
        >
          <Text
            style={[
              styles.currentInstructionText,
              { color: colors.parchment, fontFamily: fonts.display },
            ]}
            numberOfLines={2}
          >
            {currentStep.instruction}
          </Text>
          <Text
            style={[
              styles.distanceToManeuver,
              { color: colors.route, fontFamily: fonts.display },
            ]}
          >
            {formatDistance(distanceToNextManeuver)}
          </Text>
          <TouchableOpacity
            style={[styles.muteButton, { backgroundColor: colors.parchment }]}
            onPress={onToggleVoice}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={voiceMuted ? 'volume-mute' : 'volume-high'}
              size={22}
              color={colors.charcoal}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom panel - expandable */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        style={styles.sheetShadow}
        backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.parchment }]}
        handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.charcoal }]}
        footerComponent={renderFooter}
      >
        {/* Trip summary */}
        <View style={styles.tripSummary}>
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryValue, { color: colors.charcoal, fontFamily: fonts.display }]}
            >
              {formatDuration(totalDuration)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.darkerBrown }]}>remaining</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.building }]} />
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryValue, { color: colors.charcoal, fontFamily: fonts.display }]}
            >
              {formatDistance(totalDistance)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.darkerBrown }]}>to go</Text>
          </View>
        </View>

        {/* Scrollable remaining steps */}
        <BottomSheetScrollView
          style={styles.stepsList}
          contentContainerStyle={styles.stepsListContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Next instruction (highlighted) */}
          {nextStep && (
            <View style={[styles.nextInstruction, { backgroundColor: colors.building }]}>
              <Text style={[styles.nextLabel, { color: colors.darkerBrown }]}>NEXT</Text>
              <Text
                style={[
                  styles.nextInstructionText,
                  { color: colors.charcoal, fontFamily: fonts.display },
                ]}
                numberOfLines={2}
              >
                {nextStep.instruction}
              </Text>
            </View>
          )}

          {/* Remaining steps */}
          {displaySteps.slice(1).map((step, index) => (
            <View key={index} style={[styles.step, { borderBottomColor: colors.building }]}>
              <View style={[styles.stepNumber, { backgroundColor: colors.charcoal }]}>
                <Text style={[styles.stepNumberText, { color: colors.parchment }]}>
                  {index + 2}
                </Text>
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
                  {formatDistance(step.distance)}
                </Text>
              </View>
            </View>
          ))}

          {/* Arrival */}
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
                Arrive at destination
              </Text>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  currentInstructionContainer: {
    paddingHorizontal: 16,
    pointerEvents: 'auto',
  },
  currentInstruction: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
  },
  currentInstructionText: {
    flex: 1,
    fontSize: 22,
    marginRight: 16,
  },
  distanceToManeuver: {
    fontSize: 28,
    marginRight: 12,
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tripSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  summaryValue: {
    fontSize: 24,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    width: 2,
    height: 40,
  },
  stepsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepsListContent: {
    paddingBottom: 100, // Space for sticky footer
  },
  nextInstruction: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextInstructionText: {
    fontSize: 14,
  },
  step: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontWeight: '700',
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInstruction: {
    fontSize: 14,
    lineHeight: 18,
  },
  stepMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  endButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  endButtonText: {
    fontSize: 20,
    letterSpacing: 1,
  },
});
