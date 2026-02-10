import { ModeService } from './types';
import { createMiniMapModeService } from './minimap';
import { createDiscoveryModeService } from './discovery';

// Called from MapScreen during initialization so the user can access modes without delay.
export function getModeRegistry(): Record<string, ModeService> {
  return {
    minimap: createMiniMapModeService(),
    discovery: createDiscoveryModeService(),
  };
}
