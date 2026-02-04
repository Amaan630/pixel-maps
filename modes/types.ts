import { RefObject } from 'react';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { ThemeName } from '../themes';

export type ModeContext = {
  webViewRef: RefObject<WebView>;
  getThemeName: () => ThemeName;
  getHasLocationPermission: () => boolean;
  getLocation: () => Location.LocationObject | null;
  getInitialLocation: () => { lat: number; lng: number } | null;
  getHeading: () => number | null;
  setHeading: (heading: number | null) => void;
};

export type ModeService = {
  id: string;
  activate: (ctx: ModeContext) => void;
  deactivate: (ctx: ModeContext) => void;
  sync: (ctx: ModeContext) => void;
  onThemeChange?: (ctx: ModeContext) => void;
  onWebViewLoad?: (ctx: ModeContext) => void;
};
