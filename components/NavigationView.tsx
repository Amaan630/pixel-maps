import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { RouteStep } from '../services/routing';

interface Props {
  currentStep: RouteStep;
  nextStep: RouteStep | null;
  distanceToNextManeuver: number;
  totalDistance: number;
  totalDuration: number;
  onEndNavigation: () => void;
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
  distanceToNextManeuver,
  totalDistance,
  totalDuration,
  onEndNavigation,
}: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;

  return (
    <View style={styles.container}>
      {/* Current instruction - top banner */}
      <View style={styles.currentInstructionContainer}>
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
        </View>
      </View>

      {/* Bottom panel */}
      <View
        style={[
          styles.bottomPanel,
          { backgroundColor: colors.parchment, borderColor: colors.charcoal },
        ]}
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

        {/* Next instruction */}
        {nextStep && (
          <View style={[styles.nextInstruction, { backgroundColor: colors.building }]}>
            <Text style={[styles.nextLabel, { color: colors.darkerBrown }]}>NEXT</Text>
            <Text
              style={[
                styles.nextInstructionText,
                { color: colors.charcoal, fontFamily: fonts.display },
              ]}
              numberOfLines={1}
            >
              {nextStep.instruction}
            </Text>
          </View>
        )}

        {/* End navigation button */}
        <TouchableOpacity
          style={[
            styles.endButton,
            { backgroundColor: colors.charcoal, borderColor: colors.route },
          ]}
          onPress={onEndNavigation}
        >
          <Text
            style={[styles.endButtonText, { color: colors.parchment, fontFamily: fonts.display }]}
          >
            END NAVIGATION
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  currentInstructionContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
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
  },
  bottomPanel: {
    borderTopWidth: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  tripSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  nextInstruction: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextInstructionText: {
    fontSize: 14,
  },
  endButton: {
    marginHorizontal: 20,
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
