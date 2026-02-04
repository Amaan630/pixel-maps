import { Platform } from 'react-native';
import {
  areActivitiesEnabled as nativeAreActivitiesEnabled,
  startActivity as nativeStartActivity,
  updateActivity as nativeUpdateActivity,
  endActivity as nativeEndActivity,
} from 'react-native-widget-extension';

export interface LiveActivityState {
  instruction: string;
  maneuverType: string;
  maneuverModifier: string;
  distanceToManeuver: number;
  remainingDistance: number;
  remainingDuration: number;
}

export interface LiveActivityConfig {
  destinationName: string;
  themeName: string;
}

class LiveActivityService {
  private activityId: string | null = null;
  private isEnabled: boolean = false;

  async checkAvailability(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const enabled = nativeAreActivitiesEnabled();
      this.isEnabled = enabled ?? false;
      return this.isEnabled;
    } catch {
      return false;
    }
  }

  async start(
    config: LiveActivityConfig,
    initialState: LiveActivityState
  ): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.isEnabled) {
      return false;
    }

    try {
      this.activityId = await nativeStartActivity(
        config.destinationName,
        config.themeName,
        initialState.instruction,
        initialState.maneuverType,
        initialState.maneuverModifier || '',
        Math.round(initialState.distanceToManeuver),
        Math.round(initialState.remainingDistance),
        Math.round(initialState.remainingDuration)
      );
      return this.activityId !== null;
    } catch {
      return false;
    }
  }

  async update(state: LiveActivityState): Promise<void> {
    if (Platform.OS !== 'ios' || !this.activityId) {
      return;
    }

    try {
      await nativeUpdateActivity(
        state.instruction,
        state.maneuverType,
        state.maneuverModifier || '',
        Math.round(state.distanceToManeuver),
        Math.round(state.remainingDistance),
        Math.round(state.remainingDuration)
      );
    } catch {
      // Silently fail
    }
  }

  async end(showArrivalState: boolean = true): Promise<void> {
    if (Platform.OS !== 'ios' || !this.activityId) {
      return;
    }

    try {
      await nativeEndActivity(showArrivalState);
      this.activityId = null;
    } catch {
      // Silently fail
    }
  }

  isActive(): boolean {
    return this.activityId !== null;
  }
}

export const liveActivityService = new LiveActivityService();
