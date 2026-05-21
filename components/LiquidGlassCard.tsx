// components/LiquidGlassCard.tsx
import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { BlurView } from 'expo-blur';

// --- CUSTOM SHADER CODE ---
// This shader creates the dynamic, "liquid" look by distorting colors based on time and noise.
const LiquidShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#FF69B4') }, // Theme Hot Pink
    uColor2: { value: new THREE.Color('#FFC0CB') }, // Light Pink
    uColor3: { value: new THREE.Color('#fff') },    // White highlight
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

    // Simple noise function
    float noise(vec2 p) {
      return sin(p.x * 10.0 + uTime) * sin(p.y * 10.0 - uTime) * 0.5 + 0.5;
    }

    void main() {
      vec2 p = vUv;
      
      // Create swirling coordinates
      float n = noise(p + vec2(uTime * 0.1));
      vec2 swirl = vec2(
        sin(p.x * 5.0 + n * 3.0 + uTime * 0.2),
        cos(p.y * 5.0 - n * 3.0 + uTime * 0.3)
      );

      // Mix colors based on swirl
      float t = length(swirl) * 0.5;
      vec3 color = mix(uColor1, uColor2, t);
      color = mix(color, uColor3, pow(n, 5.0) * 0.5); // Add bright 'glass' highlights

      // Add a slight 'fresnel' effect (brighter edges)
      float fresnel = pow(1.0 - vUv.y, 2.0) * 0.2;
      color += fresnel;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Internal component to handle the animation frame loop
function LiquidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Custom material using our shader defined above
  const material = useMemo(() => new THREE.ShaderMaterial(LiquidShaderMaterial), []);

  useFrame((state) => {
    if (material) {
      // Update the 'time' uniform every frame to animate the liquid
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      <planeGeometry args={[5, 5]} /> {/* Large plane to cover card */}
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// --- MAIN EXPORTED COMPONENT ---
// This acts as the wrapper for the Three.js Canvas
export default function LiquidGlassCard() {
  return (
    <View style={styles.cardWrapper}>
      {/* 3D Liquid Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 2]} // Support high-res screens
        style={styles.canvas}
      >
        <color attach="background" args={['#fff']} />
        <LiquidPlane />
      </Canvas>

      {/* Optional: Native Blur overlay to blend edges on iOS (looks even more like glass) */}
      {Platform.OS === 'ios' && (
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />
      )}
      
      {/* Subtle white reflective gradient highlight across the top */}
      <View style={styles.reflectionOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    ...StyleSheet.absoluteFillObject, // Covers entire container
    overflow: 'hidden',
    borderRadius: 24,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8, // Slightly transparent to let highlights work
  },
  reflectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)', // Refective white tint
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  }
});