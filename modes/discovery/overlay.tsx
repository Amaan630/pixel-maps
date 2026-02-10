import React from 'react';
import { StyleSheet, View } from 'react-native';

// Called by MapScreen when discovery mode is active so the user sees fog without extra UI.
export function DiscoveryOverlay() {
  return <View pointerEvents="none" style={styles.overlay} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
