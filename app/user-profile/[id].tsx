// app/user-profile/[id].tsx
import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Platform, 
  StatusBar, ScrollView, ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import UniversalBackground from '../../components/UniversalBackground';
import { BlurView } from 'expo-blur';
import { 
  ArrowLeft, MessageCircle, PhoneCall, Wallet, 
  ShieldCheck, Star, Calendar, ChevronRight, Image as ImageIcon
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useOfflineData } from '../../hooks/useOfflineData';
import { useAuth } from '../../context/AuthContext'; // Added Auth context

const SHARED_MEDIA = [
  'https://images.unsplash.com/photo-1621236378699-859efab66045?w=500&q=80',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
];

export default function UserProfileScreen() {
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth(); // Grab the logged-in user
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // 🚀 FIXED OFFLINE HOOK: Finds the correct user ID before fetching
  const { data: profile, loading } = useOfflineData(`profile_view_${id}`, async () => {
    if (!id || !user) return null;

    // 1. Check if the 'id' we received is actually a conversation ID
    const { data: convo } = await supabase.from('conversations').select('participant1_id, participant2_id').eq('id', id).single();
    
    let targetUserId = id; // Default to assuming it's a direct user ID
    
    if (convo) {
      // 2. If it IS a conversation, figure out who the OTHER person is
      targetUserId = convo.participant1_id === user.id ? convo.participant2_id : convo.participant1_id;
    }

    // 3. Fetch the real Member ID using the correct user ID
    const { data } = await supabase.from('profiles').select('member_id').eq('id', targetUserId).single();
    return data;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <UniversalBackground />

      {/* Floating Back Button */}
      <View style={[styles.topNav, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <BlurView intensity={60} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.glassButton}>
            <ArrowLeft size={22} color={theme.text} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Abstract Cover Photo Area */}
        <Animated.View entering={FadeInDown.duration(600)} style={[styles.coverArea, { backgroundColor: theme.primary + '20' }]}>
           <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.contentWrapper}>
          
          {/* Overlapping Avatar & Header */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarLarge, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold' }}>{(name as string)?.charAt(0) || 'M'}</Text>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: theme.background }]}>
                <ShieldCheck size={16} color="#10B981" />
              </View>
            </View>
            
            <View style={styles.titleArea}>
              <Text style={[styles.userName, { color: theme.text }]}>{name || "Meenah Member"}</Text>
              <Text style={[styles.memberTitle, { color: theme.icon }]}>Verified Member</Text>
            </View>
          </Animated.View>

          {/* Action Pills */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionPill, styles.primaryPill, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={() => router.back()}>
              <MessageCircle size={18} color="#fff" />
              <Text style={styles.primaryPillText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: theme.surface }]} activeOpacity={0.8}>
              <PhoneCall size={18} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionPill, { backgroundColor: theme.surface }]} activeOpacity={0.8}>
              <Wallet size={18} color={theme.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Glassmorphic Stats Panel */}
          <Animated.View entering={FadeInUp.duration(600).delay(300)} style={[styles.statsPanel, { backgroundColor: theme.surface }]}>
            <View style={styles.statItem}>
              <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Star size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>2,450</Text>
              <Text style={[styles.statLabel, { color: theme.icon }]}>Points</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.icon + '20' }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconWrapper, { backgroundColor: theme.primary + '15' }]}>
                <ShieldCheck size={20} color={theme.primary} />
              </View>
              {loading ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginBottom: 2 }} />
              ) : (
                <Text style={[styles.statValue, { color: theme.text, fontSize: 16 }]} numberOfLines={1}>
                  {profile?.member_id || 'Fetching...'}
                </Text>
              )}
              <Text style={[styles.statLabel, { color: theme.icon }]}>Member ID</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.icon + '20' }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Calendar size={20} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>Feb</Text>
              <Text style={[styles.statLabel, { color: theme.icon }]}>2026</Text>
            </View>
          </Animated.View>

          {/* Media Grid Section */}
          <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.mediaSection}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={20} color={theme.text} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Shared Media</Text>
              </View>
              <TouchableOpacity style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
                <ChevronRight size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.mediaGrid}>
              {SHARED_MEDIA.map((uri, index) => (
                <Animated.Image 
                  key={index}
                  entering={SlideInRight.delay(400 + (index * 100)).duration(500)}
                  source={{ uri }} 
                  style={styles.gridImage} 
                />
              ))}
            </View>
          </Animated.View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 20, zIndex: 10 },
  glassButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  
  coverArea: { height: 180, width: '100%', overflow: 'hidden', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  contentWrapper: { paddingHorizontal: 20, marginTop: -60 },
  
  headerSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'transparent', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  titleArea: { alignItems: 'center' },
  userName: { fontSize: 26, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  memberTitle: { fontSize: 14, fontWeight: '600' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 30 },
  actionPill: { height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, elevation: 2 },
  primaryPill: { flex: 1, maxWidth: 200, gap: 8 },
  primaryPillText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  statsPanel: { flexDirection: 'row', borderRadius: 24, paddingVertical: 20, elevation: 2, marginBottom: 30 },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statDivider: { width: 1, height: '60%', alignSelf: 'center' },

  mediaSection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 14, fontWeight: 'bold' },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  gridImage: { width: '48%', aspectRatio: 1, borderRadius: 20 }
});
