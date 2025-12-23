// Central theme registry - add new themes here

import * as western from './western';
import * as losAngeles from './los-angeles';

export type ThemeName = 'western' | 'los-angeles';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: typeof western.colors;
  fonts: typeof western.fonts;
  fontAssets: Record<string, number>;  // Font assets can vary by theme
  mapStyleJSON: string;
}

export const themes: Record<ThemeName, Theme> = {
  western: {
    name: 'western',
    displayName: 'Western',
    colors: western.colors,
    fonts: western.fonts,
    fontAssets: western.fontAssets,
    mapStyleJSON: western.mapStyleJSON,
  },
  'los-angeles': {
    name: 'los-angeles',
    displayName: 'Los Angeles',
    colors: losAngeles.colors,
    fonts: losAngeles.fonts,
    fontAssets: losAngeles.fontAssets,
    mapStyleJSON: losAngeles.mapStyleJSON,
  },
};

export const themeNames = Object.keys(themes) as ThemeName[];
export const defaultTheme: ThemeName = 'los-angeles';
