import { ModeContext, ModeService } from './types';

export type ModeRegistry = Record<string, ModeService>;

export type ModeManager = {
  setActiveMode: (modeId: string | null, ctx: ModeContext) => void;
  syncActiveMode: (ctx: ModeContext) => void;
  notifyThemeChange: (ctx: ModeContext) => void;
  notifyWebViewLoad: (ctx: ModeContext) => void;
  getActiveModeId: () => string | null;
};

// Called from MapScreen so the user can switch modes without mixed state or conflicts.
export function createModeManager(registry: ModeRegistry): ModeManager {
  let activeModeId: string | null = null;

  // Called when the user toggles a mode so only one mode is active at a time.
  const setActiveMode = (modeId: string | null, ctx: ModeContext) => {
    if (activeModeId === modeId) {
      if (modeId) {
        registry[modeId]?.sync(ctx);
      }
      return;
    }

    if (activeModeId) {
      registry[activeModeId]?.deactivate(ctx);
    }

    activeModeId = modeId;

    if (activeModeId) {
      registry[activeModeId]?.activate(ctx);
    }
  };

  // Called after permission changes so the user’s active mode can resume tracking.
  const syncActiveMode = (ctx: ModeContext) => {
    if (!activeModeId) return;
    registry[activeModeId]?.sync(ctx);
  };

  // Called on theme changes so the user’s active mode immediately reflects the new look.
  const notifyThemeChange = (ctx: ModeContext) => {
    if (!activeModeId) return;
    registry[activeModeId]?.onThemeChange?.(ctx);
  };

  // Called on WebView reload so the user doesn’t lose their active mode state.
  const notifyWebViewLoad = (ctx: ModeContext) => {
    if (!activeModeId) return;
    registry[activeModeId]?.onWebViewLoad?.(ctx);
  };

  const getActiveModeId = () => activeModeId;

  return {
    setActiveMode,
    syncActiveMode,
    notifyThemeChange,
    notifyWebViewLoad,
    getActiveModeId,
  };
}
