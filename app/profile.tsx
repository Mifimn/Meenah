// app/profile.tsx
import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import GlassHeader from '../components/GlassHeader';
import UniversalBackground from '../components/UniversalBackground';
import { User, Settings, Clock, ChevronRight, LogOut, ShieldCheck } from 'lucide-react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useOfflineData } from '../hooks/useOfflineData';

export default function ProfileScreen() {
  const { user, initialized, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => { scrollY.value = event.contentOffset.y; },
  });

  const menuItems = [
    { title: 'Personal Details', icon: User, route: '/personal-details' },
    { title: 'Order History', icon: Clock, route: '/order-history' },
    { title: 'Settings', icon: Settings, route: '#' },
  ];

  // 🚀 OFFLINE-FIRST HOOK
  const { data: profile, loading } = useOfflineData(`profile_${user?.id}`, async () => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('full_name, member_id, email').eq('id', user.id).single();
    return data;
  });

  if (!initialized) return null;
  if (!user) return <Redirect href="/auth" />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <UniversalBackground />
      <GlassHeader scrollY={scrollY} />

      <Animated.ScrollView 
        onScroll={scrollHandler} scrollEventThrottle={16} entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff', fontSize: 36, fontWeight: 'bold'}}>{profile?.full_name?.charAt(0) || 'M'}</Text>}
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>
            {profile?.full_name || 'Loading...'}
          </Text>
          <Text style={[styles.userTier, { color: theme.icon }]}>
            {profile?.email || user.email}
          </Text>
          
          <View style={[styles.idBadge, { backgroundColor: theme.surface }]}>
            <ShieldCheck size={14} color={theme.primary} />
            <Text style={[styles.idText, { color: theme.text }]}>
              ID: {profile?.member_id || 'Fetching...'}
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.menuItem, { backgroundColor: theme.surface }]} 
                activeOpacity={0.7}
                onPress={() => item.route !== '#' && router.push(item.route as any)}
              >
                <View style={styles.menuLeft}>
                  <Icon size={20} color={theme.primary} />
                  <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color={theme.icon} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={signOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 100 : 120, paddingBottom: 180 },
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, shadowColor: '#FF1493', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  userName: { fontSize: 28, fontWeight: '900', marginBottom: 4, textTransform: 'capitalize' },
  userTier: { fontSize: 14, fontWeight: '600' },
  idBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  idText: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  menuSection: { gap: 12, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuText: { fontSize: 16, fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' }
});
