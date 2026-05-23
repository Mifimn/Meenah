// app/user-profile/[id].tsx
import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Platform, 
  StatusBar, Image, ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import UniversalBackground from '../../components/UniversalBackground';
import { BlurView } from 'expo-blur';
import { 
  ArrowLeft, MessageSquare, ShieldCheck, CalendarDays, 
  Phone, CreditCard, Star, MapPin, ChevronRight, Image as ImageIcon
} from 'lucide-react-native';

const SHARED_MEDIA = [
  'https://images.unsplash.com/photo-1621236378699-859efab66045?w=500&q=80',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
];

export default function UserProfileScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <UniversalBackground />

      {/* Top Navigation */}
      <View style={[styles.topNav, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <BlurView intensity={40} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.glassButton}>
            <ArrowLeft size={24} color={theme.text} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        entering={FadeInDown.duration(800)}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarLarge, { backgroundColor: theme.primary }]} />
            <View style={[styles.statusBadge, { borderColor: theme.surface }]} />
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>{name || "Meenah Member"}</Text>
          <View style={styles.verifiedRow}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={[styles.memberId, { color: '#10B981' }]}>Verified Buyer • #{id}</Text>
          </View>

          {/* Action Button Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => router.back()}>
              <View style={[styles.actionIconBg, { backgroundColor: theme.primary }]}>
                <MessageSquare size={20} color="#fff" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.icon + '30' }]}>
                <Phone size={20} color={theme.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.icon + '30' }]}>
                <CreditCard size={20} color={theme.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
            <Star size={24} color="#F59E0B" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.text }]}>2,450</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>Loyalty Points</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
            <MapPin size={24} color={theme.primary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>Total Orders</Text>
          </View>
        </View>

        {/* Info List */}
        <View style={[styles.infoList, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
            <View style={styles.infoLeft}>
              <CalendarDays size={20} color={theme.icon} style={{ marginRight: 12 }} />
              <Text style={[styles.infoText, { color: theme.text }]}>Joined Meenah Network</Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.icon }]}>Feb 2026</Text>
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: theme.icon + '20' }]} />
          
          <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
            <View style={styles.infoLeft}>
              <ImageIcon size={20} color={theme.icon} style={{ marginRight: 12 }} />
              <Text style={[styles.infoText, { color: theme.text }]}>Shared Media</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={[styles.infoValue, { color: theme.icon }]}>43</Text>
              <ChevronRight size={16} color={theme.icon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Shared Media Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.mediaScroll}
        >
          {SHARED_MEDIA.map((uri, index) => (
            <Animated.Image 
              key={index} 
              entering={FadeInRight.delay(index * 100).duration(500)}
              source={{ uri }} 
              style={styles.mediaThumbnail} 
            />
          ))}
          <TouchableOpacity style={[styles.viewAllMedia, { backgroundColor: theme.surface }]} activeOpacity={0.7}>
            <Text style={[styles.viewAllText, { color: theme.primary }]}>View{'\n'}All</Text>
          </TouchableOpacity>
        </ScrollView>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 24, zIndex: 10 },
  glassButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 120 : 140, paddingBottom: 60 },
  
  // Profile Card
  profileCard: { borderRadius: 30, padding: 24, alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatarLarge: { width: 110, height: 110, borderRadius: 55, elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  statusBadge: { position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981', borderWidth: 3 },
  userName: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  memberId: { fontSize: 13, fontWeight: 'bold' },

  // Action Buttons
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, width: '100%', paddingHorizontal: 10 },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  actionText: { fontSize: 13, fontWeight: '600' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 24, padding: 20, alignItems: 'center', elevation: 4 },
  statIcon: { marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' },

  // Info List
  infoList: { borderRadius: 24, padding: 8, elevation: 4, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 15, fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 16 },

  // Media Scroll
  mediaScroll: { gap: 12, paddingBottom: 10 },
  mediaThumbnail: { width: 80, height: 80, borderRadius: 16 },
  viewAllMedia: { width: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(150,150,150,0.2)', borderStyle: 'dashed' },
  viewAllText: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' }
});
