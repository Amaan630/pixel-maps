import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { FileText, Mail, Shield } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme, useUiFont } from '../contexts/ThemeContext';
import { UndraggableSheet } from './UndraggableSheet';

const PRIVACY_URL = 'https://syntak.co/pixel-maps/privacy-policy';
const TERMS_URL = 'https://syntak.co/pixel-maps/terms-and-conditions';
const SUPPORT_EMAIL = 'help@syntak.co';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HelpSheet({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const uiFont = useUiFont();

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

  return (
    <UndraggableSheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.charcoal, fontFamily: uiFont }]}>
        Help & Info
      </Text>

      <View style={styles.linksContainer}>
        <TouchableOpacity
          style={[styles.linkRow, { borderBottomColor: colors.building }]}
          onPress={handlePrivacyPolicy}
        >
          <Shield size={20} color={colors.mutedBrown} />
          <Text style={[styles.linkText, { color: colors.charcoal, fontFamily: uiFont }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow, { borderBottomColor: colors.building }]}
          onPress={handleTerms}
        >
          <FileText size={20} color={colors.mutedBrown} />
          <Text style={[styles.linkText, { color: colors.charcoal, fontFamily: uiFont }]}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={handleContactSupport}>
          <Mail size={20} color={colors.mutedBrown} />
          <Text style={[styles.linkText, { color: colors.charcoal, fontFamily: uiFont }]}>
            Contact Support
          </Text>
        </TouchableOpacity>
      </View>
    </UndraggableSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '700',
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
    fontWeight: '600',
  },
});
