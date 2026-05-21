// app/user-profile/[id].tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import UniversalBackground from '../../components/UniversalBackground';
import { ArrowLeft, MessageSquare, ShieldCheck, CalendarDays } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

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
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primary }]} />
          
          <Text style={[styles.userName, { color: theme.text }]}>{name || "Meenah Member"}</Text>
          
          <View style={styles.verifiedRow}>
            <ShieldCheck size={16} color={theme.primary} />
            <Text style={[styles.memberId, { color: theme.primary }]}>ID: #{id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <CalendarDays size={18} color={theme.icon} />
            <Text style={[styles.infoText, { color: theme.icon }]}>Joined Meenah Network in 2026</Text>
          </View>

          {/* Message Button */}
          <TouchableOpacity 
            style={[styles.messageBtn, { backgroundColor: theme.primary }]} 
            activeOpacity={0.8}
            onPress={() => router.back()} // Goes right back into the chat
          >
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.messageBtnText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 24, zIndex: 10 },
  glassButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  scrollContent: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 120 : 140, paddingBottom: 40 },
  
  profileCard: { borderRadius: 30, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  userName: { fontSize: 26, fontWeight: '900', marginBottom: 6 },
  
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  memberId: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginBottom: 24 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  infoText: { fontSize: 14, fontWeight: '500' },
  
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', paddingVertical: 16, justifyContent: 'center', borderRadius: 25, elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  messageBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});