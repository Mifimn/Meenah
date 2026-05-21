// app/index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  interpolate,
  FadeInRight,
  FadeInDown,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Canvas } from '@react-three/fiber';
import BackgroundParticles from '../components/BackgroundParticles';

const { width } = Dimensions.get('window');

// Meenah Custom Onboarding Data
const SLIDES = [
  {
    id: 1,
    title: "Welcome to Meenah",
    description: "Experience the art of fine baking. Every morning, we prepare our signature pink pastries with love.",
    image: "🧁" 
  },
  {
    id: 2,
    title: "Fast Delivery",
    description: "Your favorite Meenah treats delivered straight to your doorstep while they are still oven-warm.",
    image: "🚚"
  },
  {
    id: 3,
    title: "Custom Orders",
    description: "Reserve dates for weddings, birthdays, and special events directly through the Meenah app.",
    image: "🎂"
  }
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Loading Animation Values
  const ballY = useSharedValue(0);
  const shadowScale = useSharedValue(1);

  useEffect(() => {
    // 1. Bouncing Ball Animation (Loading State)
    ballY.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 600 }), 
        withTiming(0, { duration: 400 })
      ),
      -1, 
      true 
    );

    shadowScale.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 600 }), 
        withTiming(1.2, { duration: 400 })
      ),
      -1,
      true
    );

    // 2. Transition to Slides after 3.5 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3500);
  }, []);

  const animatedBall = useAnimatedStyle(() => ({
    transform: [{ translateY: ballY.value }],
  }));

  const animatedShadow = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
    opacity: interpolate(ballY.value, [0, -60], [0.4, 0.1]),
  }));

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Moves seamlessly to the Home Screen
      router.replace('/home'); 
    }
  };

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Animated.View style={[styles.ball, { backgroundColor: theme.primary }, animatedBall]} />
        <Animated.View style={[styles.shadow, animatedShadow]} />
        <Text style={[styles.loadingText, { color: theme.primary }]}>Meenah...</Text>
      </View>
    );
  }

  // --- ONBOARDING SLIDESHOW ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* 3D BACKGROUND CANVAS */}
      <View style={StyleSheet.absoluteFillObject}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <BackgroundParticles particleColor={theme.primary} />
        </Canvas>
      </View>
      
      {/* Slide Content with Slowed-Down Fly-In Animations */}
      <View style={styles.slideArea}>
        <Animated.View 
          key={currentSlide} 
          entering={SlideInRight.duration(1000)} 
          exiting={SlideOutLeft.duration(1000)}
          style={styles.animatedSlideContainer}
        >
          <Animated.Text 
            entering={FadeInDown.delay(200).duration(1200)} 
            style={styles.emoji}
          >
            {SLIDES[currentSlide].image}
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInRight.delay(600).duration(1200)} 
            style={[styles.title, { color: theme.primary }]}
          >
            {SLIDES[currentSlide].title}
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInRight.delay(1000).duration(1200)} 
            style={[styles.description, { color: theme.text }]}
          >
            {SLIDES[currentSlide].description}
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <Animated.View 
            key={i} 
            style={[
              styles.dot, 
              { backgroundColor: i === currentSlide ? theme.primary : (colorScheme === 'dark' ? '#374151' : '#E5E7EB'),
                width: i === currentSlide ? 24 : 8 }
            ]} 
          />
        ))}
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={[styles.skipText, { color: theme.text }]}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? "Enter Meenah" : "Next"}
          </Text>
          <ChevronRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  
  // Loading Styles
  ball: { width: 40, height: 40, borderRadius: 20, marginBottom: 10 },
  shadow: { width: 40, height: 10, backgroundColor: '#000', borderRadius: 20, opacity: 0.2 },
  loadingText: { marginTop: 20, fontSize: 22, fontWeight: '900', letterSpacing: 2 },

  // Onboarding Styles
  slideArea: { flex: 0.7, justifyContent: 'center', alignItems: 'center', width: '100%' },
  animatedSlideContainer: { alignItems: 'center', width: width * 0.9 },
  emoji: { fontSize: 90, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  
  pagination: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: { height: 8, borderRadius: 4 },

  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%',
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 50
  },
  skipText: { fontSize: 16, fontWeight: '600', opacity: 0.5 },
  nextButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 25, 
    borderRadius: 30,
    gap: 10,
    elevation: 5,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});