import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
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

// Cached best voice to avoid repeated lookups
let cachedVoice: Speech.Voice | null = null;

/**
 * Finds the best available voice on the device.
 * Prioritizes premium/enhanced voices on iOS, and quality voices on Android.
 */
async function findBestVoice(): Promise<Speech.Voice | null> {
  if (cachedVoice) return cachedVoice;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const englishVoices = voices.filter(
      (v) => v.language.startsWith('en') && v.language.includes('US')
    );

    if (englishVoices.length === 0) {
      // Fallback to any English voice
      const anyEnglish = voices.filter((v) => v.language.startsWith('en'));
      if (anyEnglish.length > 0) {
        cachedVoice = anyEnglish[0];
        return cachedVoice;
      }
      return null;
    }

    if (Platform.OS === 'ios') {
      // iOS voice priority: premium > enhanced > compact
      // Premium voices have "premium" in identifier
      // Enhanced voices have "enhanced" or are higher quality
      const premium = englishVoices.find((v) =>
        v.identifier.toLowerCase().includes('premium')
      );
      if (premium) {
        cachedVoice = premium;
        return cachedVoice;
      }

      const enhanced = englishVoices.find((v) =>
        v.identifier.toLowerCase().includes('enhanced')
      );
      if (enhanced) {
        cachedVoice = enhanced;
        return cachedVoice;
      }

      // Prefer specific high-quality voices by name
      const preferredNames = ['samantha', 'ava', 'allison', 'susan'];
      for (const name of preferredNames) {
        const voice = englishVoices.find((v) =>
          v.identifier.toLowerCase().includes(name)
        );
        if (voice) {
          cachedVoice = voice;
          return cachedVoice;
        }
      }
    } else if (Platform.OS === 'android') {
      // Android: prefer Google voices, especially neural/wavenet if available
      const googleVoice = englishVoices.find(
        (v) =>
          v.identifier.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('google')
      );
      if (googleVoice) {
        cachedVoice = googleVoice;
        return cachedVoice;
      }
    }

    // Fallback to first en-US voice
    cachedVoice = englishVoices[0];
    return cachedVoice;
  } catch (error) {
    console.warn('Failed to get available voices:', error);
    return null;
  }
}

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
  const [selectedVoice, setSelectedVoice] = useState<Speech.Voice | null>(null);

  // Initialize best voice on mount
  useEffect(() => {
    findBestVoice().then(setSelectedVoice);
  }, []);

  useEffect(() => {
    if (isMuted) return;

    // Navigation just started
    if (isNavigating && !wasNavigating.current) {
      wasNavigating.current = true;
      lastStepIndex.current = currentStepIndex;
      hasPreAnnounced.current = false;

      if (currentStep) {
        speak(currentStep.instruction, selectedVoice);
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
        speak('You have arrived at your waypoint', selectedVoice);
      } else {
        speak(currentStep.instruction, selectedVoice);
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
      speak(`In ${distanceText}, ${currentStep.instruction.toLowerCase()}`, selectedVoice);
    }
  }, [isNavigating, currentStepIndex, currentStep, distanceToNextManeuver, isMuted, selectedVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);
}

function speak(text: string, voice: Speech.Voice | null) {
  Speech.stop();
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.95,
    pitch: 1.0,
    // Use the selected high-quality voice if available
    voice: voice?.identifier,
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
