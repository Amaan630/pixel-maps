# Modes

This folder centralizes all map mode behavior so new developers can understand, extend, and modify modes quickly.

A **mode** is a self-contained unit that controls:
- map behavior (camera, zoom, heading)
- tracking (location + heading subscriptions)
- WebView messaging
- optional overlays (like the minimap mask)

The host (MapScreen) only dispatches lifecycle events. All logic lives inside the mode.

## Quick start (10-minute understanding)

Read these files in order:

1. `modes/types.ts`
   - Defines the mode contract.
2. `modes/minimap/index.ts`
   - The single entry point for minimap behavior.
3. `modes/minimap/tracking.ts`
   - Heading + location subscriptions.
4. `modes/minimap/webview.ts`
   - Centralized WebView message payloads.
5. `modes/minimap/overlay.tsx`
   - The visual mask and touch logic.

If you can explain those, you can change minimap behavior safely.

Discovery mode follows the same layout under `modes/discovery/` with tile-based fog logic.

## Lifecycle

Every mode has 3 core steps:

1. **activate**
   - user enables the mode
   - map behavior changes immediately
   - tracking starts

2. **sync**
   - called on WebView reload or theme change
   - re-applies state so the user doesn’t see resets

3. **deactivate**
   - user disables the mode
   - tracking stops
   - map returns to normal

## Contract (high-level)

All modes implement:
- `activate(ctx)`
- `deactivate(ctx)`
- `sync(ctx)`

Optional hooks are allowed for flexibility (no strict forcing):
- `onThemeChange(ctx)`
- `onWebViewLoad(ctx)`
- `getOverlayProps(ctx)`

## Adding a new mode

1. Create a new folder under `modes/<mode-name>/`.
2. Add at least:
   - `index.ts` (entry point)
   - `config.ts` (constants)
   - `tracking.ts` (if you need sensors)
   - `webview.ts` (message payloads)
   - `overlay.tsx` (if you need UI)
3. Register it in `modes/index.ts`.

## Map message names

All WebView message names live in `modes/messages.ts`. This keeps string usage centralized so adding new message types stays consistent.

## UX intent (why this exists)

Modes are centralized to reduce cognitive load:
- New developers should find all behavior in one folder.
- No scattered constants.
- No duplicated message strings.
- Minimal coordination overhead when new modes are added.
