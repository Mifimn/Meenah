// components/BackgroundParticles.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BackgroundParticles({ particleColor }: { particleColor: string }) {
  // Reference to the points object so we can animate it
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random X, Y, Z coordinates for 500 particles
  const particlesCount = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      // Spread them out across a 10x10x10 cube
      pos[i] = (Math.random() - 0.5) * 10; 
    }
    return pos;
  }, []);

  // useFrame runs on every screen refresh (like requestAnimationFrame in web)
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.1; // Rotate slowly on Y axis
      pointsRef.current.rotation.x += delta * 0.05; // Rotate slowly on X axis
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
      {/* sizeAttenuation makes particles smaller as they go further away */}
      <pointsMaterial 
        size={0.06} 
        color={particleColor} 
        transparent 
        opacity={0.5} 
        sizeAttenuation={true} 
      />
    </points>
  );
}