// components/BottomNav.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { Home, Heart, MessageSquare, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

// --- ANIMATED NAV ITEM COMPONENT ---
// We create a separate component for each item so they can animate independently
const NavItem = ({ item, isActive, onPress, theme }: any) => {
  const Icon = item.icon;

  // 1. Lifts the icon up and scales it slightly when active
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(isActive ? -18 : 0, { damping: 12, stiffness: 100 }) },
      { scale: withSpring(isActive ? 1.2 : 1) }
    ]
  }));

  // 2. Creates a 3D "cast shadow" beneath the floating icon
  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isActive ? 1 : 0) }],
    opacity: withSpring(isActive ? 0.3 : 0)
  }));

  return (
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {/* Floating Icon */}
        <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
          <Icon size={24} color={isActive ? theme.primary : theme.icon} />
        </Animated.View>
        
        {/* 3D Cast Shadow on the floor */}
        <Animated.View style={[styles.castShadow, shadowAnimatedStyle, { backgroundColor: theme.primary }]} />
      </View>

      <Text style={[styles.navText, { color: isActive ? theme.primary : theme.icon }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// --- MAIN BOTTOM NAV COMPONENT ---
export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname(); 
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const navItems = [
    { name: "Home", route: "/home", icon: Home },
    { name: "Wishlist", route: "/wishlist", icon: Heart },
    { name: "Chat", route: "/chat", icon: MessageSquare },
    { name: "Profile", route: "/profile", icon: User }
  ];

  return (
    <View style={styles.bottomNavContainer}>
      <View style={[styles.bottomNav, { backgroundColor: theme.surface }]}>
        
        {/* Top edge highlight for 3D realism */}
        <View style={styles.topEdgeHighlight} />

        {navItems.map((item, i) => (
          <NavItem 
            key={i} 
            item={item} 
            isActive={pathname === item.route} 
            onPress={() => router.replace(item.route as any)} 
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  bottomNavContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    width: '100%',
  },
  bottomNav: { 
    flexDirection: 'row', 
    width: '100%', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    paddingTop: 16, 
    // Adds extra padding at the bottom for modern phones without home buttons
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, 
    paddingHorizontal: 28, 
    justifyContent: 'space-between', 
    
    // 3D Upward Shadow
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 24 
  },
  topEdgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)', // Glossy top rim
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  navItem: { 
    alignItems: 'center', 
    width: 60,
  },
  iconContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    zIndex: 10,
  },
  castShadow: {
    position: 'absolute',
    bottom: -2,
    width: 16,
    height: 4,
    borderRadius: 4,
  },
  navText: { 
    fontSize: 11, 
    fontWeight: 'bold',
  }
});
