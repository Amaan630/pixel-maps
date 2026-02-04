import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { RouteStep } from '../services/routing';
import {
  liveActivityService,
  LiveActivityState,
} from '../services/liveActivity';

interface UseLiveActivityProps {
  isNavigating: boolean;
  currentStep: RouteStep | null;
  distanceToNextManeuver: number;
  remainingDistance: number;
  remainingDuration: number;
  destinationName: string;
  themeName: string;
}

export function useLiveActivity({
  isNavigating,
  currentStep,
  distanceToNextManeuver,
  remainingDistance,
  remainingDuration,
  destinationName,
  themeName,
}: UseLiveActivityProps) {
  const isActivityStarted = useRef(false);
  const lastUpdateTime = useRef(0);
  const wasNavigating = useRef(false);
  const UPDATE_THROTTLE_MS = 1000; // Throttle updates to once per second

  // Check availability on mount
  useEffect(() => {
    if (Platform.OS === 'ios') {
      liveActivityService.checkAvailability();
    }
  }, []);

  // Handle navigation state changes
  useEffect(() => {
    // Navigation just started
    if (isNavigating && !wasNavigating.current && currentStep) {
      wasNavigating.current = true;

      const startActivity = async () => {
        const isAvailable = await liveActivityService.checkAvailability();
        if (!isAvailable) {
          return;
        }

        const state: LiveActivityState = {
          instruction: currentStep.instruction,
          maneuverType: currentStep.maneuver.type,
          maneuverModifier: currentStep.maneuver.modifier || '',
          distanceToManeuver: distanceToNextManeuver,
          remainingDistance,
          remainingDuration,
        };

        const success = await liveActivityService.start(
          { destinationName, themeName },
          state
        );

        if (success) {
          isActivityStarted.current = true;
        }
      };

      startActivity();
      return;
    }

    // Navigation ended
    if (!isNavigating && wasNavigating.current) {
      wasNavigating.current = false;

      if (isActivityStarted.current) {
        const isArrival = currentStep?.maneuver.type === 'arrive';
        liveActivityService.end(isArrival);
        isActivityStarted.current = false;
      }
      return;
    }

    // Update during navigation
    if (isNavigating && isActivityStarted.current && currentStep) {
      // Throttle updates
      const now = Date.now();
      if (now - lastUpdateTime.current < UPDATE_THROTTLE_MS) {
        return;
      }
      lastUpdateTime.current = now;

      const state: LiveActivityState = {
        instruction: currentStep.instruction,
        maneuverType: currentStep.maneuver.type,
        maneuverModifier: currentStep.maneuver.modifier || '',
        distanceToManeuver: distanceToNextManeuver,
        remainingDistance,
        remainingDuration,
      };

      liveActivityService.update(state);
    }
  }, [
    isNavigating,
    currentStep,
    distanceToNextManeuver,
    remainingDistance,
    remainingDuration,
    destinationName,
    themeName,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActivityStarted.current) {
        liveActivityService.end(false);
        isActivityStarted.current = false;
      }
    };
  }, []);
}
