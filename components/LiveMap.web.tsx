// components/LiveMap.web.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LiveMap({ region, onRegionChangeComplete }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🗺️ Map disabled in Web Preview</Text>
      <Text style={styles.subtext}>Open on your physical Android phone to see the live Google Map!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtext: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8 }
});