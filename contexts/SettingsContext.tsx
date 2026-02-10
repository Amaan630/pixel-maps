import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'pixel-maps-settings';

interface Settings {
  activeMode: 'minimap' | 'discovery' | null;
}

interface SettingsContextType {
  activeMode: 'minimap' | 'discovery' | null;
  setActiveMode: (mode: 'minimap' | 'discovery' | null) => void;
  settingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  activeMode: null,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const migrated =
            parsed && typeof parsed === 'object' && 'miniMapMode' in parsed
              ? { activeMode: parsed.miniMapMode ? 'minimap' : null }
              : parsed;
          setSettings({ ...defaultSettings, ...migrated });
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
      setIsLoading(false);
    })();
  }, []);

  // Save settings helper
  const saveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const setActiveMode = (mode: 'minimap' | 'discovery' | null) => {
    saveSettings({ ...settings, activeMode: mode });
  };

  return (
    <SettingsContext.Provider
      value={{
        activeMode: settings.activeMode,
        setActiveMode,
        settingsVisible,
        setSettingsVisible,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
