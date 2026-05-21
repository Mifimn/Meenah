// app/wishlist.tsx
import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import Animated, { 
  FadeInDown, useSharedValue, useAnimatedScrollHandler 
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import GlassHeader from '../components/GlassHeader';
import UniversalBackground from '../components/UniversalBackground';
import { Heart } from 'lucide-react-native';

export default function WishlistScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.pageTitle, { color: theme.text }]}>My Wishlist</Text>
        
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <View key={item} style={[styles.wishlistCard, { backgroundColor: theme.surface }]}>
              <View style={styles.imagePlaceholder}>
                <Heart size={24} color="#EF4444" fill="#EF4444" />
              </View>
              <Text style={[styles.itemName, { color: theme.text }]}>Meenah Pastry {item}</Text>
              <Text style={[styles.itemPrice, { color: theme.primary }]}>$12.00</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 100, paddingBottom: 180 }, // paddingBottom perfectly fixed
  pageTitle: { fontSize: 32, fontWeight: '900', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  wishlistCard: { width: '48%', borderRadius: 24, padding: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  imagePlaceholder: { height: 120, backgroundColor: 'rgba(255,105,180,0.1)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  itemName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '900' }
});
