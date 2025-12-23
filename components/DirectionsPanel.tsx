import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  // Filter out empty/arrival steps for cleaner display
  const displaySteps = steps.filter(
    (step) => step.instruction && step.distance > 0
  );

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.summaryContainer}>
          <Text style={styles.duration}>{formatDuration(totalDuration)}</Text>
          <Text style={styles.distance}>{formatDistance(totalDistance)}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
        {displaySteps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
              <Text style={styles.stepMeta}>
                {formatDistance(step.distance)} · {formatDuration(step.duration)}
              </Text>
            </View>
          </View>
        ))}

        {/* Final arrival step */}
        <View style={styles.step}>
          <View style={[styles.stepNumber, styles.arrivalNumber]}>
            <Text style={styles.stepNumberText}>!</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepInstruction}>Arrive at your destination</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Start Navigation Button */}
      <TouchableOpacity style={styles.startButton} onPress={onStartNavigation}>
        <Text style={styles.startButtonText}>START NAVIGATION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '45%',
    backgroundColor: '#dec29b',
    borderTopWidth: 3,
    borderColor: '#40423d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#40423d',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#c8b28d',
  },
  summaryContainer: {
    flex: 1,
  },
  duration: {
    fontSize: 24,
    fontFamily: 'ChineseRocks',
    color: '#40423d',
  },
  distance: {
    fontSize: 16,
    fontFamily: 'ChineseRocks',
    color: '#6a5a4a',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#40423d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#dec29b',
    fontWeight: '700',
    fontSize: 16,
  },
  stepsList: {
    paddingHorizontal: 20,
  },
  step: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#c8b28d',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#40423d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  arrivalNumber: {
    backgroundColor: '#ee0400',
  },
  stepNumberText: {
    color: '#dec29b',
    fontWeight: '700',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInstruction: {
    fontSize: 15,
    fontFamily: 'ChineseRocks',
    color: '#40423d',
    lineHeight: 20,
  },
  stepMeta: {
    fontSize: 13,
    color: '#8a7a5a',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
  startButton: {
    backgroundColor: '#ee0400',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40423d',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'ChineseRocks',
    letterSpacing: 1,
  },
});
