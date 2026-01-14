import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { FileText, Mail, Shield, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const SHEET_HEIGHT = 280;

const PRIVACY_URL = 'https://syntak.co/pixel-maps/privacy-policy';
const TERMS_URL = 'https://syntak.co/pixel-maps/terms-and-conditions';
const SUPPORT_EMAIL = 'help@syntak.co';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HelpSheet({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { colors, fonts } = theme;
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = SHEET_HEIGHT;
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handlePrivacyPolicy = async () => {
    Haptics.selectionAsync();
    await WebBrowser.openBrowserAsync(PRIVACY_URL);
  };

  const handleTerms = async () => {
    Haptics.selectionAsync();
    await WebBrowser.openBrowserAsync(TERMS_URL);
  };

  const handleContactSupport = async () => {
    Haptics.selectionAsync();
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.parchment, paddingBottom: insets.bottom + 16 },
            animatedSheetStyle,
          ]}
        >
          <Pressable>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.building }]}
              onPress={onClose}
            >
              <X size={20} color={colors.charcoal} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.charcoal, fontFamily: fonts.display }]}>
              Help & Info
            </Text>

            <View style={styles.linksContainer}>
              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.building }]}
                onPress={handlePrivacyPolicy}
              >
                <Shield size={20} color={colors.mutedBrown} />
                <Text style={[styles.linkText, { color: colors.charcoal }]}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.building }]}
                onPress={handleTerms}
              >
                <FileText size={20} color={colors.mutedBrown} />
                <Text style={[styles.linkText, { color: colors.charcoal }]}>
                  Terms & Conditions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkRow} onPress={handleContactSupport}>
                <Mail size={20} color={colors.mutedBrown} />
                <Text style={[styles.linkText, { color: colors.charcoal }]}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  linksContainer: {
    gap: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  linkText: {
    fontSize: 17,
  },
});
