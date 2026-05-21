// app/cart.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Image, Platform } from 'react-native';
import Animated, { FadeInDown, SlideInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import GlassHeader from '../components/GlassHeader';
import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react-native';

const DUMMY_CART = [
  { id: 1, name: 'Pink Velvet Cake', price: 12.00, qty: 1, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80' },
  { id: 2, name: 'Strawberry Cookies', price: 8.50, qty: 2, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80' }
];

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [cart, setCart] = useState(DUMMY_CART);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const updateQty = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.text }]}>My Cart</Text>
        </View>

        {cart.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.icon }]}>Your cart is empty.</Text>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={[styles.cartCard, { backgroundColor: theme.surface }]}>
              <Image source={{ uri: item.image }} style={styles.cartImage} />
              
              <View style={styles.cartInfo}>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
                
                <View style={styles.actionRow}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                      <Minus size={14} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: theme.text }]}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                      <Plus size={14} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </Animated.ScrollView>

      {/* Glossy Bottom Checkout Bar */}
      {cart.length > 0 && (
        <Animated.View entering={SlideInDown.duration(600).delay(200)} style={styles.bottomCartBar}>
          <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={styles.cartContent}>
            <View>
              <Text style={[styles.totalLabel, { color: theme.icon }]}>Subtotal</Text>
              <Text style={[styles.totalPrice, { color: theme.text }]}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 80 : 100, paddingBottom: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageTitle: { fontSize: 28, fontWeight: '900' },
  emptyText: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  
  cartCard: { flexDirection: 'row', padding: 12, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cartImage: { width: 80, height: 80, borderRadius: 16, marginRight: 16 },
  cartInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 20, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 12 },
  deleteBtn: { padding: 8 },

  bottomCartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 110 : 90, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', elevation: 20 },
  cartContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  totalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  totalPrice: { fontSize: 24, fontWeight: '900' },
  checkoutBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
