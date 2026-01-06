import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '../../contexts/SubscriptionContext';

export function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { presentPaywall, restorePurchases, isLoading } = useSubscription();

  useEffect(() => {
    if (isLoading) return;

    // Delay to allow system dialogs (like location permission) to fully dismiss
    const timeout = setTimeout(() => {
      presentPaywall();
    }, 500);

    return () => clearTimeout(timeout);
  }, [isLoading, presentPaywall]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pixel Maps Pro</Text>
        <Text style={styles.subtitle}>Subscribe to continue using the app</Text>
      </View>

      <View style={[styles.buttons, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.subscribeButton} onPress={presentPaywall}>
          <Text style={styles.subscribeText}>Subscribe</Text>
        </Pressable>

        <Pressable style={styles.restoreButton} onPress={restorePurchases}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  buttons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: '#999999',
  },
});
