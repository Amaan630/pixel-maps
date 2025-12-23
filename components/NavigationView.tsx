import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  return (
    <View style={styles.container}>
      {/* Current instruction - top banner */}
      <View style={styles.currentInstructionContainer}>
        <View style={styles.currentInstruction}>
          <Text style={styles.currentInstructionText} numberOfLines={2}>
            {currentStep.instruction}
          </Text>
          <Text style={styles.distanceToManeuver}>
            {formatDistance(distanceToNextManeuver)}
          </Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {/* Trip summary */}
        <View style={styles.tripSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
            <Text style={styles.summaryLabel}>remaining</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(totalDistance)}</Text>
            <Text style={styles.summaryLabel}>to go</Text>
          </View>
        </View>

        {/* Next instruction */}
        {nextStep && (
          <View style={styles.nextInstruction}>
            <Text style={styles.nextLabel}>NEXT</Text>
            <Text style={styles.nextInstructionText} numberOfLines={1}>
              {nextStep.instruction}
            </Text>
          </View>
        )}

        {/* End navigation button */}
        <TouchableOpacity style={styles.endButton} onPress={onEndNavigation}>
          <Text style={styles.endButtonText}>END NAVIGATION</Text>
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
    backgroundColor: '#40423d',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#ee0400',
  },
  currentInstructionText: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'ChineseRocks',
    color: '#dec29b',
    marginRight: 16,
  },
  distanceToManeuver: {
    fontSize: 28,
    fontFamily: 'ChineseRocks',
    color: '#ee0400',
  },
  bottomPanel: {
    backgroundColor: '#dec29b',
    borderTopWidth: 3,
    borderColor: '#40423d',
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
    fontFamily: 'ChineseRocks',
    color: '#40423d',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6a5a4a',
    marginTop: 2,
  },
  summaryDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#c8b28d',
  },
  nextInstruction: {
    backgroundColor: '#c8b28d',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  nextLabel: {
    fontSize: 10,
    color: '#6a5a4a',
    fontWeight: '600',
    marginBottom: 4,
  },
  nextInstructionText: {
    fontSize: 14,
    fontFamily: 'ChineseRocks',
    color: '#40423d',
  },
  endButton: {
    backgroundColor: '#40423d',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ee0400',
  },
  endButtonText: {
    color: '#dec29b',
    fontSize: 16,
    fontFamily: 'ChineseRocks',
    letterSpacing: 1,
  },
});
