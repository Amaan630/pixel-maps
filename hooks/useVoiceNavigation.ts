import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';
import { RouteStep } from '../services/routing';

interface UseVoiceNavigationProps {
  isNavigating: boolean;
  currentStepIndex: number;
  currentStep: RouteStep | null;
  distanceToNextManeuver: number;
  isMuted: boolean;
}

const PRE_ANNOUNCE_DISTANCE = 200; // meters
const PRE_ANNOUNCE_THRESHOLD = 50; // Only pre-announce if distance drops below this from above

export function useVoiceNavigation({
  isNavigating,
  currentStepIndex,
  currentStep,
  distanceToNextManeuver,
  isMuted,
}: UseVoiceNavigationProps) {
  const hasPreAnnounced = useRef(false);
  const lastStepIndex = useRef(-1);
  const wasNavigating = useRef(false);

  useEffect(() => {
    if (isMuted) return;

    // Navigation just started
    if (isNavigating && !wasNavigating.current) {
      wasNavigating.current = true;
      lastStepIndex.current = currentStepIndex;
      hasPreAnnounced.current = false;

      if (currentStep) {
        speak(currentStep.instruction);
      }
      return;
    }

    // Navigation ended
    if (!isNavigating && wasNavigating.current) {
      wasNavigating.current = false;
      lastStepIndex.current = -1;
      hasPreAnnounced.current = false;
      Speech.stop();
      return;
    }

    if (!isNavigating || !currentStep) return;

    // Step changed - speak new instruction
    if (currentStepIndex !== lastStepIndex.current) {
      lastStepIndex.current = currentStepIndex;
      hasPreAnnounced.current = false;

      // Check if this is the arrival step
      if (currentStep.maneuver.type === 'arrive') {
        speak('You have arrived at your destination');
      } else {
        speak(currentStep.instruction);
      }
      return;
    }

    // Pre-announce upcoming turn at ~200m
    if (
      !hasPreAnnounced.current &&
      distanceToNextManeuver <= PRE_ANNOUNCE_DISTANCE &&
      distanceToNextManeuver > 30 // Don't pre-announce if we're about to advance anyway
    ) {
      hasPreAnnounced.current = true;
      const distanceText = formatDistance(distanceToNextManeuver);
      speak(`In ${distanceText}, ${currentStep.instruction.toLowerCase()}`);
    }
  }, [isNavigating, currentStepIndex, currentStep, distanceToNextManeuver, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
}

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.9,
    pitch: 1.0,
  });
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} kilometers`;
  }
  // Round to nearest 50m for cleaner announcements
  const rounded = Math.round(meters / 50) * 50;
  return `${rounded} meters`;
}
