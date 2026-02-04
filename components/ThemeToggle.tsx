import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleHelp, Settings } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeName, themeNames, themes } from '../themes';
import { HelpSheet } from './HelpSheet';

export function ThemeToggle() {
  const { theme, themeName, setTheme } = useTheme();
  const { setSettingsVisible } = useSettings();
  const { fonts } = theme;
  const [expanded, setExpanded] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const handleOpenSettings = () => {
    Haptics.selectionAsync();
    setSettingsVisible(true);
  };

  const displayName = themes[themeName].displayName.toUpperCase();

  const handleSelectTheme = (newTheme: ThemeName) => {
    Haptics.selectionAsync();
    setTheme(newTheme);
    setExpanded(false);
  };

  return (
    <>
      {/* Header bar with vignette */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.gradient}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => setExpanded(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.themeTitle, { fontFamily: fonts.display }]}>
              {displayName}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
          <View style={styles.iconButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleOpenSettings}
              activeOpacity={0.8}
            >
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setHelpVisible(true)}
              activeOpacity={0.8}
            >
              <CircleHelp size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <HelpSheet visible={helpVisible} onClose={() => setHelpVisible(false)} />

      {/* Expanded overlay modal */}
      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setExpanded(false)}>
          <View style={styles.optionsContainer}>
            {themeNames.map((themeKey) => {
              const themeOption = themes[themeKey];
              const isSelected = themeName === themeKey;
              // Use each theme's own font for its option
              const optionFont = themeOption.fonts.display;
              return (
                <TouchableOpacity
                  key={themeKey}
                  style={styles.optionRow}
                  onPress={() => handleSelectTheme(themeKey)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { fontFamily: optionFont },
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {themeOption.displayName.toUpperCase()}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  themeTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  chevron: {
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  optionText: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 16,
  },
});
