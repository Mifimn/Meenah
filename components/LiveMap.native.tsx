// components/LiveMap.native.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

export default function LiveMap({ region, onRegionChangeComplete }: any) {
  return (
    <MapView 
      style={StyleSheet.absoluteFill}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={true}
    />
  );
}
