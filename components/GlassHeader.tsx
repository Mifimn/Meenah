// components/GlassHeader.tsx
import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

// --- 3D STAR PARTICLES ---
function StarParticles({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesCount = 100; // Slightly less dense for a cleaner look
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={positions.length / 3} 
          array={positions} 
          itemSize={3} 
        />
      </bufferGeometry>
      {/* Reduced opacity of stars to match the lighter glass */}
      <pointsMaterial size={0.06} color={color} transparent opacity={0.4} sizeAttenuation={true} />
    </points>
  );
}

// --- GLOBAL HEADER EXPORT ---
export default function GlassHeader({ scrollY }: { scrollY: SharedValue<number> }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Smoother fade-in without the drop-down bounce
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [20, 80], [0, 1], 'clamp'),
    };
  });

  return (
    <Animated.View style={[styles.headerContainer, animatedStyle]} pointerEvents="none">
      <View style={styles.jellyWrapper}>
        
        {/* Lighter, softer Frosted Blur */}
        <BlurView 
          intensity={40} // Thinned out significantly 
          tint={colorScheme === 'dark' ? 'dark' : 'light'} 
          style={StyleSheet.absoluteFill} 
        />
        
        {/* Very sheer tint overlay (just barely pink) */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.primary, opacity: 0.05 }]} />

        {/* 3D Animated Stars */}
        <View style={StyleSheet.absoluteFill}>
          <Canvas camera={{ position: [0, 0, 3] }}>
            <StarParticles color={theme.primary} />
          </Canvas>
        </View>

        {/* Barely-there highlight to blend the edge into the content */}
        <View style={styles.glassHighlight} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0,
    height: Platform.OS === 'android' ? 65 : 95, // Much shorter height
    zIndex: 100,
  },
  jellyWrapper: {
    flex: 1,
    borderBottomLeftRadius: 24, // Softer curve to blend better
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    // Removed all shadows so it doesn't look like a detached block
  },
  glassHighlight: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)', // Very soft rim
  }
});
