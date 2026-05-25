// components/UniversalBackground.tsx
import React, { useRef, useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

function StarField({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesCount = 300; 

  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
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
      <pointsMaterial size={0.04} color={color} transparent opacity={0.6} sizeAttenuation={true} />
    </points>
  );
}

function ShootingStar({ color, speed, offset }: { color: string, speed: number, offset: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x -= delta * speed;
      meshRef.current.position.y -= delta * (speed * 0.6);

      // Reset position when it goes off screen
      if (meshRef.current.position.x < -10 || meshRef.current.position.y < -10) {
        meshRef.current.position.x = 10 + Math.random() * 10 + offset;
        meshRef.current.position.y = 10 + Math.random() * 5 + offset;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[10 + offset, 10 + offset, -5]}>
      {/* A stretched box to look like a streak of light */}
      <boxGeometry args={[1.5, 0.02, 0.02]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

export default function UniversalBackground() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // 🚨 THE FIX: Replit's Web Preview gets a safe, invisible fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.backgroundContainer, { backgroundColor: theme.background }]} pointerEvents="none" />
    );
  }

  // 📱 THE REAL DEAL: Android gets the 3D Starfield
  return (
    <View style={styles.backgroundContainer} pointerEvents="none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <StarField color={theme.primary} />
        <ShootingStar color={theme.primary} speed={15} offset={0} />
        <ShootingStar color="#FFFFFF" speed={20} offset={5} /> 
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, 
  }
});
