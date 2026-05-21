// app/notifications.tsx
import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import UniversalBackground from '../components/UniversalBackground';
import GlassHeader from '../components/GlassHeader';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Tag, MessageSquare } from 'lucide-react-native';

const DUMMY_NOTIFICATIONS = [
  { id: 1, title: 'Order Arriving Soon!', desc: 'Your Pink Velvet Cake is out for delivery.', time: '2m ago', type: 'order', icon: Package },
  { id: 2, title: 'Flash Sale: 40% Off', desc: 'Use code SWEET40 on all cupcakes today.', time: '1h ago', type: 'promo', icon: Tag },
  { id: 3, title: 'New Message', desc: 'Meenah Baker replied to your custom cake inquiry.', time: 'Yesterday', type: 'message', icon: MessageSquare },
];

export default function NotificationsScreen() {
  const router = useRouter();
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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Notifications</Text>
        </View>

        {DUMMY_NOTIFICATIONS.map((notif) => {
          const Icon = notif.icon;
          return (
            <View key={notif.id} style={[styles.notifCard, { backgroundColor: theme.surface }]}>
              <View style={[styles.iconCircle, { backgroundColor: notif.type === 'order' ? theme.primary : 'rgba(150,150,150,0.1)' }]}>
                <Icon size={20} color={notif.type === 'order' ? '#fff' : theme.text} />
              </View>
              <View style={styles.notifText}>
                <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                <Text style={[styles.notifDesc, { color: theme.icon }]}>{notif.desc}</Text>
              </View>
              <Text style={[styles.notifTime, { color: theme.icon }]}>{notif.time}</Text>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 80 : 100, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageTitle: { fontSize: 28, fontWeight: '900' },
  notifCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  notifText: { flex: 1, marginRight: 8 },
  notifTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  notifDesc: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, fontWeight: '600', alignSelf: 'flex-start', marginTop: 4 }
});
