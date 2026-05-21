// app/order-history.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import GlassHeader from '../components/GlassHeader';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react-native';

// --- DUMMY ORDER DATA ---
const ORDER_HISTORY = [
  {
    id: 'MN-9082',
    date: 'May 18, 2026',
    status: 'processing',
    items: '1x Pink Velvet Cake, 2x Strawberry Cookies',
    total: 29.00,
  },
  {
    id: 'MN-8841',
    date: 'May 12, 2026',
    status: 'delivered',
    items: '1x Custom Birthday Cake (Vanilla)',
    total: 120.00,
  },
  {
    id: 'MN-8710',
    date: 'April 28, 2026',
    status: 'delivered',
    items: '4x Meenah Croissants',
    total: 24.00,
  },
  {
    id: 'MN-8655',
    date: 'April 15, 2026',
    status: 'cancelled',
    items: '1x Pink Velvet Cake',
    total: 12.00,
  }
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  // Helper function to render the correct status icon and color
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'processing':
        return { icon: Clock, color: '#F59E0B', text: 'Processing', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'delivered':
        return { icon: CheckCircle2, color: '#10B981', text: 'Delivered', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'cancelled':
        return { icon: XCircle, color: '#EF4444', text: 'Cancelled', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { icon: Package, color: theme.icon, text: 'Unknown', bg: 'transparent' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]} activeOpacity={0.7}>
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Order History</Text>
        </View>

        {/* Order List */}
        <View style={styles.listContainer}>
          {ORDER_HISTORY.map((order, index) => {
            const statusInfo = getStatusDetails(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <TouchableOpacity 
                key={order.id} 
                style={[styles.orderCard, { backgroundColor: theme.surface }]}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.orderIdGroup}>
                    <Package size={18} color={theme.primary} />
                    <Text style={[styles.orderIdText, { color: theme.text }]}>Order #{order.id}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: theme.icon }]}>{order.date}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={[styles.itemsText, { color: theme.text }]} numberOfLines={2}>
                  {order.items}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <StatusIcon size={14} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                  </View>
                  
                  <View style={styles.priceGroup}>
                    <Text style={[styles.totalText, { color: theme.text }]}>${order.total.toFixed(2)}</Text>
                    <ChevronRight size={18} color={theme.icon} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 80 : 100, paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageTitle: { fontSize: 26, fontWeight: '900' },

  listContainer: { gap: 16 },
  
  orderCard: { borderRadius: 24, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderIdGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderIdText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 12, fontWeight: '500' },
  
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginBottom: 12 },
  
  itemsText: { fontSize: 14, lineHeight: 20, marginBottom: 16, opacity: 0.8 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  priceGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  totalText: { fontSize: 18, fontWeight: '900' }
});