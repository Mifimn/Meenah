// app/home.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, FlatList, ScrollView,
  TouchableOpacity, Image, Platform, StatusBar, Dimensions 
} from 'react-native';
import { 
  MapPin, ChevronDown, ShoppingCart, Bell, 
  Search, SlidersHorizontal, Star, Heart, 
  CalendarDays 
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedScrollHandler 
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router'; // <-- Added Router
import { Colors } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import LiquidGlassCard from '../components/LiquidGlassCard';
import GlassHeader from '../components/GlassHeader';
import UniversalBackground from '../components/UniversalBackground';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; 

const OFFERS_DATA = [
  {
    id: 1,
    badge: "Limited time!",
    title: "Pink Velvet Offer",
    subtitle: "Up to",
    percent: "40%",
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
  },
  {
    id: 2,
    badge: "New Arrival",
    title: "Meenah Croissants",
    subtitle: "Get",
    percent: "20%",
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80'
  },
  {
    id: 3,
    badge: "Weekend Special",
    title: "Strawberry Glaze",
    subtitle: "Save",
    percent: "30%",
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&q=80'
  }
];

export default function HomeScreen() {
  const router = useRouter(); // <-- Initialize Router
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const flatListRef = useRef<FlatList>(null);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = activeOfferIndex + 1;
      if (nextIndex >= OFFERS_DATA.length) nextIndex = 0; 
      
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveOfferIndex(nextIndex);
    }, 5000); 

    return () => clearInterval(timer);
  }, [activeOfferIndex]);

  const getItemLayout = (data: any, index: number) => ({
    length: CARD_WIDTH + 16, offset: (CARD_WIDTH + 16) * index, index,
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const renderOfferItem = ({ item, index }: { item: typeof OFFERS_DATA[0], index: number }) => (
    <View style={[styles.offerCardContainer, { width: CARD_WIDTH }]}>
      <View style={styles.liquidBackgroundWrapper}><LiquidGlassCard /></View>

      <View style={styles.offerContentWrapper}>
        <View style={styles.offerTextContent}>
          <View style={[styles.badge, { backgroundColor: theme.primary }]} ><Text style={styles.badgeText}>{item.badge}</Text></View>
          <Text style={[styles.offerTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.offerSubtitle, { color: theme.text }]}>
            {item.subtitle} <Text style={[styles.offerPercent, { color: theme.primary }]}>{item.percent}</Text>
          </Text>
          <TouchableOpacity style={[styles.shopNowBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: item.image }} style={styles.offerImage} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }} 
      >
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.locationLabel}>Location</Text>
              <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
                <MapPin size={16} color="#FFE4E1" />
                <Text style={styles.locationText}>Lagos, Nigeria</Text>
                <ChevronDown size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.iconRow}>
              {/* --- ROUTED CART ICON --- */}
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => router.push('/cart')}>
                <ShoppingCart size={22} color="#fff" />
              </TouchableOpacity>
              {/* --- ROUTED NOTIFICATIONS ICON --- */}
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
                <Bell size={22} color="#fff" />
                <View style={[styles.notificationDot, { borderColor: theme.primary }]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={[styles.searchInputWrapper, { backgroundColor: theme.surface }]}>
              <Search size={22} color={theme.icon} style={{ marginRight: 10 }} />
              <TextInput placeholder="Search pastries..." placeholderTextColor={theme.icon} style={[styles.searchInput, { color: theme.text }]} />
            </View>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.surface }]} activeOpacity={0.7}>
              <SlidersHorizontal size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Special Offers</Text>
            <TouchableOpacity><Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text></TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef} data={OFFERS_DATA} renderItem={renderOfferItem} horizontal pagingEnabled={false} 
            showsHorizontalScrollIndicator={false} keyExtractor={item => item.id.toString()} getItemLayout={getItemLayout}
            snapToInterval={CARD_WIDTH + 16} decelerationRate="fast" contentContainerStyle={{ paddingRight: 48 }}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
              setActiveOfferIndex(newIndex);
            }}
          />

          <View style={styles.paginationDots}>
            {OFFERS_DATA.map((_, i) => (
              <View key={i} style={[i === activeOfferIndex ? styles.dotActive : styles.dotInactive, { backgroundColor: i === activeOfferIndex ? theme.primary : (colorScheme === 'dark' ? '#374151' : '#E5E7EB') }]} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <TouchableOpacity><Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.categoryRow}>
            {[ { name: "Cup Cake", icon: "🧁" }, { name: "Cookies", icon: "🍪" }, { name: "Donuts", icon: "🍩" }, { name: "Breads", icon: "🥖" } ].map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryItem} activeOpacity={0.7}>
                <View style={[styles.categoryIconCircle, { backgroundColor: theme.surface }]}><Text style={{ fontSize: 32 }}>{cat.icon}</Text></View>
                <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.bookCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=800&q=80' }} style={styles.bookImage} />
            <View style={styles.bookOverlay} />
            <View style={styles.bookContent}>
              <Text style={styles.bookTitle}>Book Custom Services</Text>
              <Text style={styles.bookSubtitle}>Weddings, Birthdays & Events</Text>
              <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.8}>
                <CalendarDays size={16} color={theme.primary} />
                <Text style={[styles.reserveText, { color: theme.primary }]}>Reserve a Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Products</Text>
            <TouchableOpacity><Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, paddingBottom: 10 }}>
            {[1, 2, 3].map((item) => (
              // --- ROUTED PRODUCT CARDS ---
              <TouchableOpacity key={item} style={styles.productCard} activeOpacity={0.9} onPress={() => router.push(`/product/${item}`)}>
                <View style={[styles.productImageContainer, { backgroundColor: theme.surface }]}>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#EAB308" fill="#EAB308" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                  <TouchableOpacity style={styles.heartButton} activeOpacity={0.7}>
                    <Heart size={16} color={item === 1 ? "#EF4444" : theme.icon} fill={item === 1 ? "#EF4444" : "none"} />
                  </TouchableOpacity>
                  <Image source={{ uri: item === 1 ? 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80' : 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80' }} style={styles.productImage} />
                </View>
                <Text style={[styles.productName, { color: theme.text }]}>{item === 1 ? "Pink Velvet Cake" : "Strawberry Cookies"}</Text>
                <Text style={[styles.productPrice, { color: theme.primary }]}>{item === 1 ? "$12.00" : "$8.50"}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, padding: 24, paddingTop: Platform.OS === 'android' ? 60 : 70, paddingBottom: 40, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  locationLabel: { color: '#FFE4E1', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  iconRow: { flexDirection: 'row', gap: 12 },
  iconButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 16 },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 1.5 },
  searchContainer: { flexDirection: 'row', gap: 12 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderRadius: 20, height: 55, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  filterButton: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: 'bold' },
  offerCardContainer: { borderRadius: 24, overflow: 'hidden', height: 180, elevation: 8, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, position: 'relative', marginRight: 16, marginBottom: 10 },
  liquidBackgroundWrapper: { ...StyleSheet.absoluteFillObject },
  offerContentWrapper: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', zIndex: 10 },
  offerTextContent: { flex: 1, padding: 24, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, marginBottom: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  offerTitle: { fontSize: 20, fontWeight: '900', marginBottom: 5 },
  offerSubtitle: { fontSize: 16, fontWeight: '500' },
  offerPercent: { fontSize: 32, fontWeight: '900' },
  shopNowBtn: { alignSelf: 'flex-start', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25, marginTop: 14, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5 },
  shopNowText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  offerImage: { width: 150, height: '100%', position: 'absolute', right: -10, bottom: -10, resizeMode: 'contain' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  dotInactive: { width: 8, height: 8, borderRadius: 4, opacity: 0.3 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryItem: { alignItems: 'center', gap: 10 },
  categoryIconCircle: { width: 75, height: 75, borderRadius: 38, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  categoryName: { fontSize: 14, fontWeight: 'bold' },
  bookCard: { height: 180, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15 },
  bookImage: { position: 'absolute', width: '120%', height: '120%' },
  bookOverlay: { position: 'absolute', width: '120%', height: '120%', backgroundColor: 'rgba(0,0,0,0.4)' },
  bookContent: { zIndex: 10, width: '85%' },
  bookTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 5 },
  bookSubtitle: { color: '#FFE4E1', fontSize: 14, fontWeight: '500', marginBottom: 20 },
  reserveBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  reserveText: { fontSize: 14, fontWeight: 'bold' },
  productCard: { width: 180, marginRight: 18 },
  productImageContainer: { height: 180, borderRadius: 28, overflow: 'hidden', marginBottom: 14, position: 'relative', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10 },
  ratingBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', padding: 8, borderRadius: 20, zIndex: 10, elevation: 3 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productName: { fontSize: 16, fontWeight: 'bold', paddingHorizontal: 6 },
  productPrice: { fontSize: 14, fontWeight: 'bold', paddingHorizontal: 6, marginTop: 4 }
});
